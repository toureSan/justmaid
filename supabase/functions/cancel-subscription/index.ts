// Supabase Edge Function pour annuler un abonnement Stripe
// Deploy: supabase functions deploy cancel-subscription --no-verify-jwt

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
    const { subscriptionId, cancelImmediately = false } = await req.json();

    if (!subscriptionId) {
      throw new Error("ID d'abonnement manquant");
    }

    // Initialiser Supabase pour mettre à jour la DB
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer l'abonnement Stripe pour vérification
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      throw new Error("Abonnement non trouvé");
    }

    let cancelledSubscription: Stripe.Subscription;

    if (cancelImmediately) {
      // Annuler immédiatement
      cancelledSubscription = await stripe.subscriptions.cancel(subscriptionId);
    } else {
      // Annuler à la fin de la période en cours (plus user-friendly)
      cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Mettre à jour dans Supabase
    const { error: dbError } = await supabase
      .from("subscriptions")
      .update({
        status: cancelImmediately ? "cancelled" : "active", // Reste actif jusqu'à la fin de période
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (dbError) {
      console.error("Erreur DB lors de l'annulation:", dbError);
      // On continue quand même car Stripe a bien annulé
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: cancelImmediately 
          ? "Abonnement annulé immédiatement" 
          : "Abonnement annulé à la fin de la période en cours",
        cancelAt: cancelledSubscription.cancel_at 
          ? new Date(cancelledSubscription.cancel_at * 1000).toISOString()
          : null,
        currentPeriodEnd: new Date(cancelledSubscription.current_period_end * 1000).toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
