// Service de gestion des abonnements Stripe
// Gère la création, la liste et l'annulation des abonnements

import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Subscription, SubscriptionFrequency } from "@/types/database";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface CreateSubscriptionParams {
  userId: string;
  customerEmail: string;
  customerName?: string;
  frequency: SubscriptionFrequency;
  durationHours: number;
  address: string;
  addressDetails?: string;
  preferredDay?: string;
  preferredTime: string;
  baseHourlyRate?: number;
}

interface CreateSubscriptionResult {
  success: boolean;
  url?: string;
  sessionId?: string;
  pricePerSession?: number;
  discount?: number;
  error?: string;
}

interface CancelSubscriptionResult {
  success: boolean;
  message?: string;
  cancelAt?: string;
  currentPeriodEnd?: string;
  error?: string;
}

/**
 * Créer un abonnement Stripe
 * Redirige vers Stripe Checkout pour le paiement
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<CreateSubscriptionResult> {
  try {
    const baseUrl = window.location.origin;
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        ...params,
        successUrl: `${baseUrl}/dashboard?tab=subscriptions&success=true`,
        cancelUrl: `${baseUrl}/booking/cleaning?cancelled=true`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de la création de l'abonnement");
    }

    return {
      success: true,
      url: data.url,
      sessionId: data.sessionId,
      pricePerSession: data.pricePerSession,
      discount: data.discount,
    };
  } catch (error) {
    console.error("Create subscription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Annuler un abonnement
 * Par défaut, l'annulation prend effet à la fin de la période en cours
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately: boolean = false
): Promise<CancelSubscriptionResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/cancel-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        subscriptionId,
        cancelImmediately,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de l'annulation de l'abonnement");
    }

    return {
      success: true,
      message: data.message,
      cancelAt: data.cancelAt,
      currentPeriodEnd: data.currentPeriodEnd,
    };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Lister les abonnements d'un utilisateur
 */
export async function listSubscriptions(userId: string): Promise<{
  subscriptions: Subscription[];
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { subscriptions: [], error: null };
  }

  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return { subscriptions: [], error: error.message };
    }

    return { subscriptions: data || [], error: null };
  } catch (error) {
    console.error("Error listing subscriptions:", error);
    return {
      subscriptions: [],
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Récupérer un abonnement par ID
 */
export async function getSubscription(subscriptionId: string): Promise<{
  subscription: Subscription | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { subscription: null, error: "Supabase non configuré" };
  }

  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (error) {
      console.error("Error fetching subscription:", error);
      return { subscription: null, error: error.message };
    }

    return { subscription: data, error: null };
  } catch (error) {
    console.error("Error getting subscription:", error);
    return {
      subscription: null,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Synchroniser les abonnements depuis Stripe
 * À appeler après le retour de Stripe Checkout pour s'assurer que la DB est à jour
 */
export async function syncSubscriptions(
  userId: string,
  customerEmail: string
): Promise<{ success: boolean; synced: number; error?: string }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ userId, customerEmail }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de la synchronisation");
    }

    return {
      success: true,
      synced: data.synced || 0,
    };
  } catch (error) {
    console.error("Sync subscriptions error:", error);
    return {
      success: false,
      synced: 0,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

// Labels pour l'affichage
export const frequencyLabels: Record<SubscriptionFrequency, string> = {
  weekly: "Hebdomadaire",
  biweekly: "Toutes les 2 semaines",
  monthly: "Mensuel",
};

export const frequencyShortLabels: Record<SubscriptionFrequency, string> = {
  weekly: "Chaque semaine",
  biweekly: "Toutes les 2 sem.",
  monthly: "Chaque mois",
};

// Calcul du prix avec réduction
export function calculateSubscriptionPrice(
  hourlyRate: number,
  durationHours: number,
  frequency: SubscriptionFrequency
): { price: number; discount: number; originalPrice: number } {
  const discounts: Record<SubscriptionFrequency, number> = {
    weekly: 10,
    biweekly: 5,
    monthly: 0,
  };

  const discount = discounts[frequency];
  const originalPrice = hourlyRate * durationHours;
  const discountedPrice = originalPrice - (originalPrice * discount / 100);

  return {
    price: Math.round(discountedPrice * 100) / 100,
    discount,
    originalPrice,
  };
}
