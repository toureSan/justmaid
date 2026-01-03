"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { SecurityLockIcon, CreditCardIcon } from "@hugeicons/core-free-icons";

interface StripePaymentFormProps {
  amount: number; // Montant en centimes
  bookingId?: string;
  customerEmail?: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

// URL de l'API Stripe (à configurer avec votre backend ou Supabase Edge Function)
const STRIPE_CHECKOUT_API = import.meta.env.VITE_STRIPE_CHECKOUT_API || "/api/create-checkout-session";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Icônes de paiement en SVG inline
const PaymentIcons = () => (
  <div className="flex flex-wrap items-center justify-center gap-4">
    {/* Visa */}
    <svg viewBox="0 0 48 32" className="h-8 w-auto">
      <rect fill="#1A1F71" width="48" height="32" rx="4"/>
      <path fill="#fff" d="M19.5 21h-2.7l1.7-10.5h2.7L19.5 21zm7.8-10.2c-.5-.2-1.4-.4-2.4-.4-2.7 0-4.6 1.4-4.6 3.5 0 1.5 1.4 2.3 2.4 2.8 1 .5 1.4.9 1.4 1.4 0 .7-.8 1.1-1.6 1.1-1.1 0-1.6-.2-2.5-.5l-.3-.2-.4 2.2c.6.3 1.8.5 3 .5 2.8 0 4.7-1.4 4.7-3.6 0-1.2-.7-2.1-2.4-2.9-.9-.5-1.4-.8-1.4-1.3 0-.4.5-.9 1.5-.9.9 0 1.5.2 2 .4l.2.1.4-2.2zm6.9-.3h-2.1c-.7 0-1.2.2-1.4.9l-4.1 9.6h2.8l.6-1.6h3.5l.3 1.6h2.5l-2.1-10.5zm-3.4 6.8l1.1-2.9.3-.9.2.8.6 3h-2.2zM15.3 10.5L12.6 18l-.3-1.4c-.5-1.6-2-3.4-3.7-4.2l2.4 8.6h2.9l4.3-10.5h-2.9z"/>
      <path fill="#F9A533" d="M10.3 10.5H5.9l-.1.3c3.4.9 5.7 3 6.6 5.5l-.9-4.8c-.2-.7-.7-.9-1.2-1z"/>
    </svg>
    
    {/* Mastercard */}
    <svg viewBox="0 0 48 32" className="h-8 w-auto">
      <rect fill="#000" width="48" height="32" rx="4"/>
      <circle cx="18" cy="16" r="10" fill="#EB001B"/>
      <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
      <path fill="#FF5F00" d="M24 9.8c-2.3 1.8-3.8 4.6-3.8 7.7s1.5 5.9 3.8 7.7c2.3-1.8 3.8-4.6 3.8-7.7s-1.5-5.9-3.8-7.7z"/>
    </svg>
    
    {/* Apple Pay */}
    <svg viewBox="0 0 48 32" className="h-8 w-auto">
      <rect fill="#000" width="48" height="32" rx="4"/>
      <path fill="#fff" d="M15.5 11.5c-.4.5-1 .9-1.6.8-.1-.6.2-1.3.5-1.7.4-.5 1-.8 1.5-.8.1.6-.2 1.2-.4 1.7zm.4.9c-.9 0-1.6.5-2 .5s-1-.5-1.7-.5c-.9 0-1.7.5-2.1 1.3-.9 1.6-.2 3.9.6 5.2.4.6.9 1.3 1.6 1.3s.9-.4 1.7-.4 1 .4 1.7.4 1.1-.6 1.5-1.2c.5-.7.7-1.4.7-1.4s-1.3-.5-1.3-2 1.1-2.2 1.2-2.2c-.7-1-1.7-1-2-1zm8.1.4v6.4h1.2v-2.2h1.7c1.5 0 2.6-1.1 2.6-2.1s-1-2.1-2.5-2.1h-3zm1.2 1h1.4c1 0 1.6.6 1.6 1.1s-.6 1.1-1.6 1.1h-1.4v-2.2zm7.8-.1c-1.3 0-2.2.7-2.2 1.7 0 .8.6 1.4 1.5 1.6l.9.2c.6.1.9.3.9.6 0 .4-.4.7-1.1.7-.7 0-1.2-.3-1.3-.8h-1.1c.1 1 1 1.7 2.4 1.7 1.4 0 2.3-.7 2.3-1.8 0-.8-.6-1.4-1.6-1.6l-.8-.2c-.5-.1-.9-.3-.9-.6 0-.4.4-.6 1-.6.6 0 1.1.3 1.2.7h1.1c-.1-.9-1-1.6-2.3-1.6zm5.5 5.5l2.5-6.3h-1.3l-1.6 4.5h-.1l-1.6-4.5h-1.3l2.4 6.1-.1.4c-.2.5-.5.7-.9.7h-.4v1h.5c1 0 1.4-.4 1.9-1.9z"/>
    </svg>
    
    {/* Google Pay */}
    <svg viewBox="0 0 48 32" className="h-8 w-auto">
      <rect fill="#fff" width="48" height="32" rx="4" stroke="#e5e5e5"/>
      <path fill="#4285F4" d="M23.5 16.3v3.2h-1.5v-8h4c1 0 1.8.3 2.5 1 .7.6 1 1.4 1 2.4s-.3 1.8-1 2.4c-.7.7-1.5 1-2.5 1h-2.5zm0-3.5v2.3h2.6c.5 0 1-.2 1.3-.5.4-.3.5-.7.5-1.2s-.2-.8-.5-1.1c-.4-.3-.8-.5-1.3-.5h-2.6z"/>
      <path fill="#34A853" d="M33.5 14c.9 0 1.6.2 2.2.7.6.5.8 1.2.8 2v4.8H35v-1.1c-.4.9-1.2 1.3-2.3 1.3-.7 0-1.3-.2-1.8-.6s-.7-.9-.7-1.5c0-.7.3-1.2.8-1.6s1.2-.6 2.1-.6h1.5v-.3c0-.5-.2-.8-.4-1.1-.3-.2-.7-.4-1.2-.4-.3 0-.7.1-1 .2-.3.2-.5.4-.7.6l-.9-.9c.3-.4.7-.7 1.2-.9.5-.3 1-.4 1.6-.4h.3zm-.3 6.3c.5 0 1-.2 1.3-.5s.5-.7.5-1.2v-.4h-1.4c-.9 0-1.4.4-1.4 1 0 .3.1.6.4.8.3.2.6.3 1.1.3h-.5z"/>
      <path fill="#FBBC05" d="M41.2 21.5c-.8 0-1.4-.2-2-.7-.5-.4-.8-1-.8-1.7v-4.6h1.5v4.5c0 .4.1.8.4 1s.6.4 1 .4c.6 0 1-.2 1.4-.6l.6 1.1c-.3.3-.6.4-1 .6-.4.1-.8.1-1.1.1v-.1z"/>
      <path fill="#EA4335" d="M18.3 16.3c0-.4 0-.7-.1-1.1h-4.7v2h2.7c-.1.5-.4 1-.8 1.3v1.1h1.3c.8-.7 1.2-1.8 1.2-3h.4v-.3z"/>
    </svg>
  </div>
);

// Composant principal avec Stripe Checkout Redirect
export function StripePaymentForm({ 
  amount, 
  bookingId, 
  customerEmail,
  onPaymentSuccess, 
  onPaymentError 
}: StripePaymentFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [useDemo, setUseDemo] = React.useState(false);

  // Vérifier si Stripe est configuré
  const isStripeConfigured = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    return key && key !== "pk_test_VOTRE_CLE_ICI" && key.startsWith("pk_");
  }, []);

  // Gérer le retour de Stripe Checkout
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const paymentStatus = urlParams.get("payment_status");

    if (sessionId && paymentStatus === "success") {
      // Paiement réussi, nettoyer l'URL
      window.history.replaceState({}, "", window.location.pathname);
      onPaymentSuccess();
    } else if (paymentStatus === "cancelled") {
      window.history.replaceState({}, "", window.location.pathname);
      onPaymentError("Paiement annulé");
    }
  }, [onPaymentSuccess, onPaymentError]);

  // Redirection vers Stripe Checkout
  const handleStripeCheckout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(STRIPE_CHECKOUT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          amount,
          bookingId,
          customerEmail,
          successUrl: `${window.location.origin}${window.location.pathname}?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}${window.location.pathname}?payment_status=cancelled`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de la création de la session de paiement");
      }

      const { url } = await response.json();
      
      if (url) {
        // Sauvegarder l'état de la réservation avant la redirection
        const bookingData = localStorage.getItem("bookingWizardData");
        const bookingStep = localStorage.getItem("bookingWizardStep");
        if (bookingData && bookingStep) {
          localStorage.setItem("bookingBeforeStripe", JSON.stringify({
            data: bookingData,
            step: bookingStep,
          }));
        }
        
        // Redirection vers Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (error) {
      console.error("Stripe Checkout error:", error);
      onPaymentError(error instanceof Error ? error.message : "Erreur de paiement");
      setIsLoading(false);
    }
  };

  // Mode démo si Stripe n'est pas configuré
  if (!isStripeConfigured || useDemo) {
    return <DemoPaymentForm onPaymentSuccess={onPaymentSuccess} onPaymentError={onPaymentError} amount={amount} />;
  }

  return (
    <div className="space-y-6">
      {/* Résumé du paiement */}
      <div className="rounded-xl bg-linear-to-br from-slate-50 to-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Montant à pré-autoriser</p>
            <p className="text-3xl font-bold text-foreground">{(amount / 100).toFixed(2)} CHF</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} className="h-8 w-8 text-primary" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Ce montant sera pré-autorisé (bloqué) sur votre carte mais ne sera débité qu'après l'intervention.
        </p>
      </div>

      {/* Bouton Stripe Checkout */}
      <Button
        onClick={handleStripeCheckout}
        disabled={isLoading}
        className="w-full rounded-full py-6 text-base font-semibold bg-[#635BFF] hover:bg-[#5046E5]"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Redirection vers Stripe...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            🔒 Pré-autorisation {(amount / 100).toFixed(0)} CHF
          </span>
        )}
      </Button>

      {/* Moyens de paiement acceptés */}
      <PaymentIcons />

      {/* Sécurité */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <HugeiconsIcon icon={SecurityLockIcon} strokeWidth={2} className="h-4 w-4" />
        <span>Paiement 100% sécurisé</span>
      </div>

      {/* Lien vers mode démo */}
      <button
        type="button"
        onClick={() => setUseDemo(true)}
        className="w-full text-center text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        Problème de paiement ? Utiliser le mode démo →
      </button>
    </div>
  );
}

