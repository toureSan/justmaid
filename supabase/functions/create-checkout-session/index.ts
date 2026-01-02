// Supabase Edge Function pour créer une session Stripe Checkout avec pré-autorisation
// Deploy: supabase functions deploy create-checkout-session --no-verify-jwt

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
    const { amount, bookingId, customerEmail, successUrl, cancelUrl } = await req.json();

    // Créer la session Stripe Checkout avec pré-autorisation
    // Le montant est pré-autorisé mais PAS débité immédiatement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "chf",
            product_data: {
              name: "Ménage à domicile - justmaid",
              description: `Réservation #${bookingId || "nouvelle"} - Pré-autorisation`,
            },
            unit_amount: amount, // Montant TOTAL en centimes (ex: 7500 = 75 CHF)
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bookingId: bookingId || "",
        type: "preauthorization",
      },
      // ⚠️ CLÉ IMPORTANTE: capture_method: "manual" 
      // Cela crée une pré-autorisation au lieu d'un paiement immédiat
      payment_intent_data: {
        capture_method: "manual", // Pré-autorisation - on capture plus tard
        metadata: {
          bookingId: bookingId || "",
        },
      },
    });

    return new Response(
      JSON.stringify({ 
        url: session.url, 
        sessionId: session.id,
        // On retourne le payment_intent pour pouvoir le capturer plus tard
        paymentIntentId: session.payment_intent,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Stripe error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
