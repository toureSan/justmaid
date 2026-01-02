// Supabase Edge Function pour annuler une pré-autorisation
// À appeler si le client annule la réservation AVANT le ménage
// Deploy: supabase functions deploy cancel-payment --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

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
    const { paymentIntentId, bookingId, reason } = await req.json();

    if (!paymentIntentId) {
      throw new Error("paymentIntentId est requis");
    }

    // Récupérer le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Si le paiement est en attente de capture, on l'annule
    if (paymentIntent.status === "requires_capture") {
      const canceledPayment = await stripe.paymentIntents.cancel(paymentIntentId, {
        cancellation_reason: "requested_by_customer",
      });

      return new Response(
        JSON.stringify({
          success: true,
          paymentIntentId: canceledPayment.id,
          status: canceledPayment.status,
          message: "Pré-autorisation annulée avec succès",
          bookingId,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Si le paiement a déjà été capturé, on doit faire un remboursement
    if (paymentIntent.status === "succeeded") {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        reason: "requested_by_customer",
      });

      return new Response(
        JSON.stringify({
          success: true,
          refundId: refund.id,
          status: refund.status,
          amountRefunded: refund.amount,
          message: "Paiement remboursé avec succès",
          bookingId,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    throw new Error(`Impossible d'annuler le paiement. Statut: ${paymentIntent.status}`);

  } catch (error) {
    console.error("Cancel error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