// Formulaire de paiement en mode démo
function DemoPaymentForm({ onPaymentSuccess }: StripePaymentFormProps) {
  const [cardNumber, setCardNumber] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cvc, setCvc] = React.useState("");
  const [name, setName] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const parts = [];
    for (let i = 0; i < v.length && i < 16; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(" ");
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const isValid = cardNumber.replace(/\s/g, "").length === 16 && 
                  expiry.length === 5 && 
                  cvc.length >= 3 && 
                  name.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onPaymentSuccess();
  };

  return (
    <div className="space-y-4">
      {/* Badge mode démo */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
        <strong>🧪 Mode démo</strong> – Les paiements ne sont pas traités. 
        Utilisez 4242 4242 4242 4242 pour tester.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Nom sur la carte</label>
          <input
            type="text"
            placeholder="JEAN DUPONT"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm uppercase outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Numéro de carte */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Numéro de carte</label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Expiration et CVC */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Expiration</label>
            <input
              type="text"
              placeholder="12/25"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              maxLength={5}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">CVC</label>
            <input
              type="text"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              maxLength={4}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Bouton */}
        <Button
          type="submit"
          disabled={!isValid || isProcessing}
          className="w-full rounded-full py-6 text-base font-semibold mt-2"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Vérification...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <HugeiconsIcon icon={SecurityLockIcon} strokeWidth={2} className="h-5 w-5" />
              Valider (mode démo)
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}

export default StripePaymentForm;
