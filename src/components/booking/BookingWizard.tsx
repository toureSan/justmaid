import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Tick02Icon,
  Home01Icon,
  Calendar03Icon,
  CreditCardIcon,
  SecurityLockIcon,
} from "@hugeicons/core-free-icons";
import { createBookingWithEmail } from "@/services/bookingService";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { StripePaymentForm } from "./StripePaymentForm";

const steps = [
  { id: 1, title: "Adresse", description: "Lieu d'intervention" },
  { id: 2, title: "Date & Durée", description: "Quand et combien de temps" },
  { id: 3, title: "Coordonnées", description: "Vos informations" },
  { id: 4, title: "Paiement", description: "Vérification carte" },
  { id: 5, title: "Confirmation", description: "Récapitulatif" },
];

interface ExtraService {
  id: string;
  label: string;
  price: number;
  details?: string;
}

// Types de ménage
type CleaningType = "domicile" | "fin_bail" | "bureau";

const CLEANING_TYPES: { id: CleaningType; label: string; description: string; hourlyRate: number | null; emoji: string }[] = [
  { id: "domicile", label: "Ménage à domicile", description: "Nettoyage régulier ou ponctuel", hourlyRate: 45, emoji: "🏠" },
  { id: "fin_bail", label: "Fin de bail", description: "Nettoyage complet pour remise des clés", hourlyRate: 45, emoji: "🔑" },
  { id: "bureau", label: "Nettoyage de bureau", description: "Sur devis personnalisé", hourlyRate: null, emoji: "🏢" },
];

// Fréquences disponibles
type FrequencyType = "once" | "weekly" | "biweekly" | "monthly" | "custom";

const FREQUENCIES: { id: FrequencyType; label: string; description: string; discount: number; popular?: boolean }[] = [
  { id: "once", label: "Une fois", description: "Intervention ponctuelle", discount: 0 },
  { id: "weekly", label: "Hebdomadaire", description: "Même agent de ménage à chaque fois", discount: 2, popular: true },
  { id: "biweekly", label: "Toutes les 2 semaines", description: "Même agent de ménage à chaque fois", discount: 2 },
  { id: "monthly", label: "Toutes les 4 semaines", description: "Intervention mensuelle régulière", discount: 2 },
  { id: "custom", label: "Plus souvent", description: "Contactez-nous pour un devis personnalisé", discount: 2 },
];

interface BookingData {
  // Type de ménage
  cleaningType: CleaningType;
  // Adresse détaillée
  street: string;
  streetNumber: string;
  building: string;
  floor: string;
  doorCode: string;
  postalCode: string;
  city: string;
  address: string; // Adresse complète combinée
  homeType: string;
  homeSize: string;
  date: string;
  time: string;
  duration: string;
  tasks: string[];
  notes: string;
  coords: { lat: number; lng: number } | null;
  // Services supplémentaires
  extras: ExtraService[];
  hasPets: boolean;
  hasEquipment: boolean;
  // Fréquence (abonnement)
  frequency: FrequencyType;
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Paiement
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

const initialBookingData: BookingData = {
  // Type de ménage
  cleaningType: "domicile",
  // Adresse détaillée
  street: "",
  streetNumber: "",
  building: "",
  floor: "",
  doorCode: "",
  postalCode: "",
  city: "",
  address: "",
  homeType: "apartment",
  homeSize: "medium",
  date: "",
  time: "",
  duration: "3",
  tasks: [],
  notes: "",
  coords: null,
  // Services supplémentaires
  extras: [],
  hasPets: false,
  hasEquipment: false,
  // Fréquence (abonnement)
  frequency: "once",
  // Informations personnelles
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  // Paiement
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardName: "",
};

interface UserAuth {
  id: string;
  email: string;
  name: string;
  provider: "google" | "apple" | "email";
  avatar?: string;
}

export function BookingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [bookingData, setBookingData] = React.useState<BookingData>(initialBookingData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Auth state
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [user, setUser] = React.useState<UserAuth | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  // Mobile price details modal
  const [showMobilePriceDetails, setShowMobilePriceDetails] = React.useState(false);

  // Fonction pour réinitialiser le formulaire
  const resetBooking = React.useCallback(() => {
    setBookingData(initialBookingData);
    setCurrentStep(1);
    // Nettoyer localStorage
    localStorage.removeItem("bookingWizardData");
    localStorage.removeItem("bookingWizardStep");
    localStorage.removeItem("bookingInProgress");
    localStorage.removeItem("bookingDraft");
  }, []);

  // Charger l'utilisateur au montage (Supabase ou localStorage)
  React.useEffect(() => {
    const loadUser = async () => {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        if (supaUser) {
          const userData = {
            id: supaUser.id,
            email: supaUser.email || "",
            name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "",
            avatar: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture,
            provider: "google" as const,
          };
          setUser(userData);
          setIsAuthenticated(true);
          // Pré-remplir les infos personnelles
          const nameParts = userData.name.split(" ");
          setBookingData(prev => ({
            ...prev,
            firstName: prev.firstName || nameParts[0] || "",
            lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
            email: prev.email || userData.email || "",
          }));
        }
      } else {
        // Fallback localStorage
        const savedUser = localStorage.getItem("justmaid_user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setIsAuthenticated(true);
          if (parsed.name || parsed.email) {
            const nameParts = (parsed.name || "").split(" ");
            setBookingData(prev => ({
              ...prev,
              firstName: prev.firstName || nameParts[0] || "",
              lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
              email: prev.email || parsed.email || "",
            }));
          }
        }
      }
    };
    loadUser();
  }, []);

