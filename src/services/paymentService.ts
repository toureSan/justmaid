// Service de gestion des paiements Stripe
// Gère les pré-autorisations, captures et annulations

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface CaptureResult {
  success: boolean;
  paymentIntentId?: string;
  amountCaptured?: number;
  error?: string;
}

interface CancelResult {
  success: boolean;
  message?: string;
  refundId?: string;
  error?: string;
}

/**
 * Capturer un paiement pré-autorisé
 * À appeler quand le ménage est terminé et validé
 */
export async function capturePayment(
  paymentIntentId: string,
  bookingId: string,
  amountToCapture?: number // Optionnel: capturer un montant différent
): Promise<CaptureResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/capture-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        paymentIntentId,
        bookingId,
        amountToCapture,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de la capture du paiement");
    }

    return {
      success: true,
      paymentIntentId: data.paymentIntentId,
      amountCaptured: data.amountCaptured,
    };
  } catch (error) {
    console.error("Capture payment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Annuler une pré-autorisation ou rembourser un paiement
 * À appeler si le client annule ou si le ménage n'a pas eu lieu
 */
export async function cancelPayment(
  paymentIntentId: string,
  bookingId: string,
  reason?: string
): Promise<CancelResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/cancel-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        paymentIntentId,
        bookingId,
        reason,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de l'annulation du paiement");
    }

    return {
      success: true,
      message: data.message,
      refundId: data.refundId,
    };
  } catch (error) {
    console.error("Cancel payment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

/**
 * Workflow complet de validation du ménage
 * 
 * ÉTAPES:
 * 1. Intervenant termine → marque "provider_completed"
 * 2. Client confirme OU 24h passent → auto-confirmation
 * 3. Paiement capturé
 */
export type BookingPaymentStatus = 
  | "pending"           // Réservation créée, pré-autorisation faite
  | "provider_completed" // Intervenant a marqué comme terminé
  | "client_confirmed"   // Client a confirmé
  | "auto_confirmed"     // Auto-confirmé après délai
  | "captured"           // Paiement débité
  | "cancelled"          // Annulé, pré-autorisation libérée
  | "refunded"           // Remboursé après débit
  | "disputed";          // Litige en cours

/**
 * Vérifier si un paiement peut être capturé
 * La pré-autorisation Stripe expire après 7 jours!
 */
export function canCapturePayment(
  bookingDate: Date,
  providerCompleted: boolean,
  clientConfirmed: boolean
): { canCapture: boolean; reason: string } {
  const now = new Date();
  const hoursSinceBooking = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);

  // La pré-autorisation expire après 7 jours
  if (hoursSinceBooking > 168) { // 7 * 24 = 168 heures
    return { 
      canCapture: false, 
      reason: "Pré-autorisation expirée (7 jours). Il faut créer un nouveau paiement." 
    };
  }

  // Conditions de capture
  if (clientConfirmed) {
    return { canCapture: true, reason: "Client a confirmé le ménage" };
  }

  if (providerCompleted && hoursSinceBooking > 24) {
    return { canCapture: true, reason: "Auto-confirmé 24h après validation intervenant" };
  }

  if (providerCompleted) {
    return { 
      canCapture: false, 
      reason: "En attente de confirmation client ou délai de 24h" 
    };
  }

  return { 
    canCapture: false, 
    reason: "L'intervenant n'a pas encore marqué le ménage comme terminé" 
  };
}

// Export des types
export type { CaptureResult, CancelResult };
