// Supabase Edge Function pour capturer un paiement pré-autorisé
// À appeler APRÈS que le ménage soit terminé
// Deploy: supabase functions deploy capture-payment --no-verify-jwt

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
    const { paymentIntentId, amountToCapture, bookingId } = await req.json();

    if (!paymentIntentId) {
      throw new Error("paymentIntentId est requis");
    }

    // Récupérer le PaymentIntent pour vérifier son statut
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "requires_capture") {
      throw new Error(`Le paiement ne peut pas être capturé. Statut: ${paymentIntent.status}`);
    }

    // Capturer le paiement
    // On peut capturer un montant inférieur ou égal au montant pré-autorisé
    const capturedPayment = await stripe.paymentIntents.capture(paymentIntentId, {
      // Si amountToCapture est fourni, on capture ce montant spécifique
      // Sinon, on capture le montant total pré-autorisé
      ...(amountToCapture && { amount_to_capture: amountToCapture }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntentId: capturedPayment.id,
        status: capturedPayment.status,
        amountCaptured: capturedPayment.amount_received,
        currency: capturedPayment.currency,
        bookingId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Capture error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
