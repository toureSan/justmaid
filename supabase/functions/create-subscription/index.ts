// Supabase Edge Function pour créer un abonnement Stripe
// Deploy: supabase functions deploy create-subscription --no-verify-jwt

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

// Mapping des fréquences vers les intervalles Stripe
const frequencyToInterval: Record<string, { interval: "week" | "month"; interval_count: number }> = {
  weekly: { interval: "week", interval_count: 1 },
  biweekly: { interval: "week", interval_count: 2 },
  monthly: { interval: "month", interval_count: 1 },
};

// Réduction par fréquence (en CHF/heure) - cohérent avec le frontend
const frequencyDiscountPerHour: Record<string, number> = {
  weekly: 2,    // -2 CHF/h pour hebdo
  biweekly: 2,  // -2 CHF/h pour bi-hebdo
  monthly: 2,   // -2 CHF/h pour mensuel
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      userId,
      customerEmail,
      customerName,
      frequency,        // 'weekly' | 'biweekly' | 'monthly'
      durationHours,    // Durée du ménage en heures
      address,
      addressDetails,
      preferredDay,     // ex: 'monday', 'tuesday'...
      preferredTime,    // ex: '09:00'
      baseHourlyRate,   // Prix horaire de base (45 CHF)
      extras,           // Array d'extras [{name, price}]
      extrasTotal,      // Total des extras en CHF
      successUrl,
      cancelUrl,
    } = await req.json();

    // Validation
    if (!userId || !customerEmail || !frequency || !durationHours || !address || !preferredTime) {
      throw new Error("Paramètres manquants");
    }

    const intervalConfig = frequencyToInterval[frequency];
    if (!intervalConfig) {
      throw new Error("Fréquence invalide");
    }

    // Calculer le prix avec réduction (2 CHF/h pour les abonnements)
    const discountPerHour = frequencyDiscountPerHour[frequency] || 0;
    const hourlyRate = baseHourlyRate || 45;
    const discountedRate = hourlyRate - discountPerHour;
    const basePrice = discountedRate * durationHours;
    const extrasTotalAmount = extrasTotal || 0;
    const pricePerSession = Math.round((basePrice + extrasTotalAmount) * 100); // en centimes

    // Créer ou récupérer le customer Stripe
    let customer: Stripe.Customer;
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          supabase_user_id: userId,
        },
      });
    }

    // Créer un produit et prix pour cet abonnement
    const extrasDescription = extras && extras.length > 0 
      ? ` + ${extras.map((e: {name: string; price: number}) => e.name).join(', ')}`
      : '';
    const product = await stripe.products.create({
      name: `Abonnement ménage - ${durationHours}h ${frequency === 'weekly' ? 'par semaine' : frequency === 'biweekly' ? 'toutes les 2 semaines' : 'par mois'}${extrasDescription}`,
      description: `Ménage récurrent à ${address}${extrasDescription ? ` (${extrasDescription})` : ''}`,
      metadata: {
        user_id: userId,
        frequency,
        duration_hours: durationHours.toString(),
        extras: extras ? JSON.stringify(extras) : '',
        extras_total: extrasTotalAmount.toString(),
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: pricePerSession,
      currency: "chf",
      recurring: intervalConfig,
    });

    // Créer la session Checkout pour l'abonnement
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          user_id: userId,
          frequency,
          duration_hours: durationHours.toString(),
          address,
          address_details: addressDetails || "",
          preferred_day: preferredDay || "",
          preferred_time: preferredTime,
          extras: extras ? JSON.stringify(extras) : "",
          extras_total: extrasTotalAmount.toString(),
        },
      },
      metadata: {
        user_id: userId,
        type: "subscription",
        frequency,
      },
    });

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
        customerId: customer.id,
        pricePerSession: pricePerSession / 100, // Retourner en CHF
        discountPerHour,
        extrasTotal: extrasTotalAmount,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Stripe subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
