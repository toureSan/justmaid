// Supabase Edge Function - CRON job pour auto-capturer les paiements
// Logique: Si la date de l'intervention est passée et pas d'annulation → on capture
// Deploy: supabase functions deploy auto-capture-payments

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Note: SUPABASE_URL est automatiquement disponible dans les Edge Functions
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
// On utilise SERVICE_ROLE_KEY car les secrets ne peuvent pas commencer par SUPABASE_
const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Date actuelle
    const now = new Date().toISOString();

    // Trouver les réservations à auto-capturer:
    // - Date de l'intervention passée
    // - Statut "confirmed" ou "pending" (pas annulé)
    // - payment_status = "authorized" (pré-autorisé mais pas encore capturé)
    // - payment_intent_id existe
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, payment_intent_id, total_price, scheduled_date, scheduled_time, user_id")
      .in("status", ["confirmed", "pending", "completed"])
      .eq("payment_status", "authorized")
      .lt("scheduled_date", now.split("T")[0]) // Date passée
      .not("payment_intent_id", "is", null);

    if (error) {
      throw error;
    }

    console.log(`📋 Trouvé ${bookings?.length || 0} réservations à capturer`);

    const results = [];

    for (const booking of bookings || []) {
      try {
        // Vérifier le statut du PaymentIntent
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment_intent_id);

        if (paymentIntent.status === "requires_capture") {
          // Capturer le paiement
          const captured = await stripe.paymentIntents.capture(booking.payment_intent_id);

          // Mettre à jour la réservation
          await supabase
            .from("bookings")
            .update({
              status: "completed",
              payment_status: "captured",
              payment_captured_at: new Date().toISOString(),
            })
            .eq("id", booking.id);

          results.push({
            bookingId: booking.id,
            status: "captured",
            amount: captured.amount_received / 100, // En CHF
          });

          console.log(`✅ Capturé booking ${booking.id}: ${captured.amount_received / 100} CHF`);
        } else if (paymentIntent.status === "succeeded") {
          // Déjà capturé, mettre à jour le statut
          await supabase
            .from("bookings")
            .update({
              payment_status: "captured",
            })
            .eq("id", booking.id);

          results.push({
            bookingId: booking.id,
            status: "already_captured",
          });
        } else if (paymentIntent.status === "canceled") {
          // Pré-autorisation expirée ou annulée
          await supabase
            .from("bookings")
            .update({
              payment_status: "expired",
            })
            .eq("id", booking.id);

          results.push({
            bookingId: booking.id,
            status: "expired",
            reason: "Pré-autorisation expirée",
          });

          console.log(`⚠️ Booking ${booking.id}: pré-autorisation expirée`);
        } else {
          results.push({
            bookingId: booking.id,
            status: "skipped",
            reason: `PaymentIntent status: ${paymentIntent.status}`,
          });
        }
      } catch (err) {
        console.error(`❌ Erreur booking ${booking.id}:`, err.message);
        results.push({
          bookingId: booking.id,
          status: "error",
          error: err.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        processed: bookings?.length || 0,
        results,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Auto-capture error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