  // Charger les données depuis localStorage (persistance après refresh)
  React.useEffect(() => {
    // Priorité 1: Vérifier si on revient d'une authentification OAuth
    const bookingInProgress = localStorage.getItem("bookingInProgress");
    if (bookingInProgress) {
      try {
        const savedState = JSON.parse(bookingInProgress);
        // Restaurer l'état de la réservation
        if (savedState.bookingData) {
          setBookingData(prev => ({
            ...prev,
            ...savedState.bookingData,
          }));
        }
        if (savedState.step) {
          setCurrentStep(savedState.step);
        }
        // Nettoyer le state sauvegardé
        localStorage.removeItem("bookingInProgress");
        return; // Ne pas continuer si on a restauré depuis bookingInProgress
      } catch (e) {
        console.error("Error restoring booking state:", e);
        localStorage.removeItem("bookingInProgress");
      }
    }

    // Priorité 2: Vérifier si on vient de la page d'accueil
    const draft = localStorage.getItem("bookingDraft");
    if (draft) {
      const parsed = JSON.parse(draft);
      setBookingData((prev) => ({
        ...prev,
        address: parsed.address || "",
        homeType: parsed.homeType || "apartment",
        duration: parsed.duration || "3",
        coords: parsed.coords || null,
        postalCode: parsed.postalCode || "",
        city: parsed.city || "",
      }));
      // Si on vient de la homepage avec code postal et ville, passer à l'étape 2 (Date)
      if (parsed.fromHome && parsed.postalCode && parsed.city) {
        setCurrentStep(2);
      }
      // Nettoyer le draft
      localStorage.removeItem("bookingDraft");
      return; // Ne pas continuer si on a restauré depuis bookingDraft
    }
    
    // Priorité 3: Restaurer les données sauvegardées (refresh de page)
    const savedData = localStorage.getItem("bookingWizardData");
    const savedStep = localStorage.getItem("bookingWizardStep");
    
    if (savedStep) {
      const step = parseInt(savedStep);
      // Si c'était l'étape de confirmation (5) ou plus, nettoyer et recommencer
      if (step >= 5) {
        localStorage.removeItem("bookingWizardData");
        localStorage.removeItem("bookingWizardStep");
        localStorage.removeItem("bookingInProgress");
        localStorage.removeItem("bookingDraft");
        // Ne pas restaurer les données, recommencer à zéro
        return;
      }
    }
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBookingData(prev => ({
          ...prev,
          ...parsed,
        }));
        if (savedStep) {
          const step = parseInt(savedStep);
          if (step >= 1 && step <= 4) {
            setCurrentStep(step);
          }
        }
      } catch (e) {
        console.error("Error restoring saved booking data:", e);
      }
    }
  }, []);

  // Sauvegarder l'état de la réservation dans localStorage (pour la persistance OAuth)
  React.useEffect(() => {
    if (typeof window !== "undefined" && (bookingData.postalCode || bookingData.city || bookingData.date)) {
      localStorage.setItem("bookingWizardData", JSON.stringify(bookingData));
      localStorage.setItem("bookingWizardStep", String(currentStep));
    }
  }, [bookingData, currentStep]);

  // Callback pour la connexion réussie
  const handleAuthSuccess = (authUser: UserAuth) => {
    setUser(authUser);
    setIsAuthenticated(true);
    localStorage.setItem("justmaid_user", JSON.stringify(authUser));
    setShowAuthModal(false);
    // Passer à l'étape coordonnées (pré-remplie avec les infos de l'auth)
    setCurrentStep(3);
    // Pré-remplir les infos si elles viennent de l'auth
    if (authUser.name || authUser.email) {
      const nameParts = (authUser.name || "").split(" ");
      setBookingData(prev => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || "",
        lastName: prev.lastName || nameParts.slice(1).join(" ") || "",
        email: prev.email || authUser.email || "",
      }));
    }
  };

  const updateBookingData = (field: keyof BookingData, value: string | string[]) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const updateExtras = (extras: ExtraService[]) => {
    setBookingData((prev) => ({ ...prev, extras }));
  };

  const updateHasPets = (hasPets: boolean) => {
    setBookingData((prev) => ({ ...prev, hasPets }));
  };

  const updateHasEquipment = (hasEquipment: boolean) => {
    setBookingData((prev) => ({ ...prev, hasEquipment }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Étape adresse : type ménage (pas bureau) + code postal + ville requis
        if (bookingData.cleaningType === "bureau") return false;
        return bookingData.postalCode.trim().length === 4 && bookingData.city.trim().length >= 2;
      case 2:
        return bookingData.date && bookingData.time && bookingData.duration && bookingData.hasEquipment;
      case 3:
        // Informations personnelles + adresse complète
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\d\s+()-]{10,}$/;
        const hasPersonalInfo = (
          bookingData.firstName.trim().length >= 2 &&
          bookingData.lastName.trim().length >= 2 &&
          emailRegex.test(bookingData.email) &&
          phoneRegex.test(bookingData.phone.replace(/\s/g, ""))
        );
        const hasAddress = (
          bookingData.street.trim().length >= 2 &&
          bookingData.streetNumber.trim().length >= 1
        );
        return hasPersonalInfo && hasAddress;
      case 4:
        // Le paiement gère sa propre navigation
        return false;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    // Si on veut passer à l'étape 3 (coordonnées) et qu'on n'est pas connecté
    if (currentStep === 2 && !isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    setIsSubmitting(true);

    // Construire l'adresse complète
    const fullAddress = [
      `${bookingData.street} ${bookingData.streetNumber}`,
      bookingData.building ? `Bât. ${bookingData.building}` : "",
      bookingData.floor ? `${bookingData.floor} étage` : "",
      `${bookingData.postalCode} ${bookingData.city}`,
    ].filter(Boolean).join(", ");

    // Détails supplémentaires (digicode, etc.)
    const addressDetails = [
      bookingData.doorCode ? `Code: ${bookingData.doorCode}` : "",
      bookingData.notes || "",
    ].filter(Boolean).join(" | ");

    try {
      // Créer la réservation avec envoi d'email de confirmation
      const { booking, error, emailSent } = await createBookingWithEmail(user.id, {
        serviceType: "cleaning",
        cleaningType: bookingData.cleaningType,
        address: fullAddress,
        addressDetails: addressDetails,
        latitude: bookingData.coords?.lat,
        longitude: bookingData.coords?.lng,
        homeType: bookingData.homeType,
        homeSize: bookingData.homeSize || undefined,
        date: bookingData.date,
        time: bookingData.time,
        duration: parseInt(bookingData.duration) || 2,
        tasks: [], // Plus de tâches à sélectionner - inclus dans le ménage standard
        notes: bookingData.notes || undefined,
        totalPrice: calculatePrice(),
        extras: bookingData.extras,
        hasPets: bookingData.hasPets,
        frequency: bookingData.frequency,
        userEmail: user.email,
        userName: user.name,
      });

      if (error) {
        console.error("Error creating booking:", error);
        alert("Erreur lors de la création de la réservation: " + error);
        setIsSubmitting(false);
        return;
      }

      console.log("Booking created:", booking, "Email sent:", emailSent);
      setIsSubmitting(false);

      // Nettoyer le localStorage après une réservation réussie
      localStorage.removeItem("bookingWizardData");
      localStorage.removeItem("bookingWizardStep");
      localStorage.removeItem("bookingInProgress");
      localStorage.removeItem("bookingDraft");

      // Rediriger vers le dashboard
      navigate({ to: "/dashboard", search: { tab: "home", success: undefined } });
    } catch (err) {
      console.error("Error:", err);
      setIsSubmitting(false);
    }
  };

  const getHourlyRate = () => {
    const cleaningType = CLEANING_TYPES.find(c => c.id === bookingData.cleaningType);
    return cleaningType?.hourlyRate || 45;
  };

  const calculatePrice = () => {
    const hours = parseInt(bookingData.duration) || 2;
    const frequencyDiscount = FREQUENCIES.find(f => f.id === bookingData.frequency)?.discount || 0;
    const hourlyRate = getHourlyRate();
    const basePrice = hourlyRate - frequencyDiscount; // Tarif horaire - réduction abonnement
    const baseTotal = hours * basePrice;
    const extrasTotal = bookingData.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
    return baseTotal + extrasTotal;
  };
  
  const getBasePrice = () => {
    const hours = parseInt(bookingData.duration) || 2;
    const frequencyDiscount = FREQUENCIES.find(f => f.id === bookingData.frequency)?.discount || 0;
    const hourlyRate = getHourlyRate();
    return hours * (hourlyRate - frequencyDiscount);
  };
  
  const getExtrasTotal = () => {
    return bookingData.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
  };
  
  const getFrequencyDiscount = () => {
    return FREQUENCIES.find(f => f.id === bookingData.frequency)?.discount || 0;
  };
  
  const isSubscription = () => {
    return bookingData.frequency !== "once";
  };

  return (
    <div className="mx-auto max-w-12xl px-0 pb-20 lg:pb-0">
      {/* Modal d'authentification */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Barre d'outils : utilisateur connecté + bouton réinitialiser */}
      <div className="mb-4 flex items-center justify-between gap-2 text-sm">
        {/* Bouton Nouvelle réservation (si des données existent) */}
        {(bookingData.date || bookingData.postalCode || currentStep > 1) && (
          <button
            onClick={resetBooking}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-xs"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Nouvelle réservation
          </button>
        )}
        
        {/* Spacer si pas de bouton reset */}
        {!(bookingData.date || bookingData.postalCode || currentStep > 1) && <div />}
        
        {/* Utilisateur connecté */}
        {isAuthenticated && user ? (
          <button
            onClick={() => navigate({ to: "/dashboard", search: { tab: "home", success: undefined } })}
            className="flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1.5 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-gray-700 font-medium">{user.name}</span>
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-4 w-4 text-green-500" />
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Mobile Step Indicator */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center justify-between bg-card rounded-xl p-4 shadow-sm border border-border/50">
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold"
              style={{ backgroundColor: '#2FCCC0' }}
            >
              {currentStep}
            </div>
            <div>
              <p className="font-semibold text-foreground">{steps[currentStep - 1].title}</p>
              <p className="text-xs text-muted-foreground">{steps[currentStep - 1].description}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentStep}/6
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${(currentStep / 6) * 100}%`,
              backgroundColor: '#2FCCC0'
            }}
          />
        </div>
      </div>

      {/* Layout: Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
        {/* Main Content - Left */}
        <div className="space-y-6">
          {/* Afficher l'adresse si elle existe */}
          {bookingData.address && currentStep > 1 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <HugeiconsIcon icon={Home01Icon} strokeWidth={1.5} className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Adresse de l'intervention</p>
                  <p className="font-medium text-foreground truncate">{bookingData.address}</p>
                </div>
                <Badge className="shrink-0">{bookingData.homeType === "apartment" ? "Appartement" : bookingData.homeType === "house" ? "Maison" : "Studio"}</Badge>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-lg sm:p-8 lg:p-10 min-h-[450px]">
          {currentStep === 1 && (
            <Step1Address 
              bookingData={bookingData} 
              updateBookingData={updateBookingData} 
            />
          )}
          {currentStep === 2 && (
            <Step2DateTime 
              bookingData={bookingData} 
              updateBookingData={updateBookingData}
              updateExtras={updateExtras}
              updateHasPets={updateHasPets}
              updateHasEquipment={updateHasEquipment}
              hourlyRate={getHourlyRate()}
            />
          )}
          {currentStep === 3 && (
            <Step4PersonalInfo 
              bookingData={bookingData} 
              updateBookingData={updateBookingData}
            />
          )}
          {currentStep === 4 && (
            <Step5Payment 
              onPaymentSuccess={() => setCurrentStep(5)} 
              calculatePrice={calculatePrice}
              bookingData={bookingData}
              isSubscription={isSubscription()}
              user={user}
              hourlyRate={getHourlyRate()}
            />
          )}
          {currentStep === 5 && (
            <Step6Confirmation bookingData={bookingData} calculatePrice={calculatePrice} hourlyRate={getHourlyRate()} />
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-6">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack} className="rounded-full">
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="mr-2 h-4 w-4" />
                Retour
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="rounded-full"
              >
                Continuer
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  "Confirmation en cours..."
                ) : (
                  <>
                    Continuer
                    <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        </div>

        {/* Sidebar - Right (hidden on mobile) */}
        <div className="hidden lg:block sticky top-24 rounded-2xl border border-border/50 bg-card p-6 shadow-lg">
          <h3 className="mb-6 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Étapes</h3>
          <VerticalStepper steps={steps} currentStep={currentStep} />
          
          {/* Price Preview */}
          <div className="mt-8 border-t border-border/50 pt-6 space-y-2">
            {/* Fréquence sélectionnée */}
            {isSubscription() && (
              <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🔄</span>
                  <span className="text-xs font-medium text-green-700">
                    {FREQUENCIES.find(f => f.id === bookingData.frequency)?.label}
                  </span>
                </div>
                <p className="text-[10px] text-green-600 mt-0.5">
                  -2 CHF/h • Économie: {getFrequencyDiscount() * (parseInt(bookingData.duration) || 2)} CHF
                </p>
              </div>
            )}
            
            {/* Ménage de base */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">🧹 Ménage</span>
              <span className="font-medium">{getBasePrice()} CHF</span>
            </div>
            <p className="text-xs text-muted-foreground pl-5">
              {bookingData.duration || 2}h × {getHourlyRate() - getFrequencyDiscount()} CHF/h
              {isSubscription() && <span className="text-green-600 ml-1">(abonnement)</span>}
            </p>
            
            {/* Services supplémentaires */}
            {bookingData.extras && bookingData.extras.length > 0 && (
              <>
                <div className="border-t border-border/30 my-2" />
                {bookingData.extras.map((extra, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">{extra.label}</span>
                    <span className="font-medium text-xs">+{extra.price} CHF</span>
                  </div>
                ))}
              </>
            )}
            
            {/* Animaux */}
            {bookingData.hasPets && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground text-xs">🐾 Animaux</span>
                <span className="text-xs text-muted-foreground">Noté</span>
              </div>
            )}
            
            {/* Date et heure */}
            {(bookingData.date || bookingData.time) && (
              <div className="border-t border-border/30 my-2" />
            )}
            
            {bookingData.date && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">📅 Date</span>
                <span className="font-medium">
                  {new Date(bookingData.date).toLocaleDateString("fr-FR", { 
                    weekday: "short", 
                    day: "numeric", 
                    month: "short" 
                  })}
                </span>
              </div>
            )}
            
            {bookingData.time && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">🕐 Heure</span>
                <span className="font-medium">{bookingData.time}</span>
              </div>
            )}
            
            {/* Total */}
            <div className="border-t border-border/50 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">{calculatePrice()} CHF</span>
              </div>
              {getExtrasTotal() > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Base: {getBasePrice()} CHF + Extras: {getExtrasTotal()} CHF
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                💳 Paiement après l'intervention
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Price Bar - Swipeable */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40 cursor-pointer"
        onClick={() => setShowMobilePriceDetails(true)}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          (e.currentTarget as HTMLElement).dataset.startY = String(touch.clientY);
        }}
        onTouchEnd={(e) => {
          const startY = Number((e.currentTarget as HTMLElement).dataset.startY);
          const endY = e.changedTouches[0].clientY;
          // Si swipe vers le haut (au moins 30px)
          if (startY - endY > 30) {
            setShowMobilePriceDetails(true);
          }
        }}
      >
        {/* Pull indicator */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="max-w-md mx-auto px-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">TOTAL <span className="text-gray-400">(par ménage)</span></p>
              <p className="text-[10px] text-primary">↑ Glissez pour voir les détails</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{calculatePrice()} CHF</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowMobilePriceDetails(true); }}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold"
              >
                i
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Price Details Modal */}
      {showMobilePriceDetails && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobilePriceDetails(false)} />
          <div 
            className="relative bg-white rounded-t-2xl w-full shadow-xl max-h-[70vh] overflow-hidden"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              (e.currentTarget as HTMLElement).dataset.startY = String(touch.clientY);
            }}
            onTouchEnd={(e) => {
              const startY = Number((e.currentTarget as HTMLElement).dataset.startY);
              const endY = e.changedTouches[0].clientY;
              // Si swipe vers le bas (au moins 50px)
              if (endY - startY > 50) {
                setShowMobilePriceDetails(false);
              }
            }}
          >
            {/* Handle bar - glissez vers le bas pour fermer */}
            <div className="flex justify-center py-3 cursor-pointer" onClick={() => setShowMobilePriceDetails(false)}>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            
            {/* Content */}
            <div className="px-4 pb-6 pt-2">
              <h3 className="text-lg font-bold mb-4">Détail de votre réservation</h3>
              
              <div className="space-y-3">
                {/* Abonnement badge */}
                {isSubscription() && (
                  <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-700">🔄 {FREQUENCIES.find(f => f.id === bookingData.frequency)?.label}</p>
                        <p className="text-xs text-green-600">Tarif abonnement: {45 - getFrequencyDiscount()} CHF/h</p>
                      </div>
                      <span className="text-green-700 font-semibold">
                        -{getFrequencyDiscount() * (parseInt(bookingData.duration) || 2)} CHF
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Ménage de base */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">🧹 Ménage à domicile</p>
                    <p className="text-xs text-muted-foreground">
                      {bookingData.duration || 2}h × {45 - getFrequencyDiscount()} CHF/h
                      {isSubscription() && <span className="text-green-600 ml-1">(abo)</span>}
                    </p>
                  </div>
                  <span className="font-semibold">{getBasePrice()} CHF</span>
                </div>
                
                {/* Services supplémentaires */}
                {bookingData.extras && bookingData.extras.length > 0 && (
                  <>
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs text-muted-foreground mb-2">Services supplémentaires</p>
                      {bookingData.extras.map((extra, index) => (
                        <div key={index} className="flex items-center justify-between py-1">
                          <span className="text-sm">{extra.label}</span>
                          <span className="font-medium text-sm">+{extra.price} CHF</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Date et heure */}
                {(bookingData.date || bookingData.time) && (
                  <div className="border-t border-border/50 pt-3">
                    {bookingData.date && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-muted-foreground">📅 Date</span>
                        <span className="font-medium text-sm">
                          {new Date(bookingData.date).toLocaleDateString("fr-FR", { 
                            weekday: "long", 
                            day: "numeric", 
                            month: "long" 
                          })}
                        </span>
                      </div>
                    )}
                    {bookingData.time && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-muted-foreground">🕐 Heure</span>
                        <span className="font-medium text-sm">{bookingData.time}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Total */}
                <div className="border-t-2 border-primary/20 pt-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-2xl font-bold text-primary">{calculatePrice()} CHF</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    💳 Paiement après l'intervention
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowMobilePriceDetails(false)}
                className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-semibold"
              >
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Villes disponibles par code postal
const AVAILABLE_CITIES: Record<string, { name: string; canton: string; available: boolean }[]> = {
  "1200": [{ name: "Genève", canton: "GE", available: true }],
  "1201": [{ name: "Genève", canton: "GE", available: true }],
  "1202": [{ name: "Genève", canton: "GE", available: true }],
  "1203": [{ name: "Genève", canton: "GE", available: true }],
  "1204": [{ name: "Genève", canton: "GE", available: true }],
  "1205": [{ name: "Genève", canton: "GE", available: true }],
  "1206": [{ name: "Genève", canton: "GE", available: true }],
  "1207": [{ name: "Genève", canton: "GE", available: true }],
  "1208": [{ name: "Genève", canton: "GE", available: true }],
  "1209": [{ name: "Genève", canton: "GE", available: true }],
  "1212": [{ name: "Grand-Lancy", canton: "GE", available: true }],
  "1213": [{ name: "Petit-Lancy", canton: "GE", available: true }],
  "1214": [{ name: "Vernier", canton: "GE", available: true }],
  "1215": [{ name: "Genève Aéroport", canton: "GE", available: true }],
  "1216": [{ name: "Cointrin", canton: "GE", available: true }],
  "1217": [{ name: "Meyrin", canton: "GE", available: true }],
  "1218": [{ name: "Le Grand-Saconnex", canton: "GE", available: true }],
  "1219": [{ name: "Châtelaine", canton: "GE", available: true }],
  "1220": [{ name: "Les Avanchets", canton: "GE", available: true }],
  "1222": [{ name: "Vésenaz", canton: "GE", available: true }],
  "1223": [{ name: "Cologny", canton: "GE", available: true }],
  "1224": [{ name: "Chêne-Bougeries", canton: "GE", available: true }],
  "1225": [{ name: "Chêne-Bourg", canton: "GE", available: true }],
  "1226": [{ name: "Thônex", canton: "GE", available: true }],
  "1227": [{ name: "Carouge", canton: "GE", available: true }],
  "1228": [{ name: "Plan-les-Ouates", canton: "GE", available: true }],
  "1231": [{ name: "Conches", canton: "GE", available: true }],
  "1232": [{ name: "Confignon", canton: "GE", available: true }],
  "1233": [{ name: "Bernex", canton: "GE", available: true }],
  "1234": [{ name: "Vessy", canton: "GE", available: true }],
  "1236": [{ name: "Cartigny", canton: "GE", available: true }],
  "1237": [{ name: "Avully", canton: "GE", available: true }],
  "1239": [{ name: "Collex-Bossy", canton: "GE", available: true }],
  "1241": [{ name: "Puplinge", canton: "GE", available: true }],
  "1242": [{ name: "Satigny", canton: "GE", available: true }],
  "1243": [{ name: "Presinge", canton: "GE", available: true }],
  "1244": [{ name: "Choulex", canton: "GE", available: true }],
  "1245": [{ name: "Collonge-Bellerive", canton: "GE", available: true }],
  "1246": [{ name: "Corsier", canton: "GE", available: true }],
  "1247": [{ name: "Anières", canton: "GE", available: true }],
  "1248": [{ name: "Hermance", canton: "GE", available: true }],
  "1260": [{ name: "Nyon", canton: "VD", available: true }],
  "1261": [{ name: "Longirod", canton: "VD", available: true }],
  "1262": [{ name: "Eysins", canton: "VD", available: true }],
  "1263": [{ name: "Crassier", canton: "VD", available: true }],
  "1264": [{ name: "St-Cergue", canton: "VD", available: true }],
  "1266": [{ name: "Duillier", canton: "VD", available: true }],
  "1267": [{ name: "Coinsins", canton: "VD", available: true }],
  "1268": [{ name: "Begnins", canton: "VD", available: true }],
  "1269": [{ name: "Bassins", canton: "VD", available: true }],
  "1270": [{ name: "Trélex", canton: "VD", available: true }],
  "1271": [{ name: "Givrins", canton: "VD", available: true }],
  "1272": [{ name: "Genolier", canton: "VD", available: true }],
  "1273": [{ name: "Arzier-Le Muids", canton: "VD", available: true }],
  "1274": [{ name: "Grens", canton: "VD", available: true }],
  "1275": [{ name: "Chéserex", canton: "VD", available: true }],
  "1276": [{ name: "Gingins", canton: "VD", available: true }],
  "1277": [{ name: "Borex", canton: "VD", available: true }],
  "1278": [{ name: "La Rippe", canton: "VD", available: true }],
  "1279": [{ name: "Chavannes-de-Bogis", canton: "VD", available: true }],
  "1290": [{ name: "Versoix", canton: "GE", available: true }],
  // Villes bientôt disponibles
  "1000": [{ name: "Lausanne", canton: "VD", available: false }],
  "1003": [{ name: "Lausanne", canton: "VD", available: false }],
  "1004": [{ name: "Lausanne", canton: "VD", available: false }],
  "1005": [{ name: "Lausanne", canton: "VD", available: false }],
  "1006": [{ name: "Lausanne", canton: "VD", available: false }],
  "1007": [{ name: "Lausanne", canton: "VD", available: false }],
  "1010": [{ name: "Lausanne", canton: "VD", available: false }],
  "1012": [{ name: "Lausanne", canton: "VD", available: false }],
  "1018": [{ name: "Lausanne", canton: "VD", available: false }],
  "1820": [{ name: "Montreux", canton: "VD", available: false }],
  "1800": [{ name: "Vevey", canton: "VD", available: false }],
  "2000": [{ name: "Neuchâtel", canton: "NE", available: false }],
  "1950": [{ name: "Sion", canton: "VS", available: false }],
};

// Step 1: Recherche par code postal
function Step1Address({
  bookingData,
  updateBookingData,
}: {
  bookingData: BookingData;
  updateBookingData: (field: keyof BookingData, value: string) => void;
}) {
  const [searchQuery, setSearchQuery] = React.useState(bookingData.postalCode || "");
  const [matchedCities, setMatchedCities] = React.useState<{ name: string; canton: string; available: boolean }[]>([]);
  const [showNotAvailable, setShowNotAvailable] = React.useState(false);

  // Rechercher les villes par code postal
  React.useEffect(() => {
    if (searchQuery.length === 4) {
      const cities = AVAILABLE_CITIES[searchQuery];
      if (cities) {
        setMatchedCities(cities);
        // Si une seule ville, la sélectionner automatiquement
        if (cities.length === 1) {
          updateBookingData("postalCode", searchQuery);
          updateBookingData("city", cities[0].name);
          setShowNotAvailable(!cities[0].available);
        }
      } else {
        setMatchedCities([]);
        setShowNotAvailable(true);
      }
    } else {
      setMatchedCities([]);
      setShowNotAvailable(false);
    }
  }, [searchQuery, updateBookingData]);

  const selectCity = (city: { name: string; canton: string; available: boolean }) => {
    updateBookingData("postalCode", searchQuery);
    updateBookingData("city", city.name);
    setShowNotAvailable(!city.available);
  };

  // État local pour le formulaire de demande de devis bureau
  const [showQuoteForm, setShowQuoteForm] = React.useState(false);
  const [quoteFormData, setQuoteFormData] = React.useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    surfaceArea: "",
    frequency: "",
    message: "",
  });
  const [quoteSent, setQuoteSent] = React.useState(false);

  const [isSubmittingQuote, setIsSubmittingQuote] = React.useState(false);
  const [quoteError, setQuoteError] = React.useState<string | null>(null);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuote(true);
    setQuoteError(null);
    
    try {
      // Insérer la demande de devis dans Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (getSupabase() as any)
        .from('quote_requests')
        .insert({
          company_name: quoteFormData.companyName,
          contact_name: quoteFormData.contactName,
          email: quoteFormData.email,
          phone: quoteFormData.phone,
          address: quoteFormData.address,
          surface_area: quoteFormData.surfaceArea || null,
          frequency: quoteFormData.frequency || null,
          message: quoteFormData.message || null,
          status: 'pending',
        });

      if (error) {
        console.error("Erreur insertion devis:", error);
        setQuoteError("Une erreur est survenue. Veuillez réessayer.");
        setIsSubmittingQuote(false);
        return;
      }

      setQuoteSent(true);
      setIsSubmittingQuote(false);
    } catch (error) {
      console.error("Erreur envoi devis:", error);
      setQuoteError("Une erreur est survenue. Veuillez réessayer.");
      setIsSubmittingQuote(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Sélection du type de ménage */}
      <div>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Quel type de ménage ? 🧹
        </h2>
        <p className="mt-2 text-muted-foreground">
          Sélectionnez le service qui correspond à vos besoins
        </p>
        
        <div className="mt-6 grid gap-3">
          {CLEANING_TYPES.map((type) => {
            const isSelected = bookingData.cleaningType === type.id;
            const isBureau = type.id === "bureau";
            
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  updateBookingData("cleaningType", type.id);
                  if (isBureau) {
                    setShowQuoteForm(true);
                  } else {
                    setShowQuoteForm(false);
                  }
                }}
                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                }`}
              >
                <span className="text-3xl">{type.emoji}</span>
                <div className="flex-1">
                  <p className={`font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {type.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
                <div className="text-right">
                  {type.hourlyRate ? (
                    <span className="font-bold text-primary">{type.hourlyRate} CHF/h</span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                      Sur devis
                    </span>
                  )}
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulaire de demande de devis pour bureau */}
      {showQuoteForm && bookingData.cleaningType === "bureau" && (
        <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6">
          {quoteSent ? (
            <div className="text-center py-8">
              <span className="text-5xl mb-4 block">✅</span>
              <h3 className="text-xl font-bold text-foreground mb-2">Demande envoyée !</h3>
              <p className="text-muted-foreground">
                Nous vous recontacterons sous 24h avec un devis personnalisé.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-foreground mb-4">
                🏢 Demande de devis - Nettoyage de bureau
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Remplissez ce formulaire et nous vous enverrons un devis personnalisé sous 24h.
              </p>
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                    <Input
                      id="companyName"
                      required
                      value={quoteFormData.companyName}
                      onChange={(e) => setQuoteFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Votre entreprise"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactName">Nom du contact *</Label>
                    <Input
                      id="contactName"
                      required
                      value={quoteFormData.contactName}
                      onChange={(e) => setQuoteFormData(prev => ({ ...prev, contactName: e.target.value }))}
                      placeholder="Prénom Nom"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quoteEmail">Email *</Label>
                    <Input
                      id="quoteEmail"
                      type="email"
                      required
                      value={quoteFormData.email}
                      onChange={(e) => setQuoteFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@entreprise.ch"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quotePhone">Téléphone *</Label>
                    <Input
                      id="quotePhone"
                      type="tel"
                      required
                      value={quoteFormData.phone}
                      onChange={(e) => setQuoteFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="022 123 45 67"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="quoteAddress">Adresse des locaux *</Label>
                  <Input
                    id="quoteAddress"
                    required
                    value={quoteFormData.address}
                    onChange={(e) => setQuoteFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Rue, NPA Ville"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="surfaceArea">Surface approximative</Label>
                    <Input
                      id="surfaceArea"
                      value={quoteFormData.surfaceArea}
                      onChange={(e) => setQuoteFormData(prev => ({ ...prev, surfaceArea: e.target.value }))}
                      placeholder="ex: 200 m²"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quoteFrequency">Fréquence souhaitée</Label>
                    <select
                      id="quoteFrequency"
                      value={quoteFormData.frequency}
                      onChange={(e) => setQuoteFormData(prev => ({ ...prev, frequency: e.target.value }))}
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="daily">Quotidien</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="biweekly">Toutes les 2 semaines</option>
                      <option value="monthly">Mensuel</option>
                      <option value="once">Ponctuel</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="quoteMessage">Message (optionnel)</Label>
                  <Textarea
                    id="quoteMessage"
                    value={quoteFormData.message}
                    onChange={(e) => setQuoteFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Décrivez vos besoins spécifiques..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                {quoteError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {quoteError}
                  </div>
                )}
                <Button type="submit" className="w-full h-12" disabled={isSubmittingQuote}>
                  {isSubmittingQuote ? "Envoi en cours..." : "Envoyer ma demande de devis"}
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Suite du formulaire seulement si pas bureau */}
      {bookingData.cleaningType !== "bureau" && (
        <>
      <div>
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Où avez-vous besoin de nous ? 📍
        </h2>
        <p className="mt-2 text-muted-foreground">
          Entrez votre code postal pour vérifier notre disponibilité
        </p>
      </div>

      {/* Recherche par code postal */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="postalCode" className="text-base font-medium">
            Code postal
          </Label>
          <div className="relative mt-2">
            <Input
              id="postalCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="1200"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                setSearchQuery(value);
              }}
              className="h-14 text-lg pl-12"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <span className="text-xl">🇨🇭</span>
            </div>
          </div>
        </div>

        {/* Résultats de recherche */}
        {matchedCities.length > 0 && (
          <div className="space-y-2">
            <Label className="text-base font-medium">Sélectionnez votre ville</Label>
            <div className="grid gap-2">
              {matchedCities.map((city, index) => (
                <button
                  key={index}
                  onClick={() => selectCity(city)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    bookingData.city === city.name
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏠</span>
                    <div className="text-left">
                      <p className="font-semibold">{city.name}</p>
                      <p className="text-sm text-muted-foreground">Canton {city.canton}</p>
                    </div>
                  </div>
                  {city.available ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Disponible
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                      ⏳ Bientôt
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Code postal non couvert */}
        {showNotAvailable && matchedCities.length === 0 && searchQuery.length === 4 && (
          <div className="p-6 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🔔</span>
              <div>
                <h3 className="font-semibold text-amber-800">
                  Nous n'intervenons pas encore dans cette zone
                </h3>
                <p className="mt-1 text-amber-700 text-sm">
                  Laissez-nous votre email et nous vous préviendrons dès que nous serons disponibles !
                </p>
                <div className="mt-4 flex gap-2">
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    className="flex-1"
                  />
                  <Button variant="outline" className="bg-white">
                    Me notifier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ville sélectionnée mais pas encore disponible */}
        {showNotAvailable && bookingData.city && matchedCities.some(c => c.name === bookingData.city && !c.available) && (
          <div className="p-6 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⏳</span>
              <div>
                <h3 className="font-semibold text-amber-800">
                  {bookingData.city} arrive bientôt !
                </h3>
                <p className="mt-1 text-amber-700 text-sm">
                  Nous travaillons à étendre notre service. Laissez-nous votre email pour être prévenu !
                </p>
                <div className="mt-4 flex gap-2">
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    className="flex-1"
                  />
                  <Button variant="outline" className="bg-white">
                    Me notifier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aide - Zones couvertes */}
        <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
          <h4 className="font-medium flex items-center gap-2">
            <span>📍</span> Zones actuellement couvertes
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
              Genève (tout le canton)
            </span>
            <span className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
              Nyon et environs
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            🚀 <strong>Bientôt :</strong> Lausanne, Montreux, Vevey, Neuchâtel, Sion
          </p>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// Prix constants
const IRONING_RATE = 3.5; // CHF par pièce de repassage
const WINDOWS_RATE = 25; // CHF par heure de nettoyage fenêtres
const CUPBOARDS_PRICE = 30; // CHF pour 30min de placards
const FRIDGE_PRICE = 30; // CHF pour 30min de frigidaire
const OVEN_PRICE = 30; // CHF pour 30min de four

// Step 2: Date & Durée avec services supplémentaires
function Step2DateTime({
  bookingData,
  updateBookingData,
  updateExtras,
  updateHasPets,
  updateHasEquipment,
  hourlyRate,
}: {
  bookingData: BookingData;
  updateBookingData: (field: keyof BookingData, value: string | string[]) => void;
  updateExtras: (extras: ExtraService[]) => void;
  updateHasPets: (hasPets: boolean) => void;
  updateHasEquipment: (hasEquipment: boolean) => void;
  hourlyRate: number;
}) {
  // Modals state
  const [showTimeCalculator, setShowTimeCalculator] = React.useState(false);
  const [showIncludedModal, setShowIncludedModal] = React.useState(false);
  const [showWindowsModal, setShowWindowsModal] = React.useState(false);
  const [showIroningModal, setShowIroningModal] = React.useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = React.useState(false);
  
  // Equipment confirmation - use bookingData
  const hasEquipment = bookingData.hasEquipment || false;
  const setHasEquipment = (value: boolean) => updateHasEquipment(value);
  
  // Calculator state
  const [bedrooms, setBedrooms] = React.useState(1);
  const [bathrooms, setBathrooms] = React.useState(1);
  
  // Windows state
  const [standardWindows, setStandardWindows] = React.useState(0);
  const [largeWindows, setLargeWindows] = React.useState(0);
  
  // Ironing state (nombre de pièces)
  const [ironingPieces, setIroningPieces] = React.useState(5);
  
  // Services supplémentaires - utiliser bookingData.extras
  const extraServices = bookingData.extras || [];
  const setExtraServices = (newExtras: ExtraService[] | ((prev: ExtraService[]) => ExtraService[])) => {
    if (typeof newExtras === 'function') {
      updateExtras(newExtras(extraServices));
    } else {
      updateExtras(newExtras);
    }
  };
  
  // Animaux
  const hasPets = bookingData.hasPets || false;
  const setHasPets = (value: boolean) => updateHasPets(value);
  
  // Calculer la durée recommandée
  const calculateRecommendedHours = () => {
    return Math.max(3, Math.ceil(1.5 + (bedrooms * 0.5) + (bathrooms * 0.5)));
  };
  
  // Calculer le temps pour les fenêtres (30min par fenêtre)
  const calculateWindowsTime = () => {
    return ((standardWindows + largeWindows) * 30) / 60;
  };
  
  // Calculer le prix des fenêtres
  const calculateWindowsPrice = () => {
    const hours = calculateWindowsTime();
    return Math.ceil(hours * WINDOWS_RATE);
  };
  
  // Calculer le prix du repassage (par pièce)
  const calculateIroningPrice = () => {
    return Math.round(ironingPieces * IRONING_RATE * 100) / 100;
  };
  
  // Durée actuelle (minimum 3h)
  const duration = Math.max(3, parseInt(bookingData.duration) || 3);
  
  // Prix du ménage de base
  const basePrice = duration * hourlyRate;
  
  // Prix total des suppléments
  const extrasTotal = extraServices.reduce((sum, s) => sum + s.price, 0);
  
  // Navigation de la semaine
  const [weekOffset, setWeekOffset] = React.useState(0);
  const [timeAlert, setTimeAlert] = React.useState<string | null>(null);
  
  // On ne peut réserver que pour le lendemain minimum
  const getFirstAvailableDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };
  
  // Générer les dates de la semaine courante
  const getWeekDates = () => {
    const firstAvailable = getFirstAvailableDate();
    const startOfWeek = new Date(firstAvailable);
    startOfWeek.setDate(startOfWeek.getDate() + (weekOffset * 7));
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayOfWeek = date.getDay(); // 0 = dimanche
      const isSunday = dayOfWeek === 0;
      const isPast = date < getFirstAvailableDate();
      
      return {
        value: date.toISOString().split("T")[0],
        day: date.getDate(),
        weekday: date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""),
        isSunday,
        isDisabled: isSunday || isPast,
        fullDate: date,
      };
    });
  };
  
  const weekDates = getWeekDates();
  const currentMonth = weekDates[3]?.fullDate.toLocaleDateString("fr-FR", { month: "long" }) || "";
  const currentMonthCapitalized = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  // Créneaux horaires de 7h à 20h par 30 minutes
  const allTimeSlots = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00"
  ];
  
  // Vérifier si le créneau est valide avec la durée
  const isTimeSlotValid = (time: string) => {
    const [hour, minutes] = time.split(":").map(Number);
    const startTime = hour + minutes / 60;
    const endTime = startTime + duration;
    
    // La fin ne peut pas dépasser 22h
    if (endTime > 22) {
      return false;
    }
    
    return true;
  };
  
  // Vérifier et afficher une alerte si nécessaire
  const handleTimeSelect = (time: string) => {
    const [hour, minutes] = time.split(":").map(Number);
    const startTime = hour + minutes / 60;
    const endTime = startTime + duration;
    
    if (endTime > 22) {
      setTimeAlert(`Ce créneau n'est pas disponible car le ménage se terminerait après 22h. Veuillez choisir un créneau plus tôt ou réduire la durée.`);
      return;
    }
    
    setTimeAlert(null);
    updateBookingData("time", time);
  };
  
  const timeSlots = allTimeSlots.map(time => {
    const isValid = isTimeSlotValid(time);
    return { time, isDisabled: !isValid };
  });

  // Services supplémentaires
  const supplementaryServices = [
    { id: "windows", label: "Fenêtres", icon: "🪟", hasModal: true, priceLabel: "25 CHF/h" },
    { id: "ironing", label: "Repassage", icon: "👔", hasModal: true, priceLabel: "Prix bientôt disponible" },
    { id: "laundry", label: "Lessive & séchage", icon: "🧺", time: "+1h", priceLabel: "Prix bientôt disponible" },
    { id: "oven", label: "Intérieur du four", icon: "🔥", time: "+30min", price: OVEN_PRICE },
    { id: "cupboards", label: "Placards de cuisine", icon: "🗄️", time: "+30min", price: CUPBOARDS_PRICE },
    { id: "fridge", label: "Intérieur du frigidaire", icon: "❄️", time: "+30min", price: FRIDGE_PRICE },
  ];

  const toggleExtraService = (serviceId: string) => {
    if (serviceId === "windows") {
      setShowWindowsModal(true);
    } else if (serviceId === "ironing") {
      setShowIroningModal(true);
    } else {
      const service = supplementaryServices.find(s => s.id === serviceId);
      const isSelected = extraServices.some(s => s.id === serviceId);
      
      if (isSelected) {
        setExtraServices(prev => prev.filter(s => s.id !== serviceId));
      } else if (service && service.price) {
        setExtraServices(prev => [...prev, { 
          id: serviceId, 
          label: `${service.icon} ${service.label}`,
          price: service.price,
          details: service.time
        }]);
      }
    }
  };
  
  const isServiceSelected = (serviceId: string) => {
    return extraServices.some(s => s.id === serviceId);
  };

  return (
    <div className="space-y-6">
      {/* Duration with +/- - EN PREMIER */}
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="text-base sm:text-lg font-semibold">⏱️ Combien de temps auriez-vous besoin ?</h3>
          <button
            type="button"
            onClick={() => setShowTimeCalculator(true)}
            className="text-primary font-medium hover:underline text-sm"
          >
            Calculer le temps
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => duration > 3 && updateBookingData("duration", String(duration - 1))}
            className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 transition-colors ${
              duration <= 3 ? "border-gray-200 opacity-50" : "border-border hover:border-primary"
            }`}
            disabled={duration <= 3}
          >
            <span className="text-xl sm:text-2xl text-gray-400">−</span>
          </button>
          <div className="text-center">
            <span className="text-xl sm:text-2xl font-bold">{duration} heures</span>
            <p className="text-sm text-primary font-medium">{basePrice} CHF</p>
          </div>
          <button
            type="button"
            onClick={() => duration < 8 && updateBookingData("duration", String(duration + 1))}
            className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border-2 transition-colors ${
              duration >= 8 ? "border-gray-200 opacity-50" : "border-border hover:border-primary"
            }`}
            disabled={duration >= 8}
          >
            <span className="text-xl sm:text-2xl text-gray-400">+</span>
          </button>
        </div>
        
        <p className="text-xs sm:text-sm text-muted-foreground mt-4 text-center">
          Recommandé pour: {bedrooms} chambre{bedrooms > 1 ? "s" : ""}, {bathrooms} salle{bathrooms > 1 ? "s" : ""} de bain
          <button
            type="button"
            onClick={() => setShowTimeCalculator(true)}
            className="ml-1 text-gray-400 hover:text-gray-600"
          >
            ⓘ
          </button>
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Minimum 3 heures • {hourlyRate} CHF/heure
        </p>
      </div>

      {/* Fréquence / Abonnement */}
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold">🔄 À quelle fréquence ?</h3>
          {bookingData.frequency !== "once" && (
            <Badge className="bg-green-100 text-green-700 text-xs">
              -2 CHF/h avec abonnement
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {FREQUENCIES.map((freq) => {
            const isSelected = bookingData.frequency === freq.id;
            const isCustom = freq.id === "custom";
            
            return (
              <button
                key={freq.id}
                type="button"
                onClick={() => !isCustom && updateBookingData("frequency", freq.id)}
                disabled={isCustom}
                className={`relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all text-center ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : isCustom
                    ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                    : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                }`}
              >
                {freq.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                    Plus populaire
                  </span>
                )}
                {isCustom && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-400 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                    Bientôt
                  </span>
                )}
                <span className={`font-semibold text-xs sm:text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {freq.label}
                </span>
                {freq.discount > 0 && freq.id !== "once" && (
                  <span className="text-[10px] sm:text-xs text-green-600 mt-1">
                    {hourlyRate - freq.discount} CHF/h
                  </span>
                )}
                {freq.id === "once" && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {hourlyRate} CHF/h
                  </span>
                )}
                {isSelected && (
                  <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {bookingData.frequency !== "once" && (
          <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-700">
              ✅ <strong>Abonnement activé !</strong> Vous économisez {2 * (parseInt(bookingData.duration) || 2)} CHF sur cette réservation.
            </p>
            <p className="text-xs text-green-600 mt-1">
              Même intervenant(e) à chaque passage • Annulation flexible
            </p>
          </div>
        )}
      </div>

      {/* Card pour date et heure */}
      <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">
          📅 Sélectionnez une date et une heure
        </h2>
        
        {/* Checkbox animaux */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            id="hasPets"
            checked={hasPets}
            onChange={(e) => setHasPets(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="hasPets" className="text-sm text-foreground">
            J'ai des animaux 🐾
          </label>
        </div>
        
        {/* Calendrier semaine */}
        <div className="mb-6">
          {/* Header avec mois et navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => weekOffset > 0 && setWeekOffset(weekOffset - 1)}
              disabled={weekOffset === 0}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all shrink-0 ${
                weekOffset === 0 
                  ? "text-gray-300 cursor-not-allowed" 
                  : "text-foreground hover:bg-primary/10 active:bg-primary/20"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <p className="font-bold text-base sm:text-lg">{currentMonthCapitalized}</p>
              <p className="text-xs text-muted-foreground">Semaine {weekOffset + 1}</p>
            </div>
            
            <button
              type="button"
              onClick={() => weekOffset < 4 && setWeekOffset(weekOffset + 1)}
              disabled={weekOffset >= 4}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all shrink-0 ${
                weekOffset >= 4 
                  ? "text-gray-300 cursor-not-allowed" 
                  : "text-foreground hover:bg-primary/10 active:bg-primary/20"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Jours de la semaine - grille mobile optimisée */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDates.map((date) => {
              const isSelected = bookingData.date === date.value;
              return (
                <button
                  key={date.value}
                  type="button"
                  disabled={date.isDisabled}
                  onClick={() => !date.isDisabled && updateBookingData("date", date.value)}
                  className={`relative flex flex-col items-center py-2 sm:py-3 rounded-xl transition-all ${
                    date.isDisabled
                      ? "text-gray-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                      : "hover:bg-gray-100 active:bg-gray-200"
                  }`}
                >
                  <span className={`text-[10px] sm:text-xs font-medium uppercase mb-0.5 ${
                    date.isDisabled ? "text-gray-300" : isSelected ? "text-white/80" : "text-gray-500"
                  }`}>
                    {date.weekday.substring(0, 2)}
                  </span>
                  <span className={`text-base sm:text-xl font-bold ${
                    date.isDisabled ? "text-gray-300" : isSelected ? "text-white" : "text-foreground"
                  }`}>
                    {date.day}
                  </span>
                  {date.isSunday && !isSelected && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-gray-400">fermé</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Alerte dimanche */}
        {weekDates.some(d => d.isSunday && bookingData.date === d.value) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            ⚠️ Le dimanche n'est pas disponible pour les réservations.
          </div>
        )}
        
        {/* Créneaux horaires */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm sm:text-base">Choisissez l'heure</h4>
            {bookingData.time && (
              <span className="text-xs sm:text-sm text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                ✓ {bookingData.time}
              </span>
            )}
          </div>
          
          {timeAlert && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              ⚠️ {timeAlert}
            </div>
          )}
          
          {/* Groupes d'heures */}
          <div className="space-y-3">
            {/* Matin */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium">🌅 Matin</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {timeSlots.filter(t => parseInt(t.time) < 12).map(({ time, isDisabled }) => (
                  <button
                    key={time}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleTimeSelect(time)}
                    className={`rounded-lg py-2.5 sm:py-2 text-center transition-all text-xs sm:text-sm font-medium ${
                      isDisabled
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                        : bookingData.time === time
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-gray-50 text-foreground hover:bg-gray-100 active:bg-primary/10"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Après-midi */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium">☀️ Après-midi</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {timeSlots.filter(t => parseInt(t.time) >= 12 && parseInt(t.time) < 18).map(({ time, isDisabled }) => (
                  <button
                    key={time}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleTimeSelect(time)}
                    className={`rounded-lg py-2.5 sm:py-2 text-center transition-all text-xs sm:text-sm font-medium ${
                      isDisabled
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                        : bookingData.time === time
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-gray-50 text-foreground hover:bg-gray-100 active:bg-primary/10"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Soir */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium">🌙 Soir</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {timeSlots.filter(t => parseInt(t.time) >= 18).map(({ time, isDisabled }) => (
                  <button
                    key={time}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleTimeSelect(time)}
                    className={`rounded-lg py-2.5 sm:py-2 text-center transition-all text-xs sm:text-sm font-medium ${
                      isDisabled
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                        : bookingData.time === time
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-gray-50 text-foreground hover:bg-gray-100 active:bg-primary/10"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Créneau indisponible ?{" "}
            <a href="/aide" className="text-primary hover:underline">Contactez-nous</a>
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Supplementary Services */}
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Ajouter des services supplémentaires</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {supplementaryServices.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleExtraService(service.id)}
                className={`flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  isServiceSelected(service.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-xl sm:text-2xl mb-1 sm:mb-2">{service.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">{service.label}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {service.hasModal ? service.priceLabel : `+${service.price} CHF`}
                </span>
              </button>
            ))}
          </div>
          
          {/* Résumé des extras sélectionnés */}
          {extraServices.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Suppléments ({extraServices.length})</span>
                <span className="font-semibold text-primary">+{extrasTotal} CHF</span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions particulières */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            📝 Instructions particulières (optionnel)
          </label>
          <Textarea
            placeholder="Ex: Ne pas utiliser de javel, clés sous le paillasson, attention au chat..."
            value={bookingData.notes}
            onChange={(e) => updateBookingData("notes", e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Equipment Confirmation */}
        <div className="rounded-xl border border-border bg-gray-50 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasEquipment}
              onChange={(e) => setHasEquipment(e.target.checked)}
              className="h-5 w-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground">
              Je confirme avoir tout le{" "}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setShowEquipmentModal(true); }}
                className="text-primary font-semibold hover:underline"
              >
                matériel de ménage nécessaire
              </button>
              {" "}à mon domicile.
            </span>
          </label>
        </div>

        {/* What's Included Link */}
        <button
          type="button"
          onClick={() => setShowIncludedModal(true)}
          className="w-full text-center text-primary font-semibold hover:underline py-3"
        >
          Ce qui est inclus dans votre ménage
        </button>
      </div>

      {/* Time Calculator Modal */}
      {showTimeCalculator && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTimeCalculator(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-sm shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-lg font-bold">Calculateur de temps</h3>
              <button onClick={() => setShowTimeCalculator(false)} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Ajoutez le nombre de chambres et salles de bains.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-sm">Chambres</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => bedrooms > 1 && setBedrooms(bedrooms - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">−</button>
                  <span className="text-lg font-bold w-6 text-center">{bedrooms}</span>
                  <button type="button" onClick={() => setBedrooms(bedrooms + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-sm">Salles de bain</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => bathrooms > 1 && setBathrooms(bathrooms - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">−</button>
                  <span className="text-lg font-bold w-6 text-center">{bathrooms}</span>
                  <button type="button" onClick={() => setBathrooms(bathrooms + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">+</button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-primary/5 rounded-xl">
              <p className="text-sm">Recommandation: <strong>{calculateRecommendedHours()}h</strong> ({calculateRecommendedHours() * hourlyRate} CHF)</p>
              <p className="text-xs text-gray-500 mt-1">Salon, cuisine et espaces communs inclus</p>
            </div>
            
            <div className="flex gap-3 mt-4 pt-3 border-t">
              <button type="button" onClick={() => setShowTimeCalculator(false)}
                className="flex-1 py-2.5 text-primary font-semibold text-sm">Annuler</button>
              <button type="button" onClick={() => { updateBookingData("duration", String(calculateRecommendedHours())); setShowTimeCalculator(false); }}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm">Appliquer</button>
            </div>
          </div>
        </div>
      )}

      {/* Windows Modal */}
      {showWindowsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowWindowsModal(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-sm shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-lg font-bold">🪟 Fenêtres</h3>
              <button onClick={() => setShowWindowsModal(false)} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Nombre de fenêtres à nettoyer. <span className="text-primary font-medium">{WINDOWS_RATE} CHF/h</span>
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium text-sm">Fenêtres standard</span>
                  <p className="text-xs text-gray-400">~30 min/fenêtre</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => standardWindows > 0 && setStandardWindows(standardWindows - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">−</button>
                  <span className="text-lg font-bold w-6 text-center">{standardWindows}</span>
                  <button type="button" onClick={() => setStandardWindows(standardWindows + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium text-sm">Grandes fenêtres</span>
                  <p className="text-xs text-gray-400">~30 min/fenêtre</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => largeWindows > 0 && setLargeWindows(largeWindows - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">−</button>
                  <span className="text-lg font-bold w-6 text-center">{largeWindows}</span>
                  <button type="button" onClick={() => setLargeWindows(largeWindows + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border">+</button>
                </div>
              </div>
            </div>
            
            {(standardWindows > 0 || largeWindows > 0) && (
              <div className="mt-4 p-3 bg-primary/5 rounded-xl flex justify-between items-center">
                <span className="text-sm">Temps: <strong>{calculateWindowsTime().toFixed(1)}h</strong></span>
                <span className="text-lg font-bold text-primary">+{calculateWindowsPrice()} CHF</span>
              </div>
            )}
            
            <div className="flex gap-3 mt-4 pt-3 border-t">
              <button type="button" onClick={() => { setStandardWindows(0); setLargeWindows(0); setExtraServices(prev => prev.filter(s => s.id !== "windows")); setShowWindowsModal(false); }}
                className="flex-1 py-2.5 text-primary font-semibold text-sm">Annuler</button>
              <button type="button" onClick={() => {
                if (standardWindows > 0 || largeWindows > 0) {
                  const totalWindows = standardWindows + largeWindows;
                  setExtraServices(prev => [...prev.filter(s => s.id !== "windows"), { 
                    id: "windows", 
                    label: `🪟 Fenêtres (${totalWindows})`,
                    price: calculateWindowsPrice(), 
                    details: `${calculateWindowsTime().toFixed(1)}h` 
                  }]);
                } else { setExtraServices(prev => prev.filter(s => s.id !== "windows")); }
                setShowWindowsModal(false);
              }} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm">Appliquer</button>
            </div>
          </div>
        </div>
      )}

      {/* Ironing Modal */}
      {showIroningModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowIroningModal(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-sm shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="text-lg font-bold">👔 Repassage</h3>
              <button onClick={() => setShowIroningModal(false)} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 text-center">
              Prix par pièce. <span className="text-primary font-medium">{IRONING_RATE} CHF/pièce</span>
            </p>
            
            <div className="flex items-center justify-center gap-4 py-3">
              <button type="button" onClick={() => ironingPieces > 1 && setIroningPieces(ironingPieces - 1)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${ironingPieces <= 1 ? "border-gray-200 opacity-50" : "border-border"}`}
                disabled={ironingPieces <= 1}>−</button>
              <div className="text-center">
                <span className="text-xl font-bold">{ironingPieces} pièce{ironingPieces > 1 ? 's' : ''}</span>
                <p className="text-sm text-primary font-medium">+{calculateIroningPrice()} CHF</p>
              </div>
              <button type="button" onClick={() => ironingPieces < 30 && setIroningPieces(ironingPieces + 1)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${ironingPieces >= 30 ? "border-gray-200 opacity-50" : "border-border"}`}
                disabled={ironingPieces >= 30}>+</button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Assurez-vous que fer et table sont accessibles.
            </p>
            
            <div className="flex gap-3 mt-4 pt-3 border-t">
              <button type="button" onClick={() => { setIroningPieces(5); setExtraServices(prev => prev.filter(s => s.id !== "ironing")); setShowIroningModal(false); }}
                className="flex-1 py-2.5 text-primary font-semibold text-sm">Annuler</button>
              <button type="button" onClick={() => {
                setExtraServices(prev => [...prev.filter(s => s.id !== "ironing"), { 
                  id: "ironing", 
                  label: `👔 Repassage (${ironingPieces} pièce${ironingPieces > 1 ? 's' : ''})`,
                  price: calculateIroningPrice(), 
                  details: `${ironingPieces} pièce${ironingPieces > 1 ? 's' : ''}` 
                }]);
                setShowIroningModal(false);
              }} className="flex-1 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm">Appliquer</button>
            </div>
          </div>
        </div>
      )}

      {/* What's Included Modal */}
      {showIncludedModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowIncludedModal(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="text-lg font-bold">Ce qui est inclus</h3>
              <button onClick={() => setShowIncludedModal(false)} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="space-y-6">
                {/* Chambre, salon */}
                <div>
                  <div className="rounded-xl overflow-hidden h-32 sm:h-40 mb-3">
                    <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=300&fit=crop" alt="Chambre" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-sm mb-2">🛏️ Chambre & salon</h4>
                  <ul className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Aspirateur et sols</li>
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Dépoussiérage</li>
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Miroirs et vitres</li>
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Poubelles</li>
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Faire les lits</li>
                  </ul>
                </div>

                {/* Salle de bain */}
                <div>
                  <div className="rounded-xl overflow-hidden h-32 sm:h-40 mb-3">
                    <img src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=300&fit=crop" alt="Salle de bain" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-sm mb-2">🚿 Salle de bain</h4>
                  <ul className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Nettoyage sols</li>
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Miroirs</li>
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Désinfection WC/douche</li>
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Dépoussiérage</li>
                  </ul>
                </div>

                {/* Cuisine */}
                <div>
                  <div className="rounded-xl overflow-hidden h-32 sm:h-40 mb-3">
                    <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=300&fit=crop" alt="Cuisine" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-bold text-sm mb-2">🍳 Cuisine</h4>
                  <ul className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Nettoyage sols</li>
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Vaisselle</li>
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Évier et surfaces</li>
                    <li className="flex items-start gap-1"><span className="text-green-500">✓</span>Électroménager</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t shrink-0">
              <button type="button" onClick={() => setShowIncludedModal(false)}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm">
                Compris !
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equipment Modal */}
      {showEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEquipmentModal(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="text-lg font-bold">Équipement requis chez vous</h3>
              <button onClick={() => setShowEquipmentModal(false)} className="p-1 text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-4">
              <p className="text-sm text-gray-600 mb-5">
                Pour garantir un ménage efficace, merci de vous assurer d'avoir les éléments suivants à disposition. 
                N'oubliez pas de ranger un minimum avant l'arrivée de notre aide-ménagère — cela optimise le temps de nettoyage !
              </p>
              
              <div className="space-y-4">
                {/* Produits de nettoyage */}
                <div className="flex items-start gap-3">
                  <span className="text-xl">🧴</span>
                  <div>
                    <h4 className="font-bold text-sm">Produits de nettoyage</h4>
                    <p className="text-xs text-gray-500">Nettoyant multi-surfaces, produit WC, dégraissant cuisine</p>
                  </div>
                </div>
                
                {/* Aspirateur */}
                <div className="flex items-start gap-3">
                  <span className="text-xl">🔌</span>
                  <div>
                    <h4 className="font-bold text-sm">Un aspirateur fonctionnel</h4>
                    <p className="text-xs text-gray-500">Pour tous types de sols (parquet, carrelage, moquette)</p>
                  </div>
                </div>
                
                {/* Kit sols */}
                <div className="flex items-start gap-3">
                  <span className="text-xl">🧹</span>
                  <div>
                    <h4 className="font-bold text-sm">Kit d'entretien des sols</h4>
                    <p className="text-xs text-gray-500">Balai, serpillère ou balai-vapeur, seau</p>
                  </div>
                </div>
                
                {/* Accessoires */}
                <div className="flex items-start gap-3">
                  <span className="text-xl">🧤</span>
                  <div>
                    <h4 className="font-bold text-sm">Accessoires de base</h4>
                    <p className="text-xs text-gray-500">Chiffons microfibres, éponges, gants de ménage, plumeau</p>
                  </div>
                </div>
              </div>
              
              {/* Si extras sélectionnés */}
              {extraServices.length > 0 && (
                <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="font-bold text-sm text-amber-800 mb-2">📋 Pour vos services supplémentaires :</h4>
                  <ul className="space-y-1 text-xs text-amber-700">
                    {extraServices.some(s => s.id === "oven") && (
                      <li>— Produit décapant four (pour le nettoyage du four)</li>
                    )}
                    {extraServices.some(s => s.id === "laundry") && (
                      <li>— Lessive et adoucissant (pour le linge)</li>
                    )}
                    {extraServices.some(s => s.id === "windows") && (
                      <li>— Produit lave-vitres et chiffons microfibres</li>
                    )}
                    {extraServices.some(s => s.id === "ironing") && (
                      <li>— Fer à repasser et table à repasser</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t shrink-0">
              <button 
                type="button" 
                onClick={() => { setHasEquipment(true); setShowEquipmentModal(false); }}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm"
              >
                J'ai tout le nécessaire ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal d'authentification
function AuthModal({
  onClose,
  onAuthSuccess,
}: {
  onClose: () => void;
  onAuthSuccess: (user: UserAuth) => void;
}) {
  const [authMode, setAuthMode] = React.useState<"choose" | "email_login" | "email_register">("choose");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    if (isSupabaseConfigured()) {
      // Sauvegarder l'état de la réservation avant la redirection OAuth
      if (typeof window !== "undefined") {
        const savedData = localStorage.getItem("bookingWizardData");
        const savedStep = localStorage.getItem("bookingWizardStep");
        const bookingState = {
          step: savedStep ? parseInt(savedStep) + 1 : 4, // Avancer d'une étape après l'auth
          bookingData: savedData ? JSON.parse(savedData) : {},
          returnTo: window.location.pathname,
        };
        localStorage.setItem("bookingInProgress", JSON.stringify(bookingState));
      }
      
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
        },
      });
      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
      // La redirection se fait automatiquement
    } else {
      // Mode démo
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onAuthSuccess({
        id: `google_${Date.now()}`,
        email: "utilisateur@gmail.com",
        name: "Jean Dupont",
        provider: "google",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError(null);
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      
      if (authMode === "email_register") {
        const [firstName, ...lastNameParts] = name.split(' ');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              first_name: firstName,
              last_name: lastNameParts.join(' ') || undefined,
            },
          },
        });
        
        if (error) {
          setError(error.message);
          setIsLoading(false);
          return;
        }
        
        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email || email,
            name: name || email.split("@")[0],
            provider: "email",
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          setError(error.message);
          setIsLoading(false);
          return;
        }
        
        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || email.split("@")[0],
            provider: "email",
            avatar: data.user.user_metadata?.avatar_url,
          });
        }
      }
    } else {
      // Mode démo
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onAuthSuccess({
        id: `email_${Date.now()}`,
        email: email,
        name: authMode === "email_register" ? name : email.split("@")[0],
        provider: "email",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {authMode === "choose" ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <HugeiconsIcon icon={SecurityLockIcon} strokeWidth={1.5} className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Créer un compte</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pour continuer, veuillez vous connecter ou créer un compte
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Social Auth Buttons */}
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-white px-4 py-3.5 font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted/50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-muted-foreground">ou</span>
                </div>
              </div>

              {/* Email */}
              <button
                onClick={() => setAuthMode("email_login")}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-white px-4 py-3.5 font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted/50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Continuer avec Email
              </button>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              En continuant, vous acceptez nos{" "}
              <a href="#" className="text-primary hover:underline">Conditions d'utilisation</a>
              {" "}et notre{" "}
              <a href="#" className="text-primary hover:underline">Politique de confidentialité</a>
            </p>
          </>
        ) : (
          <>
            {/* Email Auth Form */}
            <button
              onClick={() => setAuthMode("choose")}
              className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="h-4 w-4" />
              Retour
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {authMode === "email_login" ? "Se connecter" : "Créer un compte"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {authMode === "email_login" 
                  ? "Entrez vos identifiants pour continuer" 
                  : "Créez votre compte Justmaid"}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {authMode === "email_register" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nom complet</label>
                  <input
                    type="text"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  placeholder="jean@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full rounded-full py-6 text-base font-semibold"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Connexion en cours...
                  </span>
                ) : authMode === "email_login" ? (
                  "Se connecter"
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              {authMode === "email_login" ? (
                <p className="text-muted-foreground">
                  Pas encore de compte ?{" "}
                  <button 
                    onClick={() => setAuthMode("email_register")}
                    className="text-primary font-medium hover:underline"
                  >
                    S'inscrire
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Déjà un compte ?{" "}
                  <button 
                    onClick={() => setAuthMode("email_login")}
                    className="text-primary font-medium hover:underline"
                  >
                    Se connecter
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
              <p className="text-sm font-medium text-muted-foreground">Connexion en cours...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 4: Informations personnelles
function Step4PersonalInfo({
  bookingData,
  updateBookingData,
}: {
  bookingData: BookingData;
  updateBookingData: (field: keyof BookingData, value: string) => void;
}) {
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.slice(0, 3)} ${v.slice(3)}`;
    if (v.length <= 8) return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6)}`;
    return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6, 8)} ${v.slice(8, 10)}`;
  };

  const formatPostalCode = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 4);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 9;
  };

  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field: string, value: string, type?: string) => {
    if (!touched[field]) return null;
    if (!value || value.trim() === "") return "Ce champ est requis";
    if (type === "email" && !isValidEmail(value)) return "Email invalide";
    if (type === "phone" && !isValidPhone(value)) return "Numéro incomplet";
    if (type === "postalCode" && value.length !== 4) return "Code postal à 4 chiffres";
    return null;
  };

  const inputClass = (field: string, value: string, type?: string) => {
    const error = getFieldError(field, value, type);
    return `h-12 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <span className="text-2xl">👤</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Vos coordonnées</h2>
          <p className="text-sm text-muted-foreground">Pour vous contacter et confirmer l'intervention</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Nom et Prénom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Prénom *</label>
            <Input
              type="text"
              placeholder="Jean"
              value={bookingData.firstName}
              onChange={(e) => updateBookingData("firstName", e.target.value)}
              onBlur={() => markTouched("firstName")}
              className={inputClass("firstName", bookingData.firstName)}
            />
            {getFieldError("firstName", bookingData.firstName) && (
              <p className="text-xs text-red-500">{getFieldError("firstName", bookingData.firstName)}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nom *</label>
            <Input
              type="text"
              placeholder="Dupont"
              value={bookingData.lastName}
              onChange={(e) => updateBookingData("lastName", e.target.value)}
              onBlur={() => markTouched("lastName")}
              className={inputClass("lastName", bookingData.lastName)}
            />
            {getFieldError("lastName", bookingData.lastName) && (
              <p className="text-xs text-red-500">{getFieldError("lastName", bookingData.lastName)}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email *</label>
          <Input
            type="email"
            placeholder="jean.dupont@exemple.com"
            value={bookingData.email}
            onChange={(e) => updateBookingData("email", e.target.value)}
            onBlur={() => markTouched("email")}
            className={inputClass("email", bookingData.email, "email")}
          />
          {getFieldError("email", bookingData.email, "email") ? (
            <p className="text-xs text-red-500">{getFieldError("email", bookingData.email, "email")}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Vous recevrez la confirmation de réservation à cette adresse
            </p>
          )}
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Téléphone *</label>
          <Input
            type="tel"
            placeholder="079 123 45 67"
            value={bookingData.phone}
            onChange={(e) => updateBookingData("phone", formatPhone(e.target.value))}
            onBlur={() => markTouched("phone")}
            maxLength={14}
            className={inputClass("phone", bookingData.phone, "phone")}
          />
          {getFieldError("phone", bookingData.phone, "phone") ? (
            <p className="text-xs text-red-500">{getFieldError("phone", bookingData.phone, "phone")}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              L'intervenant(e) vous contactera sur ce numéro
            </p>
          )}
        </div>

        {/* Séparateur */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-justmaid-turquoise/10">
              <span className="text-xl">📍</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Adresse d'intervention</h3>
              <p className="text-xs text-muted-foreground">Où l'intervenant(e) doit se rendre</p>
            </div>
          </div>
        </div>

        {/* Rue et Numéro */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Rue *</label>
            <Input
              type="text"
              placeholder="Rue de Lausanne"
              value={bookingData.street}
              onChange={(e) => updateBookingData("street", e.target.value)}
              onBlur={() => markTouched("street")}
              className={inputClass("street", bookingData.street)}
            />
            {getFieldError("street", bookingData.street) && (
              <p className="text-xs text-red-500">{getFieldError("street", bookingData.street)}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">N° *</label>
            <Input
              type="text"
              placeholder="12"
              value={bookingData.streetNumber}
              onChange={(e) => updateBookingData("streetNumber", e.target.value)}
              onBlur={() => markTouched("streetNumber")}
              className={inputClass("streetNumber", bookingData.streetNumber)}
            />
            {getFieldError("streetNumber", bookingData.streetNumber) && (
              <p className="text-xs text-red-500">{getFieldError("streetNumber", bookingData.streetNumber)}</p>
            )}
          </div>
        </div>

        {/* Code postal et Ville */}
        <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">NPA *</label>
            <Input
              type="text"
              placeholder="1201"
              value={bookingData.postalCode}
              onChange={(e) => updateBookingData("postalCode", formatPostalCode(e.target.value))}
              onBlur={() => markTouched("postalCode")}
              maxLength={4}
              className={inputClass("postalCode", bookingData.postalCode, "postalCode")}
            />
            {getFieldError("postalCode", bookingData.postalCode, "postalCode") && (
              <p className="text-xs text-red-500">{getFieldError("postalCode", bookingData.postalCode, "postalCode")}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Ville *</label>
            <Input
              type="text"
              placeholder="Genève"
              value={bookingData.city}
              onChange={(e) => updateBookingData("city", e.target.value)}
              onBlur={() => markTouched("city")}
              className={inputClass("city", bookingData.city)}
            />
            {getFieldError("city", bookingData.city) && (
              <p className="text-xs text-red-500">{getFieldError("city", bookingData.city)}</p>
            )}
          </div>
        </div>

        {/* Bâtiment, Étage, Digicode */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Bâtiment</label>
            <Input
              type="text"
              placeholder="A, B..."
              value={bookingData.building}
              onChange={(e) => updateBookingData("building", e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Étage</label>
            <Input
              type="text"
              placeholder="3ème"
              value={bookingData.floor}
              onChange={(e) => updateBookingData("floor", e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Code porte</label>
            <Input
              type="text"
              placeholder="1234"
              value={bookingData.doorCode}
              onChange={(e) => updateBookingData("doorCode", e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        {/* Info */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🔒</span>
            <div>
              <p className="font-medium text-foreground text-sm">Vos données sont protégées</p>
              <p className="text-sm text-muted-foreground">
                Vos informations personnelles ne seront utilisées que pour la gestion de votre réservation 
                et ne seront jamais partagées avec des tiers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 5: Paiement
function Step5Payment({
  onPaymentSuccess,
  calculatePrice,
  bookingData,
  isSubscription,
  user,
  hourlyRate,
}: {
  onPaymentSuccess: () => void;
  calculatePrice: () => number;
  bookingData: BookingData;
  isSubscription: boolean;
  user: UserAuth | null;
  hourlyRate: number;
}) {
  const [paymentStatus, setPaymentStatus] = React.useState<"pending" | "success" | "error">("pending");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handlePaymentSuccess = () => {
    setPaymentStatus("success");
    // Passer automatiquement à l'étape suivante après succès
    setTimeout(() => {
      onPaymentSuccess();
    }, 1500);
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus("error");
    setErrorMessage(error);
  };

  // Préparer les données d'abonnement si c'est un abonnement
  const extrasTotal = bookingData.extras?.reduce((sum, extra) => sum + extra.price, 0) || 0;
  const subscriptionData = isSubscription ? {
    frequency: bookingData.frequency as "weekly" | "biweekly" | "monthly",
    durationHours: parseInt(bookingData.duration) || 3,
    address: `${bookingData.street} ${bookingData.streetNumber}, ${bookingData.postalCode} ${bookingData.city}`,
    addressDetails: bookingData.building || bookingData.floor || bookingData.doorCode 
      ? `Bât. ${bookingData.building || '-'}, ${bookingData.floor || 'RDC'}, Code: ${bookingData.doorCode || '-'}`
      : undefined,
    preferredDay: bookingData.date ? new Date(bookingData.date).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() : undefined,
    preferredTime: bookingData.time || "09:00",
    baseHourlyRate: hourlyRate,
    extras: bookingData.extras?.map(e => ({ name: e.label, price: e.price })) || [],
    extrasTotal: extrasTotal,
    cleaningType: bookingData.cleaningType,
  } : undefined;

  if (paymentStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {isSubscription ? "Abonnement activé !" : "Paiement validé !"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isSubscription ? "Redirection vers votre tableau de bord..." : "Redirection vers le récapitulatif..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <HugeiconsIcon icon={CreditCardIcon} strokeWidth={1.5} className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isSubscription ? "Activer l'abonnement" : "Moyen de paiement"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSubscription ? "Paiement récurrent sécurisé" : "Vérification sécurisée de votre carte"}
          </p>
        </div>
      </div>

      {/* Info selon le type de paiement */}
      {isSubscription ? (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <span className="text-lg">🔄</span>
            </div>
            <div>
              <p className="font-medium text-primary">Abonnement récurrent</p>
              <p className="text-sm text-gray-600">
                Vous serez prélevé automatiquement de <strong>{calculatePrice()} CHF</strong> {bookingData.frequency === "weekly" ? "chaque semaine" : bookingData.frequency === "biweekly" ? "toutes les 2 semaines" : "chaque mois"}.
                Vous pouvez annuler à tout moment depuis votre tableau de bord.
              </p>
            </div>
          </div>
        </div>
      ) : (
      <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">Pré-autorisation sécurisée</p>
            <p className="text-sm text-green-700">
              Un montant de <strong>{calculatePrice()} CHF</strong> sera pré-autorisé sur votre carte. 
              Vous ne serez débité qu'après la réalisation du ménage. 
              Si vous annulez avant l'intervention, aucun montant ne sera prélevé.
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Stripe Payment Form */}
      <StripePaymentForm 
        amount={calculatePrice() * 100}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        customerEmail={user?.email}
        customerName={`${bookingData.firstName} ${bookingData.lastName}`}
        userId={user?.id}
        isSubscription={isSubscription}
        subscriptionData={subscriptionData}
      />

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

// Step 6: Confirmation
function Step6Confirmation({
  bookingData,
  calculatePrice,
  hourlyRate,
}: {
  bookingData: BookingData;
  calculatePrice: () => number;
  hourlyRate: number;
}) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const getHomeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      studio: "Studio",
      apartment: "Appartement",
      house: "Maison",
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={1.5} className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Récapitulatif de votre réservation</h2>
          <p className="text-sm text-muted-foreground">Vérifiez les détails avant de confirmer</p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl bg-muted/50 p-6">
        {/* Type de ménage */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-lg">
              {CLEANING_TYPES.find(t => t.id === bookingData.cleaningType)?.emoji || "🧹"}
            </span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Type de service</p>
            <p className="font-medium text-foreground">
              {CLEANING_TYPES.find(t => t.id === bookingData.cleaningType)?.label || "Ménage à domicile"}
            </p>
            <p className="text-sm text-primary font-semibold">
              {hourlyRate} CHF/heure
            </p>
          </div>
        </div>

        {/* Adresse */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <HugeiconsIcon icon={Home01Icon} strokeWidth={1.5} className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Adresse d'intervention</p>
            <p className="font-medium text-foreground">
              {bookingData.street} {bookingData.streetNumber}
              {bookingData.building && `, Bât. ${bookingData.building}`}
            </p>
            <p className="text-sm text-foreground">
              {bookingData.postalCode} {bookingData.city}
            </p>
            {bookingData.floor && (
              <p className="text-sm text-muted-foreground">{bookingData.floor} étage</p>
            )}
            {bookingData.doorCode && (
              <p className="text-sm text-muted-foreground">Code: {bookingData.doorCode}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {getHomeTypeLabel(bookingData.homeType)}
            </p>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-lg">👤</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vos coordonnées</p>
            <p className="font-medium text-foreground">
              {bookingData.firstName} {bookingData.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              {bookingData.email}
            </p>
            <p className="text-sm text-muted-foreground">
              {bookingData.phone}
            </p>
          </div>
        </div>

        {/* Date & Heure */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={1.5} className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date et heure</p>
            <p className="font-medium text-foreground capitalize">
              {formatDate(bookingData.date)} à {bookingData.time}
            </p>
            <p className="text-sm text-muted-foreground">
              Durée : {bookingData.duration} heures
            </p>
          </div>
        </div>

        {/* Services supplémentaires */}
        {bookingData.extras && bookingData.extras.length > 0 && (
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Services supplémentaires</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {bookingData.extras.map((extra, index) => (
                  <Badge key={index} variant="secondary">
                    {extra.label} (+{extra.price} CHF)
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Animaux */}
        {bookingData.hasPets && (
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <span className="text-lg">🐾</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Information importante</p>
              <p className="text-foreground">Présence d'animaux dans le logement</p>
            </div>
          </div>
        )}

        {/* Notes */}
        {bookingData.notes && (
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-lg">📝</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Instructions</p>
              <p className="text-foreground">{bookingData.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Prix */}
      <div className="rounded-xl border-2 border-primary bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total à payer</p>
            <p className="text-3xl font-bold text-primary">{calculatePrice()} CHF</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {bookingData.duration}h × {hourlyRate} CHF/h
            </p>
            <Badge className="mt-1 bg-green-100 text-green-700">
              Paiement après intervention
            </Badge>
          </div>
        </div>
      </div>

      {/* Rappel important : ce que le client doit prévoir */}
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">À prévoir pour l'intervention</h3>
            <p className="text-sm text-amber-800 mb-3">
              Les produits et équipements de ménage ne sont <strong>pas fournis</strong>. 
              Merci de mettre à disposition :
            </p>
            <ul className="text-sm text-amber-800 space-y-1.5">
              <li className="flex items-center gap-2">
                <span>🧹</span> Aspirateur en état de marche
              </li>
              <li className="flex items-center gap-2">
                <span>🧽</span> Éponges, chiffons et serpillière
              </li>
              <li className="flex items-center gap-2">
                <span>🧴</span> Produits ménagers (multi-surfaces, vitres, sol, salle de bain)
              </li>
              <li className="flex items-center gap-2">
                <span>🗑️</span> Sacs poubelle
              </li>
              <li className="flex items-center gap-2">
                <span>🪣</span> Seau et balai si nécessaire
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Info confirmation */}
      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
        <p>
          <strong>✅ Réservation confirmée !</strong> Vous recevrez un email de confirmation 
          avec tous les détails de votre intervention. Merci de votre confiance !
        </p>
      </div>
    </div>
  );
}

// Vertical Stepper for sidebar
function VerticalStepper({
  steps,
  currentStep,
}: {
  steps: { id: number; title: string; description: string }[];
  currentStep: number;
}) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative">
            <div className="flex items-start gap-4">
              {/* Circle */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    isCompleted
                      ? "border-primary bg-primary text-white"
                      : isCurrent
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/30"
                      : "border-muted-foreground/30 bg-background text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                {/* Vertical line */}
                {!isLast && (
                  <div
                    className={`absolute top-10 h-8 w-0.5 ${
                      isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pt-1">
                <p
                  className={`font-medium ${
                    isCurrent ? "text-foreground" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
