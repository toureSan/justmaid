// Supabase Edge Function - Synchroniser un abonnement depuis Stripe
// Appelé après le retour de Stripe Checkout pour créer l'entrée dans la DB
// Deploy: supabase functions deploy sync-subscription --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, customerEmail } = await req.json();

    if (!userId || !customerEmail) {
      throw new Error("userId et customerEmail requis");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Chercher le customer Stripe par email
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Aucun customer Stripe trouvé", synced: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const customer = customers.data[0];

    // Récupérer tous les abonnements actifs de ce customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
    });

    let syncedCount = 0;

    for (const subscription of subscriptions.data) {
      // Vérifier si l'abonnement existe déjà dans Supabase
      const { data: existing } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", subscription.id)
        .single();

      if (existing) {
        // Mettre à jour l'abonnement existant
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
      } else {
        // Créer l'abonnement
        const metadata = subscription.metadata;
        const priceAmount = subscription.items.data[0]?.price?.unit_amount || 0;
        
        // Récupérer les extras depuis les metadata
        let extras = null;
        let extrasTotal = null;
        if (metadata.extras) {
          try {
            extras = JSON.parse(metadata.extras);
          } catch (e) {
            console.error("Error parsing extras:", e);
          }
        }
        if (metadata.extras_total) {
          extrasTotal = parseFloat(metadata.extras_total);
        }

        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customer.id,
            status: "active",
            frequency: (metadata.frequency as "weekly" | "biweekly" | "monthly") || "weekly",
            duration_hours: parseInt(metadata.duration_hours) || 3,
            address: metadata.address || "Adresse non spécifiée",
            address_details: metadata.address_details || null,
            preferred_day: metadata.preferred_day || null,
            preferred_time: metadata.preferred_time || "09:00",
            price_per_session: priceAmount / 100,
            next_billing_date: new Date(subscription.current_period_end * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            extras: extras,
            extras_total: extrasTotal,
          });

        if (insertError) {
          console.error("Error inserting subscription:", insertError);
        } else {
          syncedCount++;
        }
      }
    }

    // Aussi synchroniser les abonnements annulés (cancel_at_period_end)
    const cancellingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
    });

    for (const subscription of cancellingSubscriptions.data) {
      if (subscription.cancel_at_period_end && subscription.status === "active") {
        await supabase
          .from("subscriptions")
          .update({
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${syncedCount} abonnement(s) synchronisé(s)`,
        synced: syncedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Sync subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
