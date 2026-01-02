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
  Clock01Icon,
  Home01Icon,
  Calendar03Icon,
  CreditCardIcon,
  SecurityLockIcon,
} from "@hugeicons/core-free-icons";
import { createBooking } from "@/services/bookingService";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { StripePaymentForm } from "./StripePaymentForm";

const steps = [
  { id: 1, title: "Adresse", description: "Lieu d'intervention" },
  { id: 2, title: "Date & Durée", description: "Quand et combien de temps" },
  { id: 3, title: "Détails", description: "Tâches à effectuer" },
  { id: 4, title: "Coordonnées", description: "Vos informations" },
  { id: 5, title: "Paiement", description: "Vérification carte" },
  { id: 6, title: "Confirmation", description: "Récapitulatif" },
];

interface BookingData {
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

const taskOptions = [
  { id: "dusting", label: "Dépoussiérage", icon: "🧹" },
  { id: "vacuuming", label: "Aspirateur", icon: "🔌" },
  { id: "mopping", label: "Lavage des sols", icon: "🧽" },
  { id: "bathroom", label: "Salle de bain", icon: "🚿" },
  { id: "kitchen", label: "Cuisine", icon: "🍳" },
  { id: "windows", label: "Vitres intérieures", icon: "🪟" },
  { id: "bedmaking", label: "Lits", icon: "🛏️" },
];

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
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBookingData(prev => ({
          ...prev,
          ...parsed,
        }));
        if (savedStep) {
          const step = parseInt(savedStep);
          if (step >= 1 && step <= 6) {
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

  const toggleTask = (taskId: string) => {
    setBookingData((prev) => ({
      ...prev,
      tasks: prev.tasks.includes(taskId)
        ? prev.tasks.filter((t) => t !== taskId)
        : [...prev.tasks, taskId],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Étape adresse : code postal + ville requis
        return bookingData.postalCode.trim().length === 4 && bookingData.city.trim().length >= 2;
      case 2:
        return bookingData.date && bookingData.time && bookingData.duration;
      case 3:
        return bookingData.tasks.length > 0;
      case 4:
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
      case 5:
        // Le paiement gère sa propre navigation
        return false;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    // Si on veut passer à l'étape 4 (coordonnées) et qu'on n'est pas connecté
    if (currentStep === 3 && !isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (currentStep < 6) {
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
      // Créer la réservation avec le service
      const { booking, error } = await createBooking(user.id, {
        serviceType: "cleaning",
        address: fullAddress,
        addressDetails: addressDetails,
        latitude: bookingData.coords?.lat,
        longitude: bookingData.coords?.lng,
        homeType: bookingData.homeType,
        homeSize: bookingData.homeSize || undefined,
        date: bookingData.date,
        time: bookingData.time,
        duration: parseInt(bookingData.duration) || 3,
        tasks: bookingData.tasks,
        notes: bookingData.notes || undefined,
        totalPrice: calculatePrice(),
      });

      if (error) {
        console.error("Error creating booking:", error);
        alert("Erreur lors de la création de la réservation: " + error);
        setIsSubmitting(false);
        return;
      }

      console.log("Booking created:", booking);
      setIsSubmitting(false);

      // Rediriger vers le dashboard
      navigate({ to: "/dashboard", search: { tab: "home" } });
    } catch (err) {
      console.error("Error:", err);
      setIsSubmitting(false);
    }
  };

  const calculatePrice = () => {
    const hours = parseInt(bookingData.duration) || 0;
    const basePrice = 25;
    return hours * basePrice;
  };

  return (
    <div className="mx-auto max-w-12xl px-0">
      {/* Modal d'authentification */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Afficher l'utilisateur connecté - version compacte avec lien dashboard */}
      {isAuthenticated && user && (
        <div className="mb-4 flex items-center justify-end gap-2 text-sm">
          <button
            onClick={() => navigate({ to: "/dashboard", search: { tab: "home" } })}
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
        </div>
      )}

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
            <Step2DateTime bookingData={bookingData} updateBookingData={updateBookingData} />
          )}
          {currentStep === 3 && (
            <Step3Tasks
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              toggleTask={toggleTask}
            />
          )}
          {currentStep === 4 && (
            <Step4PersonalInfo 
              bookingData={bookingData} 
              updateBookingData={updateBookingData}
            />
          )}
          {currentStep === 5 && (
            <Step5Payment 
              onPaymentSuccess={() => setCurrentStep(6)} 
              calculatePrice={calculatePrice}
            />
          )}
          {currentStep === 6 && (
            <Step6Confirmation bookingData={bookingData} calculatePrice={calculatePrice} />
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

            {currentStep < 6 ? (
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
                    Confirmer la réservation
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
          <div className="mt-8 border-t border-border/50 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimation</span>
              <span className="text-2xl font-bold text-primary">{calculatePrice()} CHF</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {bookingData.duration || 3}h × 25 CHF/h
            </p>
          </div>
        </div>
      </div>
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

  return (
    <div className="space-y-12">
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
    </div>
  );
}

// Step 2: Date & Durée
function Step2DateTime({
  bookingData,
  updateBookingData,
}: {
  bookingData: BookingData;
  updateBookingData: (field: keyof BookingData, value: string) => void;
}) {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Si après 19h, on ne peut plus réserver pour aujourd'hui
  const isTooLateToday = currentHour >= 19;
  
  // Générer les dates des 7 prochains jours
  const dates = Array.from({ length: 7 }, (_, i) => {
    // Si après 19h, commencer à partir de demain
    const offset = isTooLateToday ? i + 1 : i;
    const date = new Date();
    date.setDate(date.getDate() + offset);
    
    const isToday = offset === 0;
    const isTomorrow = offset === 1;
    
    return {
      value: date.toISOString().split("T")[0],
      label: isToday ? "Aujourd'hui" : isTomorrow ? "Demain" : date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }),
      isDisabled: false,
    };
  });

  // Créneaux horaires de 6h à 19h
  const allTimeSlots = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", 
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];
  
  // Filtrer les créneaux passés si c'est aujourd'hui
  const selectedDate = bookingData.date;
  const today = new Date().toISOString().split("T")[0];
  const isSelectedDateToday = selectedDate === today;
  
  const timeSlots = allTimeSlots.map(time => {
    const [hour] = time.split(":").map(Number);
    // Si c'est aujourd'hui, désactiver les créneaux passés (avec 1h de marge)
    const isDisabled = isSelectedDateToday && hour <= currentHour;
    return { time, isDisabled };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <HugeiconsIcon icon={Calendar03Icon} strokeWidth={1.5} className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Quand souhaitez-vous le ménage ?</h2>
          <p className="text-sm text-muted-foreground">Choisissez une date et une heure</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Date</label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {dates.map((date) => (
              <button
                key={date.value}
                type="button"
                onClick={() => updateBookingData("date", date.value)}
                className={`rounded-lg border-2 p-3 text-center transition-all ${
                  bookingData.date === date.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-xs font-medium">{date.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Heure de début</label>
          <p className="text-xs text-muted-foreground">Créneaux disponibles de 6h à 19h</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {timeSlots.map(({ time, isDisabled }) => (
              <button
                key={time}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && updateBookingData("time", time)}
                className={`rounded-lg border-2 p-3 text-center transition-all ${
                  isDisabled
                    ? "border-border/50 bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50"
                    : bookingData.time === time
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="text-sm font-medium">{time}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Durée de l'intervention</label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { hours: "2", price: "50 CHF" },
              { hours: "3", price: "75 CHF" },
              { hours: "4", price: "100 CHF" },
              { hours: "5", price: "125 CHF" },
            ].map((option) => (
              <button
                key={option.hours}
                type="button"
                onClick={() => updateBookingData("duration", option.hours)}
                className={`rounded-lg border-2 p-4 text-center transition-all ${
                  bookingData.duration === option.hours
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="h-4 w-4 text-muted-foreground" />
                  <span className={`text-lg font-bold ${bookingData.duration === option.hours ? "text-primary" : "text-foreground"}`}>
                    {option.hours}h
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{option.price}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Tâches
function Step3Tasks({
  bookingData,
  updateBookingData,
  toggleTask,
}: {
  bookingData: BookingData;
  updateBookingData: (field: keyof BookingData, value: string) => void;
  toggleTask: (taskId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <span className="text-2xl">✨</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Que devons-nous faire ?</h2>
          <p className="text-sm text-muted-foreground">Sélectionnez les tâches à effectuer</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {taskOptions.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleTask(task.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                bookingData.tasks.includes(task.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="text-2xl">{task.icon}</span>
              <span className={`text-sm font-medium text-center ${
                bookingData.tasks.includes(task.id) ? "text-primary" : "text-foreground"
              }`}>
                {task.label}
              </span>
              {bookingData.tasks.includes(task.id) && (
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Instructions particulières (optionnel)
          </label>
          <Textarea
            placeholder="Ex: Ne pas utiliser de javel, clés sous le paillasson, attention au chat..."
            value={bookingData.notes}
            onChange={(e) => updateBookingData("notes", e.target.value)}
            rows={4}
          />
        </div>
      </div>
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
                  : "Créez votre compte justmaid"}
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
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nom *</label>
            <Input
              type="text"
              placeholder="Dupont"
              value={bookingData.lastName}
              onChange={(e) => updateBookingData("lastName", e.target.value)}
              className="h-12"
            />
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
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            Vous recevrez la confirmation de réservation à cette adresse
          </p>
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Téléphone *</label>
          <Input
            type="tel"
            placeholder="079 123 45 67"
            value={bookingData.phone}
            onChange={(e) => updateBookingData("phone", formatPhone(e.target.value))}
            maxLength={14}
            className="h-12"
          />
          <p className="text-xs text-muted-foreground">
            L'intervenant(e) vous contactera sur ce numéro
          </p>
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
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">N° *</label>
            <Input
              type="text"
              placeholder="12"
              value={bookingData.streetNumber}
              onChange={(e) => updateBookingData("streetNumber", e.target.value)}
              className="h-12"
            />
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
              maxLength={4}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Ville *</label>
            <Input
              type="text"
              placeholder="Genève"
              value={bookingData.city}
              onChange={(e) => updateBookingData("city", e.target.value)}
              className="h-12"
            />
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
}: {
  onPaymentSuccess: () => void;
  calculatePrice: () => number;
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

  if (paymentStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Paiement validé !</h2>
        <p className="text-sm text-muted-foreground">Redirection vers le récapitulatif...</p>
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
          <h2 className="text-xl font-bold text-foreground">Moyen de paiement</h2>
          <p className="text-sm text-muted-foreground">Vérification sécurisée de votre carte</p>
        </div>
      </div>

      {/* Info pré-autorisation */}
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

      {/* Stripe Payment Form avec pré-autorisation du montant total */}
      <StripePaymentForm 
        amount={calculatePrice() * 100} // Montant total en centimes
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
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
}: {
  bookingData: BookingData;
  calculatePrice: () => number;
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

  const getTaskLabel = (taskId: string) => {
    return taskOptions.find((t) => t.id === taskId)?.label || taskId;
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

        {/* Tâches */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-lg">✨</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tâches à effectuer</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {bookingData.tasks.map((taskId) => (
                <Badge key={taskId} variant="secondary">
                  {getTaskLabel(taskId)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

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
              {bookingData.duration}h × 25 CHF/h
            </p>
            <Badge className="mt-1 bg-green-100 text-green-700">
              Paiement après intervention
            </Badge>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
        <p>
          <strong>Mode démo :</strong> Cette réservation sera enregistrée localement. 
          Dans la version finale, vous recevrez une confirmation par email.
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
