"use client";

import * as React from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { SecurityLockIcon, Tick02Icon } from "@hugeicons/core-free-icons";

// Clé publique Stripe (à remplacer par votre vraie clé en production)
// En mode test, utilisez une clé commençant par pk_test_
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_VOTRE_CLE_ICI";

// Charger Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Apparence personnalisée pour Stripe Elements
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#2563eb",
    colorBackground: "#ffffff",
    colorText: "#1f2937",
    colorDanger: "#ef4444",
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif",
    spacingUnit: "4px",
    borderRadius: "8px",
  },
  rules: {
    ".Input": {
      border: "1px solid #e5e7eb",
      boxShadow: "none",
      padding: "12px",
    },
    ".Input:focus": {
      border: "1px solid #2563eb",
      boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
    },
    ".Label": {
      fontWeight: "500",
      fontSize: "14px",
      marginBottom: "8px",
    },
  },
};

interface StripePaymentFormProps {
  amount: number; // Montant en centimes
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

// Composant interne du formulaire de paiement
function CheckoutForm({ amount, onPaymentSuccess, onPaymentError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    // En mode démo, simuler le paiement
    // En production, vous devrez créer un PaymentIntent côté serveur
    // et utiliser stripe.confirmPayment()
    
    try {
      // Simuler un délai de traitement
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Mode démo : succès simulé
      onPaymentSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      setMessage(errorMessage);
      onPaymentError(errorMessage);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Stripe Payment Element */}
      <div className="rounded-lg border border-border p-4">
        <PaymentElement
          options={{
            layout: "tabs",
            paymentMethodOrder: ["card", "apple_pay", "google_pay"],
          }}
        />
      </div>

      {/* Message d'erreur */}
      {message && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {message}
        </div>
      )}

      {/* Bouton de paiement */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-full py-6 text-base font-semibold"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Vérification en cours...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={SecurityLockIcon} strokeWidth={2} className="h-5 w-5" />
            Valider le pré-débit de 1 CHF
          </span>
        )}
      </Button>

      {/* Sécurité */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <HugeiconsIcon icon={SecurityLockIcon} strokeWidth={2} className="h-4 w-4" />
        <span>Paiement sécurisé par Stripe</span>
      </div>
    </form>
  );
}

// Composant wrapper avec le provider Stripe
export function StripePaymentForm(props: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // En production, vous devrez appeler votre API pour créer un PaymentIntent
    // et récupérer le clientSecret
    // 
    // Exemple:
    // fetch("/api/create-payment-intent", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ amount: props.amount }),
    // })
    //   .then((res) => res.json())
    //   .then((data) => setClientSecret(data.clientSecret));

    // Mode démo : simuler le chargement
    const timer = setTimeout(() => {
      // En mode démo, on utilise un clientSecret fictif
      // setClientSecret("pi_demo_secret_xxx");
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [props.amount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Chargement du formulaire de paiement...</span>
        </div>
      </div>
    );
  }

  // Mode démo sans vrai clientSecret
  // En production, vous devez attendre le clientSecret avant d'afficher Elements
  return (
    <div className="space-y-6">
      {/* Mode démo - Affichage simplifié */}
      <DemoPaymentForm {...props} />
    </div>
  );
}

// Formulaire de paiement en mode démo (sans vrai Stripe)
function DemoPaymentForm({ onPaymentSuccess, onPaymentError }: StripePaymentFormProps) {
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
    
    // Simuler le traitement
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onPaymentSuccess();
  };

  return (
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
          placeholder="1234 5678 9012 3456"
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
            placeholder="MM/AA"
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
        className="w-full rounded-full py-6 text-base font-semibold mt-4"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Vérification en cours...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <HugeiconsIcon icon={SecurityLockIcon} strokeWidth={2} className="h-5 w-5" />
            Valider le pré-débit de 1 CHF
          </span>
        )}
      </Button>

      {/* Info mode démo */}
      <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
        <strong>Mode démo :</strong> Utilisez le numéro 4242 4242 4242 4242 pour tester.
        En production, Stripe gérera le paiement sécurisé.
      </div>
    </form>
  );
}

// Export du composant Elements pour utilisation avec un vrai clientSecret
export function StripeElementsWrapper({
  clientSecret,
  children,
}: {
  clientSecret: string;
  children: React.ReactNode;
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance,
        locale: "fr",
      }}
    >
      {children}
    </Elements>
  );
}

