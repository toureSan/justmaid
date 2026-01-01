import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const steps = [
  { id: 1, title: "Date & Durée", description: "Quand et combien de temps" },
  { id: 2, title: "Détails", description: "Tâches à effectuer" },
  { id: 3, title: "Coordonnées", description: "Vos informations" },
  { id: 4, title: "Paiement", description: "Vérification carte" },
  { id: 5, title: "Confirmation", description: "Récapitulatif" },
];

interface BookingData {
  address: string;
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
  { id: "ironing", label: "Repassage", icon: "👕" },
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

  // Charger l'utilisateur depuis localStorage au montage
  React.useEffect(() => {
    const savedUser = localStorage.getItem("justmaid_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setIsAuthenticated(true);
      // Pré-remplir les infos personnelles si disponibles
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
  }, []);

  // Charger les données depuis la page d'accueil
  React.useEffect(() => {
    const draft = localStorage.getItem("bookingDraft");
    if (draft) {
      const parsed = JSON.parse(draft);
      setBookingData((prev) => ({
        ...prev,
        address: parsed.address || "",
        homeType: parsed.homeType || "apartment",
        duration: parsed.duration || "3",
        coords: parsed.coords || null,
      }));
      // Nettoyer le draft
      localStorage.removeItem("bookingDraft");
    }
  }, []);

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
        return bookingData.date && bookingData.time && bookingData.duration;
      case 2:
        return bookingData.tasks.length > 0;
      case 3:
        // Informations personnelles - vérifier que tous les champs sont remplis
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[\d\s+()-]{10,}$/;
        return (
          bookingData.firstName.trim().length >= 2 &&
          bookingData.lastName.trim().length >= 2 &&
          emailRegex.test(bookingData.email) &&
          phoneRegex.test(bookingData.phone.replace(/\s/g, ""))
        );
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
    setIsSubmitting(true);

    // Créer l'objet booking
    const booking = {
      id: `booking_${Date.now()}`,
      type: "cleaning" as const,
      address: bookingData.address || "Adresse non spécifiée",
      homeType: bookingData.homeType,
      homeSize: bookingData.homeSize,
      date: bookingData.date,
      time: bookingData.time,
      hours: parseInt(bookingData.duration),
      tasks: bookingData.tasks,
      notes: bookingData.notes,
      // Informations personnelles
      customer: {
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
      },
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };

    // Sauvegarder dans localStorage
    const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    existingBookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(existingBookings));

