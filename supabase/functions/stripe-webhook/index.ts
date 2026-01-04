// Supabase Edge Function - Webhook Stripe
// Reçoit les événements Stripe et met à jour la base de données
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Vérifier la signature du webhook (optionnel en dev, requis en prod)
    if (stripeWebhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      // Mode développement sans vérification de signature
      event = JSON.parse(body);
    }

    console.log("Received Stripe event:", event.type);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Gérer les différents types d'événements
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Vérifier si c'est un abonnement
        if (session.mode === "subscription" && session.subscription) {
          const subscriptionId = typeof session.subscription === "string" 
            ? session.subscription 
            : session.subscription.id;
          
          // Récupérer les détails de l'abonnement
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const metadata = subscription.metadata;

          // Créer l'entrée dans Supabase
          const { error: insertError } = await supabase
            .from("subscriptions")
            .insert({
              user_id: metadata.user_id,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: typeof subscription.customer === "string" 
                ? subscription.customer 
                : subscription.customer.id,
              status: "active",
              frequency: metadata.frequency as "weekly" | "biweekly" | "monthly",
              duration_hours: parseInt(metadata.duration_hours) || 3,
              address: metadata.address || "",
              address_details: metadata.address_details || null,
              preferred_day: metadata.preferred_day || null,
              preferred_time: metadata.preferred_time || "09:00",
              price_per_session: (subscription.items.data[0]?.price?.unit_amount || 0) / 100,
              next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            });

          if (insertError) {
            console.error("Error inserting subscription:", insertError);
            throw insertError;
          }

          console.log("Subscription created in database:", subscription.id);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Mettre à jour l'abonnement dans Supabase
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status === "active" ? "active" : 
                   subscription.status === "past_due" ? "past_due" :
                   subscription.status === "canceled" ? "cancelled" : "active",
            next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelled_at: subscription.canceled_at 
              ? new Date(subscription.canceled_at * 1000).toISOString() 
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Marquer l'abonnement comme annulé
        const { error: deleteError } = await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (deleteError) {
          console.error("Error cancelling subscription:", deleteError);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscriptionId = typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id;

          // Mettre à jour la prochaine date de facturation
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          await supabase
            .from("subscriptions")
            .update({
              next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscriptionId = typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id;

          // Marquer comme en retard de paiement
          await supabase
            .from("subscriptions")
            .update({
              status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
