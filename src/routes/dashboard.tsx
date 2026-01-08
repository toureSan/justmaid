import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  Home01Icon,
  Clock01Icon,
  Cancel01Icon,
  PlusSignIcon,
  Tick02Icon,
  Tag01Icon,
  RepeatIcon,
  StarIcon,
  UserIcon,
  HelpCircleIcon,
  Copy01Icon,
  Share01Icon,
  ArrowRight01Icon,
  CreditCardIcon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import * as React from "react";
import { listBookings, cancelBooking as cancelBookingService } from "@/services/bookingService";
import { listSubscriptions, cancelSubscription, frequencyLabels, syncSubscriptions } from "@/services/subscriptionService";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Booking as SupabaseBooking, Subscription } from "@/types/database";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "home",
    success: (search.success as string) || undefined,
  }),
});

// Utiliser le type Supabase directement
type Booking = SupabaseBooking;

interface UserAuth {
  id: string;
  email: string;
  name: string;
  provider: "google" | "apple" | "email";
  avatar?: string;
}

type TabId = 
  | "home"
  | "prices" 
  | "recurring" 
  | "subscriptions" 
  | "referral" 
  | "account" 
  | "help";

function DashboardPage() {
  const navigate = useNavigate();
  const { tab } = useSearch({ from: "/dashboard" });
  const [activeTab, setActiveTab] = React.useState<TabId>((tab as TabId) || "home");
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [user, setUser] = React.useState<UserAuth | null>(null);
  const [showToast, setShowToast] = React.useState(false);

  // Mettre à jour l'onglet actif quand le search param change (uniquement au chargement initial)
  React.useEffect(() => {
    if (tab) {
      setActiveTab(tab as TabId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  React.useEffect(() => {
    const loadData = async () => {
      let currentUser: UserAuth | null = null;

      if (isSupabaseConfigured()) {
        // Charger l'utilisateur depuis Supabase
        const supabase = getSupabase();
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        
        if (!supaUser) {
          navigate({ to: "/" });
          return;
        }

        currentUser = {
          id: supaUser.id,
          email: supaUser.email || "",
          name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "Utilisateur",
          provider: "google",
          avatar: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture,
        };
        setUser(currentUser);

        // Charger les réservations depuis Supabase
        const { bookings: userBookings } = await listBookings(supaUser.id);
        setBookings(userBookings);

        // Afficher le toast si nouvelle réservation
        if (userBookings.length > 0) {
          const lastBooking = userBookings[0]; // Déjà trié par date décroissante
          const lastBookingTime = new Date(lastBooking.created_at).getTime();
          const now = Date.now();
          if (now - lastBookingTime < 5000) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
          }
        }
      } else {
        // Fallback localStorage
        const savedUser = localStorage.getItem("justmaid_user");
        if (!savedUser) {
          navigate({ to: "/" });
          return;
        }
        currentUser = JSON.parse(savedUser);
        setUser(currentUser);

        // Charger les réservations depuis localStorage
        const storedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
        setBookings(storedBookings);

        if (storedBookings.length > 0) {
          const lastBooking = storedBookings[storedBookings.length - 1];
          const lastBookingTime = new Date(lastBooking.created_at || lastBooking.createdAt).getTime();
          const now = Date.now();
          if (now - lastBookingTime < 5000) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
          }
        }
      }
    };

    loadData();
  }, [navigate]);

  const menuItems = [
    { id: "prices" as TabId, icon: Tag01Icon, label: "Prix et services" },
    { id: "subscriptions" as TabId, icon: StarIcon, label: "Mes abonnements" },
  ];

  const infoItems = [
    { id: "account" as TabId, icon: UserIcon, label: "Compte" },
    { id: "help" as TabId, icon: HelpCircleIcon, label: "Centre d'aide" },
  ];

  const handleCancelBooking = async (bookingId: string) => {
    const { success, error } = await cancelBookingService(bookingId);
    if (success) {
      // Mettre à jour l'état local
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b
      ));
    } else {
      console.error("Error cancelling booking:", error);
      alert("Erreur lors de l'annulation: " + error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab bookings={bookings} cancelBooking={handleCancelBooking} user={user} />;
      case "prices":
        return <PricesTab />;
      case "subscriptions":
        return <SubscriptionsTab user={user} />;
      case "account":
        return <AccountTab user={user} />;
      case "help":
        return <HelpTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed right-4 top-20 z-50 animate-slide-in-right rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800">Réservation enregistrée !</p>
              <p className="text-sm text-green-600">Votre réservation a été confirmée</p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Navigation Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "home"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              Accueil
            </button>
            {menuItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm"
                }`}
              >
                <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            {infoItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 hover:shadow-sm"
                }`}
              >
                <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}

// =====================
// HOME TAB (Main Dashboard)
// =====================

function HomeTab({ 
  bookings, 
  cancelBooking,
  user,
}: { 
  bookings: Booking[]; 
  cancelBooking: (id: string) => void;
  user: UserAuth | null;
}) {
  const activeBookings = bookings.filter(b => b.status !== "cancelled" && b.status !== "completed");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
      {/* Left Column - Main Content */}
      <div className="space-y-8">
        {/* Mes commandes */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes commandes</h2>
          
          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-6">
              <p className="text-gray-600">
                Vous n'avez aucune commande active.{" "}
                <Link to="/booking/cleaning" className="text-primary font-semibold hover:underline">
                  Réservez dès maintenant
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} cancelBooking={cancelBooking} />
              ))}
            </div>
          )}
        </section>

        {/* Section réservation rapide */}
        <section className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Réserver un service</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link 
              to="/booking/cleaning"
              className="flex items-center gap-4 rounded-xl border-2 border-gray-100 p-4 transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <span className="text-2xl">🧹</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Ménage à domicile</p>
                <p className="text-sm text-gray-500">À partir de 45 CHF/h</p>
              </div>
            </Link>
            <div className="relative flex items-center gap-4 rounded-xl border-2 border-gray-100 p-4 opacity-60">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <span className="text-2xl">👔</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pressing</p>
                <p className="text-sm text-gray-500">Bientôt disponible</p>
              </div>
              <Badge className="absolute right-3 top-3 bg-gray-200 text-gray-600">Bientôt</Badge>
            </div>
          </div>
        </section>

        {/* Historique récent */}
        {bookings.filter(b => b.status === "completed").length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Historique récent</h3>
            <div className="bg-white rounded-2xl divide-y divide-gray-100">
              {bookings
                .filter(b => b.status === "completed")
                .slice(0, 3)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <HugeiconsIcon icon={Home01Icon} strokeWidth={1.5} className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Ménage - {booking.duration || 3}h</p>
                        <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900">{booking.total_price || (booking.duration || 3) * 45} CHF</p>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>

      {/* Right Column - Widgets */}
      <div className="space-y-6">
        {/* Téléchargez l'application */}
        <div className="rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
              <HugeiconsIcon icon={SmartPhone01Icon} strokeWidth={1.5} className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-primary">Téléchargez l'application</h3>
          <p className="mt-2 text-sm text-gray-600">
            Téléchargez notre application pour réserver facilement
          </p>
          
          {/* Store buttons */}
          <div className="mt-4 flex justify-center gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-transform hover:scale-105">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <div className="text-left">
                <div className="text-[8px] leading-tight">Download on the</div>
                <div className="text-sm font-semibold leading-tight">App Store</div>
              </div>
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-transform hover:scale-105">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              <div className="text-left">
                <div className="text-[8px] leading-tight">GET IT ON</div>
                <div className="text-sm font-semibold leading-tight">Google Play</div>
              </div>
            </button>
          </div>

          {/* QR Code placeholder */}
          <div className="mt-4 flex justify-center">
            <div className="h-24 w-24 rounded-lg bg-white p-2">
              <div className="h-full w-full bg-gray-200 rounded grid grid-cols-5 grid-rows-5 gap-0.5 p-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Booking Card Component
function BookingCard({ 
  booking, 
  cancelBooking 
}: { 
  booking: Booking; 
  cancelBooking: (id: string) => void;
}) {
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Vérifier si le ménage est passé ou en cours
  const getBookingTimeStatus = () => {
    if (!booking.date || !booking.time) return "unknown";
    
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = (booking.time || "07:00").split(":").map(Number);
    bookingDate.setHours(hours, minutes, 0, 0);
    
    const bookingEnd = new Date(bookingDate);
    const duration = booking.duration || 3;
    bookingEnd.setHours(bookingEnd.getHours() + duration);
    
    if (now >= bookingEnd) {
      return "completed";
    } else if (now >= bookingDate && now < bookingEnd) {
      return "in_progress";
    }
    return "upcoming";
  };
  
  const timeStatus = getBookingTimeStatus();

  const getStatusBadge = (status: Booking["status"]) => {
    // Si le ménage est terminé (heure passée), afficher "Terminé"
    if (timeStatus === "completed" && status !== "cancelled") {
      return <Badge className="bg-green-100 text-green-700">Terminé ✓</Badge>;
    }
    
    // Si le ménage est en cours
    if (timeStatus === "in_progress" && status !== "cancelled") {
      return <Badge className="bg-blue-100 text-blue-700">Prévu pour aujourd'hui</Badge>;
    }
    
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>;
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700">Confirmé</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700">En cours</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700">Annulé</Badge>;
      default:
        return null;
    }
  };

  const taskLabels: Record<string, string> = {
    dusting: "Dépoussiérage",
    vacuuming: "Aspirateur",
    mopping: "Lavage sols",
    bathroom: "Salle de bain",
    kitchen: "Cuisine",
    windows: "Vitres",
    ironing: "Repassage",
    bedmaking: "Lits",
    fridge: "Réfrigérateur",
    oven: "Four",
    laundry: "Lessive",
    organization: "Rangement",
    balcony: "Balcon/Terrasse",
    general: "Nettoyage général",
  };

  // Compatibilité avec les deux formats (Supabase et localStorage legacy)
  const hours = booking.duration || (booking as any).hours || 3;
  const tasks = booking.tasks || [];
  const notes = booking.notes || "";
  
  // Parser les extras depuis notes (format texte avec [EXTRAS] et [ANIMAUX])
  let extrasList: string[] = [];
  let hasPets = false;
  let specialInstructions = "";
  
  // Format: "[EXTRAS] label1: +XX CHF, label2: +XX CHF | [ANIMAUX] Présence d'animaux | Notes utilisateur"
  if (notes) {
    const parts = notes.split(' | ');
    
    for (const part of parts) {
      if (part.startsWith('[EXTRAS]')) {
        // Extraire les extras: enlever [EXTRAS], puis split par virgule
        const extrasStr = part.replace('[EXTRAS]', '').trim();
        extrasList = extrasStr.split(', ').map(e => {
          // Enlever le prix (": +XX CHF") et les emojis
          return e.replace(/:\s*\+\d+\s*CHF/g, '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
        }).filter(e => e.length > 0);
      } else if (part.startsWith('[ANIMAUX]')) {
        hasPets = true;
      } else {
        // C'est une instruction utilisateur
        specialInstructions = part.trim();
      }
    }
  }
  
  // Calcul du prix: utiliser total_price si disponible, sinon calculer
  const price = booking.total_price || hours * 40;

  const handleCancelConfirm = () => {
    cancelBooking(booking.id);
    setShowCancelDialog(false);
  };

  return (
    <>
      <div className="rounded-2xl bg-white p-5 border border-gray-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-4">
            {/* En-tête */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <HugeiconsIcon icon={Home01Icon} strokeWidth={1.5} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ménage à domicile</h3>
                <p className="text-sm text-gray-500">{booking.address}</p>
              </div>
            </div>

            {/* Date et heure */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="h-4 w-4" />
                <span className="capitalize">{formatDate(booking.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="h-4 w-4" />
                <span>{booking.time} • {hours}h</span>
              </div>
            </div>

            {/* Services supplémentaires (extras) */}
            {extrasList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {extrasList.map((extra, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                    ✨ {extra}
                  </Badge>
                ))}
              </div>
            )}

                {/* Animaux */}
            {hasPets && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                🐾 Présence d'animaux
              </Badge>
            )}

            {/* Services inclus */}
            <div className="mt-2 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Services inclus :</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Chambre & Salon */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">🛏️ Chambre & Salon</p>
                  <ul className="space-y-0.5 text-xs text-gray-600">
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Aspirateur et sols</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Dépoussiérage</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Miroirs et vitres</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Poubelles</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Faire les lits</li>
              </ul>
                </div>
                {/* Salle de bain */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">🚿 Salle de bain</p>
                  <ul className="space-y-0.5 text-xs text-gray-600">
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Nettoyage sols</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Miroirs</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Désinfection WC/douche</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Dépoussiérage</li>
                  </ul>
                </div>
                {/* Cuisine */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">🍳 Cuisine</p>
                  <ul className="space-y-0.5 text-xs text-gray-600">
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Nettoyage sols</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Vaisselle</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Évier et surfaces</li>
                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span>Électroménager</li>
                  </ul>
                </div>
              </div>
            </div>

              {/* Instructions spéciales */}
              {specialInstructions && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Instructions :</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{specialInstructions}</p>
                </div>
              )}
          </div>

          {/* Prix et actions */}
          <div className="flex flex-col items-end gap-3 sm:min-w-[140px]">
            {getStatusBadge(booking.status)}
           
            {booking.status === "pending" && timeStatus === "upcoming" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="mr-1 h-4 w-4" />
                Annuler
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette réservation ?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir annuler votre réservation du{" "}
                <span className="font-semibold">{formatDate(booking.date)}</span> à{" "}
                <span className="font-semibold">{booking.time}</span> ?
              </p>
              <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
                <p className="text-sm text-amber-800">
                  ⚠️ Cette action est irréversible. Vous devrez créer une nouvelle réservation si vous changez d'avis.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Garder ma réservation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// =====================
// OTHER TAB COMPONENTS
// =====================

function OrdersTab({ 
  bookings, 
  cancelBooking 
}: { 
  bookings: Booking[]; 
  cancelBooking: (id: string) => void;
}) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <HugeiconsIcon icon={Calendar03Icon} strokeWidth={1.5} className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Aucune commande</h2>
        <p className="mt-2 text-gray-500">
          Vous n'avez pas encore passé de commande.
        </p>
        <Link to="/booking/cleaning" className="mt-6 inline-block">
          <Button className="rounded-full">
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="mr-2 h-4 w-4" />
            Réserver un ménage
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Mes commandes</h2>
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} cancelBooking={cancelBooking} />
      ))}
    </div>
  );
}

function PricesTab() {
  const mainServices = [
    { 
      name: "Ménage à domicile", 
      price: "45 CHF/h", 
      description: "Nettoyage complet de votre intérieur (sols, surfaces, cuisine, salle de bain)", 
      details: "Minimum 3 heures • Produits non inclus",
      icon: "🧹" 
    },
  ];

  const extraServices = [
    { name: "Repassage", price: "Prix bientôt disponible", description: "Service de repassage professionnel à domicile", icon: "👔" },
    { name: "Fenêtres", price: "25 CHF/h", description: "Nettoyage intérieur et extérieur des vitres (30 min par fenêtre)", icon: "🪟" },
    { name: "Lessive & séchage", price: "Prix bientôt disponible", description: "Lavage, séchage et pliage de votre linge", icon: "🧺" },
    { name: "Intérieur du four", price: "30 CHF", description: "Dégraissage complet de votre four (environ 30 min)", icon: "🔥" },
    { name: "Placards de cuisine", price: "30 CHF", description: "Nettoyage intérieur des placards (environ 30 min)", icon: "🗄️" },
    { name: "Intérieur du frigidaire", price: "30 CHF", description: "Nettoyage et désinfection du réfrigérateur (environ 30 min)", icon: "❄️" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Prix et services</h2>
        <p className="mt-1 text-gray-600">Tarifs transparents et sans frais cachés 🇨🇭</p>
      </div>

      {/* Service principal */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Service principal</h3>
        {mainServices.map((service) => (
          <div key={service.name} className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 border-2 border-primary/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{service.icon}</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">{service.name}</h4>
                    <p className="mt-1 text-sm text-gray-600">{service.description}</p>
                    <p className="mt-2 text-xs font-medium text-primary">{service.details}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{service.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Services supplémentaires */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Services supplémentaires</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {extraServices.map((service) => (
            <div key={service.name} className="rounded-2xl bg-white p-6 border border-gray-200 hover:border-primary/30 transition-all">
              <div className="text-3xl mb-3">{service.icon}</div>
              <h4 className="font-semibold text-gray-900">{service.name}</h4>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">{service.description}</p>
              <p className="mt-4 text-xl font-bold text-primary">{service.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Note importante */}
      <div className="rounded-2xl bg-blue-50 p-6 border border-blue-100">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-gray-900">Bon à savoir</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• <strong>Produits et équipements non fournis</strong> - à prévoir par le client</li>
              <li>• Réservation minimum de 3 heures pour le service de ménage</li>
              <li>• Les services supplémentaires s'ajoutent à votre réservation</li>
              <li>• Paiement sécurisé par carte bancaire uniquement après l'intervention</li>
              <li>• Service disponible 6j/7 (du lundi au samedi)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecurringTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Commandes répétées</h2>
        <p className="mt-1 text-gray-600">Programmez vos ménages et économisez</p>
      </div>

      {/* Bientôt disponible */}
      <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 p-12 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
          <HugeiconsIcon icon={RepeatIcon} strokeWidth={1.5} className="h-10 w-10 text-orange-500" />
        </div>
        
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-1.5 mb-4">
          <span className="text-sm font-semibold text-white">🚀 Bientôt disponible</span>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Commandes répétées</h3>
        <p className="mx-auto max-w-2xl text-gray-600 leading-relaxed">
          Nous travaillons actuellement sur cette fonctionnalité pour vous permettre de programmer 
          des ménages réguliers (hebdomadaires, bimensuels ou mensuels) et bénéficier d'une réduction allant jusqu'à <span className="font-semibold text-orange-600">15%</span> sur vos réservations.
        </p>

        {/* Avantages futurs */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3 text-left">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl mb-2">📅</div>
            <h4 className="font-semibold text-gray-900 text-sm">Planning flexible</h4>
            <p className="mt-1 text-xs text-gray-600">Choisissez votre fréquence et modifiez quand vous voulez</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl mb-2">💰</div>
            <h4 className="font-semibold text-gray-900 text-sm">Économies garanties</h4>
            <p className="mt-1 text-xs text-gray-600">Jusqu'à 15% de réduction sur chaque intervention</p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl mb-2">⭐</div>
            <h4 className="font-semibold text-gray-900 text-sm">Même intervenant(e)</h4>
            <p className="mt-1 text-xs text-gray-600">Continuité et qualité assurées</p>
          </div>
        </div>

        {/* CTA désactivé */}
        <Button disabled className="mt-8 rounded-full bg-gray-300 hover:bg-gray-300 cursor-not-allowed">
          Fonctionnalité en développement
        </Button>
        
        <p className="mt-4 text-sm text-gray-500">
          💌 Vous serez notifié(e) par email dès que cette option sera disponible
        </p>
      </div>

      {/* Info pour l'instant */}
      <div className="rounded-2xl bg-white p-6 border border-gray-200">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-gray-900">En attendant...</h4>
            <p className="mt-1 text-sm text-gray-600">
              Vous pouvez toujours réserver ponctuellement vos ménages via la page d'accueil. 
              Nous gardons l'historique de vos préférences pour faciliter vos prochaines réservations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mon portefeuille</h2>
      
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
        <p className="text-sm opacity-80">Solde disponible</p>
        <p className="mt-1 text-4xl font-bold">0,00 CHF</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Button variant="outline" className="h-auto flex-col gap-2 py-6 rounded-2xl">
          <HugeiconsIcon icon={Wallet01Icon} strokeWidth={1.5} className="h-6 w-6" />
          <span>Ajouter des crédits</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-6 rounded-2xl">
          <HugeiconsIcon icon={GiftIcon} strokeWidth={1.5} className="h-6 w-6" />
          <span>Offrir des crédits</span>
        </Button>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-gray-900">Historique</h3>
        <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
          Aucune transaction pour le moment
        </div>
      </div>
    </div>
  );
}

function SubscriptionsTab({ user }: { user: UserAuth | null }) {
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [selectedSubscription, setSelectedSubscription] = React.useState<Subscription | null>(null);
  const [cancelSuccess, setCancelSuccess] = React.useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = React.useState(false);

  // Charger et synchroniser les abonnements
  React.useEffect(() => {
    const loadSubscriptions = async () => {
      if (!user) return;
      
      setIsLoading(true);

      // Vérifier si on revient de Stripe avec success=true
      const urlParams = new URLSearchParams(window.location.search);
      const isSuccess = urlParams.get("success") === "true";

      if (isSuccess && user.email) {
        setIsSyncing(true);
        // Synchroniser les abonnements depuis Stripe
        const syncResult = await syncSubscriptions(user.id, user.email);
        console.log("Sync result:", syncResult);
        setIsSyncing(false);

        if (syncResult.synced > 0) {
          setSubscriptionSuccess(true);
          setTimeout(() => setSubscriptionSuccess(false), 5000);
        }

        // Nettoyer l'URL
        window.history.replaceState({}, "", window.location.pathname + "?tab=subscriptions");
      }

      // Charger les abonnements depuis Supabase
      const { subscriptions: userSubscriptions } = await listSubscriptions(user.id);
      setSubscriptions(userSubscriptions);
      setIsLoading(false);
    };

    loadSubscriptions();
  }, [user]);

  const handleCancelClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedSubscription) return;

    setCancellingId(selectedSubscription.stripe_subscription_id);
    setShowCancelDialog(false);

    const result = await cancelSubscription(selectedSubscription.stripe_subscription_id, false);

    if (result.success) {
      // Mettre à jour l'état local
      setSubscriptions(prev => prev.map(sub => 
        sub.id === selectedSubscription.id 
          ? { ...sub, cancelled_at: new Date().toISOString() }
          : sub
      ));
      setCancelSuccess(true);
      setTimeout(() => setCancelSuccess(false), 5000);
    } else {
      alert("Erreur lors de l'annulation: " + result.error);
    }

    setCancellingId(null);
    setSelectedSubscription(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (subscription: Subscription) => {
    if (subscription.cancelled_at) {
      return <Badge className="bg-orange-100 text-orange-700">Annulé (actif jusqu'au {formatDate(subscription.current_period_end)})</Badge>;
    }
    switch (subscription.status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700">Actif</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-700">En pause</Badge>;
      case "past_due":
        return <Badge className="bg-red-100 text-red-700">Paiement en retard</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-700">Annulé</Badge>;
      default:
        return null;
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === "active" || s.status === "paused");
  const cancelledSubscriptions = subscriptions.filter(s => s.status === "cancelled");

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {/* Toast succès création abonnement */}
      {subscriptionSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">
              🎉 Abonnement activé avec succès ! Votre premier ménage sera programmé prochainement.
            </p>
          </div>
        </div>
      )}

      {/* Toast succès annulation */}
      {cancelSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">
              Abonnement annulé avec succès. Il reste actif jusqu'à la fin de la période en cours.
            </p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mes abonnements</h2>
        <p className="mt-1 text-gray-600">Gérez vos abonnements de ménage récurrent</p>
      </div>

      {isLoading || isSyncing ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          {isSyncing && (
            <p className="text-sm text-muted-foreground">Synchronisation avec Stripe...</p>
          )}
        </div>
      ) : activeSubscriptions.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <HugeiconsIcon icon={StarIcon} strokeWidth={1.5} className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Aucun abonnement actif</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Souscrivez à un abonnement pour bénéficier de ménages récurrents à prix réduit et d'un même intervenant à chaque fois.
          </p>
          <Link to="/booking/cleaning" className="inline-block mt-6">
            <Button className="rounded-full gap-2">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
              Créer un abonnement
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activeSubscriptions.map((subscription) => (
            <div key={subscription.id} className="rounded-2xl bg-white p-6 border border-gray-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-4">
                  {/* En-tête */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <HugeiconsIcon icon={RepeatIcon} strokeWidth={1.5} className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Ménage récurrent – {subscription.duration_hours}h
                        {subscription.extras && subscription.extras.length > 0 && (
                          <span className="text-primary"> + {subscription.extras.map(e => e.name).join(', ')}</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">{subscription.address}</p>
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 text-sm">
                      <HugeiconsIcon icon={RepeatIcon} strokeWidth={1.5} className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {frequencyLabels[subscription.frequency]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.5} className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {subscription.preferred_time} • {subscription.duration_hours}h
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HugeiconsIcon icon={Calendar03Icon} strokeWidth={1.5} className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Prochain: {formatDate(subscription.next_billing_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HugeiconsIcon icon={CreditCardIcon} strokeWidth={1.5} className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 font-medium">
                        {subscription.price_per_session} CHF/séance
                      </span>
                    </div>
                  </div>

                  {/* Services inclus */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-3">Services inclus à chaque intervention :</p>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* Chambre & Salon */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1.5">🛏️ Chambre & Salon</p>
                        <ul className="space-y-1 text-xs text-gray-600">
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Aspirateur et sols</li>
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Dépoussiérage</li>
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Miroirs et vitres</li>
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Poubelles</li>
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Faire les lits</li>
            </ul>
                      </div>
                      {/* Salle de bain */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1.5">🚿 Salle de bain</p>
                        <ul className="space-y-1 text-xs text-gray-600">
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Nettoyage sols</li>
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Miroirs</li>
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Désinfection WC/douche</li>
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Dépoussiérage</li>
                        </ul>
                      </div>
                      {/* Cuisine */}
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1.5">🍳 Cuisine</p>
                        <ul className="space-y-1 text-xs text-gray-600">
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Nettoyage sols</li>
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Vaisselle</li>
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Évier et surfaces</li>
                          <li className="flex items-center gap-1.5"><span className="text-green-500">✓</span>Électroménager</li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Extras si présents */}
                    {subscription.extras && subscription.extras.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">✨ Services supplémentaires inclus :</p>
                        <div className="flex flex-wrap gap-2">
                          {subscription.extras.map((extra, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
                            >
                              <span className="text-green-500">✓</span>
                              {extra.name} (+{extra.price} CHF)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(subscription)}
                  
                  {!subscription.cancelled_at && subscription.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelClick(subscription)}
                      disabled={cancellingId === subscription.stripe_subscription_id}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                    >
                      {cancellingId === subscription.stripe_subscription_id ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                          Annulation...
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="mr-1 h-4 w-4" />
                          Se désabonner
                        </>
                      )}
            </Button>
                  )}
                </div>
              </div>
          </div>
        ))}
      </div>
      )}

      {/* Historique des abonnements annulés */}
      {cancelledSubscriptions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Abonnements passés</h3>
          <div className="space-y-3">
            {cancelledSubscriptions.map((subscription) => (
              <div key={subscription.id} className="rounded-xl bg-gray-50 p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
                      <HugeiconsIcon icon={RepeatIcon} strokeWidth={1.5} className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">
                        Ménage {subscription.duration_hours}h - {frequencyLabels[subscription.frequency]}
                      </p>
                      <p className="text-sm text-gray-500">
                        Annulé le {formatDate(subscription.cancelled_at || subscription.updated_at)}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-gray-200 text-gray-600">Terminé</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informations sur les abonnements */}
      <div className="rounded-2xl bg-blue-50 p-6 border border-blue-100 mt-8">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-gray-900">Avantages de l'abonnement</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• <strong>Économisez jusqu'à 10%</strong> sur chaque intervention avec un abonnement hebdomadaire</li>
              <li>• <strong>Même intervenant(e)</strong> à chaque visite pour une qualité constante</li>
              <li>• <strong>Annulation flexible</strong> - vous pouvez vous désabonner à tout moment</li>
              <li>• <strong>Paiement automatique</strong> - plus besoin de payer à chaque fois</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Se désabonner ?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir annuler votre abonnement de ménage{" "}
                <span className="font-semibold">{selectedSubscription?.duration_hours}h {selectedSubscription?.frequency && frequencyLabels[selectedSubscription.frequency]}</span> ?
              </p>
              <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
                <p className="text-sm text-blue-800">
                  ℹ️ Votre abonnement restera actif jusqu'à la fin de la période en cours ({selectedSubscription && formatDate(selectedSubscription.current_period_end)}). Aucun prélèvement supplémentaire ne sera effectué.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Garder mon abonnement</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Oui, me désabonner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PacksTab() {
  const packs = [
    { hours: 10, price: 225, originalPrice: 250, savings: 25, icon: "🧹", name: "Pack ménage" },
    { hours: 20, price: 420, originalPrice: 500, savings: 80, icon: "🧹", name: "Pack ménage", popular: true },
    { hours: 30, price: 600, originalPrice: 750, savings: 150, icon: "🧹", name: "Pack ménage" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Packs prépayés</h2>
      <p className="text-gray-500">Achetez des heures à l'avance et économisez.</p>
      
      <div className="grid gap-6 sm:grid-cols-3">
        {packs.map((pack) => (
          <div 
            key={pack.hours} 
            className={`relative rounded-2xl bg-white p-6 text-center ${pack.popular ? "ring-2 ring-primary" : ""}`}
          >
            {pack.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                Meilleure offre
              </Badge>
            )}
            <div className="text-4xl mb-2">{pack.icon}</div>
            <p className="text-sm text-gray-500">{pack.name}</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{pack.hours}h</p>
            <p className="mt-2 text-2xl font-bold text-primary">{pack.price} CHF</p>
            <p className="text-sm text-gray-400 line-through">{pack.originalPrice} CHF</p>
            <Badge className="mt-3 bg-green-100 text-green-700">-{pack.savings} CHF</Badge>
            <Button className="mt-6 w-full rounded-full">Acheter</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromotionsTab() {
  const promos = [
    { code: "BIENVENUE", discount: "-20%", description: "Sur votre première commande", expires: "31/12/2026" },
    { code: "ETE2026", discount: "-15%", description: "Offre spéciale été", expires: "31/08/2026" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Promotions</h2>
      
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Entrez un code promo"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Button className="rounded-xl">Appliquer</Button>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Promotions disponibles</h3>
        {promos.map((promo) => (
          <div key={promo.code} className="flex items-center justify-between rounded-2xl bg-white p-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-primary text-white text-lg px-3 py-1">
                {promo.discount}
              </Badge>
              <div>
                <p className="font-medium text-gray-900">{promo.description}</p>
                <p className="text-sm text-gray-500">Expire le {promo.expires}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="h-4 w-4" />
              {promo.code}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferralTab({ user }: { user: UserAuth | null }) {
  const referralCode = user?.id.slice(-6).toUpperCase() || "XXXXXX";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Parrainer un ami</h2>
      
      <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <HugeiconsIcon icon={GiftIcon} strokeWidth={1.5} className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Gagnez 20 CHF pour chaque ami parrainé</h3>
        <p className="mt-2 text-gray-500">
          Votre ami reçoit également 20 CHF de réduction sur sa première commande.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6">
        <p className="text-sm text-gray-500 mb-2">Votre code de parrainage</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-center">
            <span className="text-2xl font-bold tracking-wider text-gray-900">{referralCode}</span>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl">
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl">
            <HugeiconsIcon icon={Share01Icon} strokeWidth={2} className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-sm text-gray-500">Amis parrainés</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">0 CHF</p>
          <p className="text-sm text-gray-500">Crédits gagnés</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">0 CHF</p>
          <p className="text-sm text-gray-500">En attente</p>
        </div>
      </div>
    </div>
  );
}

function AccountTab({ user }: { user: UserAuth | null }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Charger les données utilisateur depuis Supabase
  React.useEffect(() => {
    const loadProfile = async () => {
      if (isSupabaseConfigured() && user) {
        const supabase = getSupabase();
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, phone")
          .eq("id", user.id)
          .single() as { data: { first_name: string | null; last_name: string | null; phone: string | null } | null };

        if (profile) {
          setFormData({
            firstName: profile.first_name || "",
            lastName: profile.last_name || "",
            phone: profile.phone || "",
          });
        } else {
          // Fallback: utiliser les métadonnées de l'auth
          const nameParts = (user.name || "").split(" ");
          setFormData({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            phone: "",
          });
        }
      } else if (user) {
        const nameParts = (user.name || "").split(" ");
        setFormData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone: "",
        });
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        
        // Mettre à jour le profil dans la table profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            updated_at: new Date().toISOString(),
          } as any);

        if (profileError) throw profileError;

        // Mettre à jour les métadonnées de l'utilisateur auth
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.lastName}`.trim(),
            phone: formData.phone,
          },
        });

        if (authError) throw authError;

        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mon compte</h2>
      
      {/* Success Toast */}
      {saveSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Informations mises à jour avec succès !</p>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex items-center gap-4 rounded-2xl bg-white p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary overflow-hidden">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">
              {(formData.firstName || user?.name || "U").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {formData.firstName && formData.lastName 
              ? `${formData.firstName} ${formData.lastName}` 
              : user?.name}
          </h3>
          <p className="text-gray-500">{user?.email}</p>
          <Badge variant="secondary" className="mt-1">
            {user?.provider === "google" ? "Compte Google" : 
             user?.provider === "apple" ? "Compte Apple" : "Compte Email"}
          </Badge>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={UserIcon} strokeWidth={1.5} className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Informations personnelles</h3>
          </div>
          {!isEditing ? (
            <button 
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors cursor-pointer"
            >
              ✏️ Modifier
            </button>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName" className="text-gray-700">Prénom</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing}
                className="mt-1.5"
                placeholder="Votre prénom"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-gray-700">Nom</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
                className="mt-1.5"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="mt-1.5 bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
          </div>

          <div>
            <Label htmlFor="phone" className="text-gray-700">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className="mt-1.5"
              placeholder="+41 XX XXX XX XX"
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Annuler
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Other Settings */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Paramètres</h3>
        
        {[
          { label: "Moyens de paiement", icon: CreditCardIcon },
          { label: "Notifications", icon: Tick02Icon },
        ].map((item) => (
          <button
            key={item.label}
            className="flex w-full items-center justify-between rounded-2xl bg-white p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">{item.label}</span>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="h-5 w-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

function HelpTab() {
  const faqs = [
    { q: "Comment annuler une réservation ?", a: "Vous pouvez annuler gratuitement jusqu'à 24h avant l'intervention dans la section 'Mes commandes'." },
    { q: "Comment contacter mon intervenant(e) ?", a: "Une fois la réservation confirmée, vous recevrez les coordonnées de votre intervenant(e) par SMS." },
    { q: "Quels produits dois-je fournir ?", a: "Les produits et équipements de ménage ne sont pas fournis. Merci de prévoir : aspirateur, serpillière, éponges, chiffons et produits ménagers (multi-surfaces, vitres, sol, salle de bain)." },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Centre d'aide</h2>
      
      <div className="rounded-2xl bg-primary/5 p-6">
        <h3 className="font-semibold text-gray-900">Besoin d'aide ?</h3>
        <p className="mt-1 text-gray-500">Notre équipe est disponible 6j/7 de 8h à 20h</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2 rounded-xl">
            📞 +41 22 792 67 23
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl">
            ✉️ contact@justmaid.ch
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Questions fréquentes</h3>
        {faqs.map((faq, i) => (
          <details key={i} className="rounded-2xl bg-white">
            <summary className="cursor-pointer p-4 font-medium text-gray-900 hover:bg-gray-50 rounded-2xl">
              {faq.q}
            </summary>
            <div className="border-t border-gray-100 p-4 text-gray-500">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