    // Simuler un délai
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);

    // Rediriger vers le dashboard
    navigate({ to: "/dashboard", search: { tab: "home" } });
  };

  const calculatePrice = () => {
    const hours = parseInt(bookingData.duration) || 0;
    const basePrice = 25;
    return hours * basePrice;
  };

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Modal d'authentification */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* Afficher l'utilisateur connecté */}
      {isAuthenticated && user && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-green-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-green-600">Connecté en tant que</p>
              <p className="font-medium text-green-800 truncate">{user.name}</p>
            </div>
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-5 w-5 text-green-600" />
          </div>
        </div>
      )}

      {/* Afficher l'adresse si elle existe */}
      {bookingData.address && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
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
          {bookingData.coords && (
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <span>📍</span>
              <span>Position GPS : {bookingData.coords.lat.toFixed(4)}, {bookingData.coords.lng.toFixed(4)}</span>
            </div>
          )}
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
            {currentStep}/5
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 rounded-full"
            style={{ 
              width: `${(currentStep / 5) * 100}%`,
              backgroundColor: '#2FCCC0'
            }}
          />
        </div>
      </div>

      {/* Layout: Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
        {/* Main Content - Left */}
        <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-lg sm:p-6 lg:p-8">
          {currentStep === 1 && (
            <Step1DateTime bookingData={bookingData} updateBookingData={updateBookingData} />
          )}
          {currentStep === 2 && (
            <Step2Tasks
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              toggleTask={toggleTask}
            />
          )}
          {currentStep === 3 && (
            <Step3PersonalInfo 
              bookingData={bookingData} 
              updateBookingData={updateBookingData}
            />
          )}
          {currentStep === 4 && (
            <Step4Payment 
              onPaymentSuccess={() => setCurrentStep(5)} 
              calculatePrice={calculatePrice}
            />
          )}
          {currentStep === 5 && (
            <Step5Confirmation bookingData={bookingData} calculatePrice={calculatePrice} />
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
                    Confirmer la réservation
                    <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
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

// Step 1: Date & Durée
function Step1DateTime({
  bookingData,
  updateBookingData,
}: {
  bookingData: BookingData;
  updateBookingData: (field: keyof BookingData, value: string) => void;
}) {
  // Générer les dates des 7 prochains jours
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split("T")[0],
      label: i === 0 ? "Aujourd'hui" : i === 1 ? "Demain" : date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }),
    };
  });

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

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
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => updateBookingData("time", time)}
                className={`rounded-lg border-2 p-3 text-center transition-all ${
                  bookingData.time === time
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

// Step 2: Tâches
function Step2Tasks({
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

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    // Simuler l'authentification Google
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onAuthSuccess({
      id: `google_${Date.now()}`,
      email: "utilisateur@gmail.com",
      name: "Jean Dupont",
      provider: "google",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    });
  };

  const handleAppleAuth = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onAuthSuccess({
      id: `apple_${Date.now()}`,
      email: "utilisateur@icloud.com",
      name: "Marie Martin",
      provider: "apple",
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onAuthSuccess({
      id: `email_${Date.now()}`,
      email: email,
      name: authMode === "email_register" ? name : email.split("@")[0],
      provider: "email",
    });
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

              {/* Apple */}
              <button
                onClick={handleAppleAuth}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-black px-4 py-3.5 font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continuer avec Apple
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

// Step 3: Informations personnelles
function Step3PersonalInfo({
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

// Step 4: Paiement
type PaymentMethod = "card" | "twint" | "apple_pay" | "google_pay";

function Step4Payment({
  onPaymentSuccess,
  calculatePrice,
}: {
  onPaymentSuccess: () => void;
  calculatePrice: () => number;
}) {
  const [paymentStatus, setPaymentStatus] = React.useState<"pending" | "success" | "error">("pending");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod>("card");

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

  const paymentMethods: { id: PaymentMethod; name: string; icon: React.ReactNode; available: boolean }[] = [
    {
      id: "card",
      name: "Carte bancaire",
      available: true,
      icon: (
        <div className="flex items-center gap-1">
          <svg viewBox="0 0 48 32" className="h-5 w-auto">
            <rect fill="#1A1F71" width="48" height="32" rx="4"/>
            <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial">VISA</text>
          </svg>
          <svg viewBox="0 0 48 32" className="h-5 w-auto">
            <rect fill="#000" width="48" height="32" rx="4"/>
            <circle cx="18" cy="16" r="10" fill="#EB001B"/>
            <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
          </svg>
        </div>
      ),
    },
    {
      id: "twint",
      name: "TWINT",
      available: true,
      icon: (
        <svg viewBox="0 0 48 32" className="h-5 w-auto">
          <rect fill="#000" width="48" height="32" rx="4"/>
          <text x="24" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">TWINT</text>
        </svg>
      ),
    },
    {
      id: "apple_pay",
      name: "Apple Pay",
      available: true,
      icon: (
        <svg viewBox="0 0 48 32" className="h-5 w-auto">
          <rect fill="#000" width="48" height="32" rx="4"/>
          <text x="24" y="19" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial"> Pay</text>
        </svg>
      ),
    },
    {
      id: "google_pay",
      name: "Google Pay",
      available: true,
      icon: (
        <svg viewBox="0 0 48 32" className="h-5 w-auto">
          <rect fill="#fff" width="48" height="32" rx="4" stroke="#ddd"/>
          <text x="24" y="19" textAnchor="middle" fill="#5F6368" fontSize="9" fontWeight="bold" fontFamily="Arial">G Pay</text>
        </svg>
      ),
    },
  ];

  if (paymentStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {selectedMethod === "card" && "Carte vérifiée !"}
          {selectedMethod === "twint" && "TWINT connecté !"}
          {selectedMethod === "apple_pay" && "Apple Pay configuré !"}
          {selectedMethod === "google_pay" && "Google Pay configuré !"}
        </h2>
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
          <p className="text-sm text-muted-foreground">Choisissez votre moyen de paiement préféré</p>
        </div>
      </div>

      {/* Info paiement après intervention */}
      <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">Paiement après l'intervention</p>
            <p className="text-sm text-green-700">
              Vous ne serez débité de <strong>{calculatePrice()} CHF</strong> qu'après la réalisation du ménage. 
              Un pré-débit de 1 CHF sera effectué pour vérifier votre moyen de paiement (remboursé sous 24h).
            </p>
          </div>
        </div>
      </div>

      {/* Sélection du mode de paiement */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Choisissez un moyen de paiement</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              disabled={!method.available}
              className={`relative flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                selectedMethod === method.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              } ${!method.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {/* Radio indicator */}
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                selectedMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground/30"
              }`}>
                {selectedMethod === method.id && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              
              {/* Icon */}
              {method.icon}
              
              {/* Name */}
              <span className="font-medium text-foreground">{method.name}</span>
              
              {/* Selected check */}
              {selectedMethod === method.id && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-5 w-5 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire selon le mode sélectionné */}
      {selectedMethod === "card" && (
        <StripePaymentFormComponent 
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}

      {selectedMethod === "twint" && (
        <TwintPaymentForm 
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}

      {selectedMethod === "apple_pay" && (
        <ApplePayForm 
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          calculatePrice={calculatePrice}
        />
      )}

      {selectedMethod === "google_pay" && (
        <GooglePayForm 
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          calculatePrice={calculatePrice}
        />
      )}

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Sécurité */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        <HugeiconsIcon icon={SecurityLockIcon} strokeWidth={2} className="h-5 w-5 text-primary" />
        <span>Paiement 100% sécurisé - Vos données sont chiffrées</span>
      </div>
    </div>
  );
}

// Formulaire TWINT
function TwintPaymentForm({
  onPaymentSuccess,
  onPaymentError,
}: {
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}) {
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.slice(0, 3)} ${v.slice(3)}`;
    return `${v.slice(0, 3)} ${v.slice(3, 6)} ${v.slice(6, 8)} ${v.slice(8, 10)}`;
  };

  const isValid = phoneNumber.replace(/\s/g, "").length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onPaymentSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border p-4">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black mb-3">
          <span className="text-white font-bold text-lg">TWINT</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Connectez votre compte TWINT pour les paiements rapides
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Numéro de téléphone</label>
        <input
          type="tel"
          placeholder="079 123 45 67"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
          maxLength={14}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <Button
        type="submit"
        disabled={!isValid || isProcessing}
        className="w-full rounded-full py-6 text-base font-semibold bg-black hover:bg-gray-800"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Connexion en cours...
          </span>
        ) : (
          "Connecter TWINT"
        )}
      </Button>

      <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 text-center">
        Mode démo : Entrez n'importe quel numéro de téléphone suisse
      </div>
    </form>
  );
}

// Formulaire Apple Pay
function ApplePayForm({
  onPaymentSuccess,
  onPaymentError,
  calculatePrice,
}: {
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  calculatePrice: () => number;
}) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubmit = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onPaymentSuccess();
  };

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black mb-3">
          <span className="text-white font-bold text-lg"> Pay</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Payez rapidement avec Apple Pay
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">Montant du pré-débit</p>
        <p className="text-2xl font-bold text-foreground">1,00 CHF</p>
        <p className="text-xs text-muted-foreground mt-1">Remboursé sous 24h</p>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isProcessing}
        className="w-full rounded-full py-6 text-base font-semibold bg-black hover:bg-gray-800"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Vérification...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Payer avec Apple Pay
          </span>
        )}
      </Button>

      <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 text-center">
        Mode démo : Cliquez sur le bouton pour simuler Apple Pay
      </div>
    </div>
  );
}

// Formulaire Google Pay
function GooglePayForm({
  onPaymentSuccess,
  onPaymentError,
  calculatePrice,
}: {
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  calculatePrice: () => number;
}) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubmit = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    onPaymentSuccess();
  };

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white border border-gray-200 mb-3">
          <span className="text-gray-700 font-bold text-lg">G Pay</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Payez rapidement avec Google Pay
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">Montant du pré-débit</p>
        <p className="text-2xl font-bold text-foreground">1,00 CHF</p>
        <p className="text-xs text-muted-foreground mt-1">Remboursé sous 24h</p>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isProcessing}
        className="w-full rounded-full py-6 text-base font-semibold bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-800 border-t-transparent" />
            Vérification...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Payer avec Google Pay
          </span>
        )}
      </Button>

      <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 text-center">
        Mode démo : Cliquez sur le bouton pour simuler Google Pay
      </div>
    </div>
  );
}

// Composant Stripe Payment Form (mode démo)
function StripePaymentFormComponent({
  onPaymentSuccess,
  onPaymentError,
}: {
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}) {
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
    
    // Simuler le traitement Stripe
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onPaymentSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border p-4">
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

      {/* Info mode démo */}
      <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700 text-center">
        <strong>Mode démo :</strong> Utilisez 4242 4242 4242 4242 pour tester
      </div>
    </form>
  );
}

// Step 5: Confirmation
function Step5Confirmation({
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
            <p className="text-sm text-muted-foreground">Adresse</p>
            <p className="font-medium text-foreground">
              {bookingData.address || "Adresse non spécifiée"}
            </p>
            <p className="text-sm text-muted-foreground">
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
