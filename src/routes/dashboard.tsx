import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Wallet01Icon,
  StarIcon,
  PackageIcon,
  PercentIcon,
  GiftIcon,
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
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Booking as SupabaseBooking } from "@/types/database";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "home",
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
    { id: "recurring" as TabId, icon: RepeatIcon, label: "Commandes répétées" },
  ];

  // Masqué pour l'instant
  // const economyItems = [
  //   { id: "subscriptions" as TabId, icon: StarIcon, label: "Abonnements" },
  //   { id: "referral" as TabId, icon: GiftIcon, label: "Parrainer un ami" },
  // ];

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
      case "recurring":
        return <RecurringTab />;
      case "subscriptions":
        return <SubscriptionsTab />;
      case "referral":
        return <ReferralTab user={user} />;
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
                <p className="text-sm text-gray-500">À partir de 25 CHF/h</p>
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
                    <p className="font-semibold text-gray-900">{booking.total_price || (booking.duration || 3) * 25} CHF</p>
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
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>;
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700">Confirmé</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-700">En cours</Badge>;
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
  
  // Calcul du prix: utiliser total_price si disponible, sinon calculer
  const price = booking.total_price || hours * 25;

  return (
    <div className="rounded-2xl bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <HugeiconsIcon icon={Home01Icon} strokeWidth={1.5} className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ménage à domicile</h3>
              <p className="text-sm text-gray-500">{booking.address}</p>
            </div>
          </div>

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

          <div className="flex flex-wrap gap-2">
            {tasks.slice(0, 4).map((task) => (
              <Badge key={task} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                {taskLabels[task] || task}
              </Badge>
            ))}
            {tasks.length > 4 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                +{tasks.length - 4}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {getStatusBadge(booking.status)}
          <p className="text-xl font-bold text-gray-900">
            {price} CHF
          </p>
          {booking.status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancelBooking(booking.id)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="mr-1 h-4 w-4" />
              Annuler
            </Button>
          )}
        </div>
      </div>
    </div>
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
  const services = [
    { name: "Ménage standard", price: "25 CHF/h", description: "Nettoyage général de votre domicile", icon: "🧹" },
    { name: "Grand ménage", price: "30 CHF/h", description: "Nettoyage en profondeur", icon: "✨" },
    { name: "Repassage", price: "20 CHF/h", description: "Service de repassage à domicile", icon: "👔" },
    { name: "Vitres", price: "35 CHF/h", description: "Nettoyage des vitres", icon: "🪟" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Prix et services</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <div key={service.name} className="rounded-2xl bg-white p-6">
            <div className="text-3xl mb-3">{service.icon}</div>
            <h3 className="font-semibold text-gray-900">{service.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{service.description}</p>
            <p className="mt-3 text-xl font-bold text-primary">{service.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecurringTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Commandes répétées</h2>
      <div className="rounded-2xl bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <HugeiconsIcon icon={RepeatIcon} strokeWidth={1.5} className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Pas de commande récurrente</h3>
        <p className="mt-2 text-gray-500">
          Programmez un ménage régulier et économisez jusqu'à 15%
        </p>
        <Button className="mt-6 rounded-full">
          Programmer un ménage régulier
        </Button>
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

function SubscriptionsTab() {
  const plans = [
    { 
      name: "Essentiel", 
      price: "49 CHF/mois", 
      hours: "2h/semaine",
      savings: "10%",
      features: ["2h de ménage par semaine", "Même intervenant(e)", "Annulation gratuite 24h avant"]
    },
    { 
      name: "Confort", 
      price: "89 CHF/mois", 
      hours: "4h/semaine",
      savings: "15%",
      popular: true,
      features: ["4h de ménage par semaine", "Même intervenant(e)", "Annulation gratuite 24h avant", "Repassage inclus"]
    },
    { 
      name: "Premium", 
      price: "149 CHF/mois", 
      hours: "8h/semaine",
      savings: "20%",
      features: ["8h de ménage par semaine", "Même intervenant(e)", "Annulation gratuite 24h avant", "Repassage inclus", "Vitres 1x/mois"]
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Abonnements</h2>
      <p className="text-gray-500">Optez pour un abonnement et économisez sur vos ménages réguliers.</p>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative rounded-2xl bg-white p-6 ${plan.popular ? "ring-2 ring-primary" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                Populaire
              </Badge>
            )}
            <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{plan.price}</p>
            <p className="text-sm text-gray-500">{plan.hours}</p>
            <Badge className="mt-2 bg-green-100 text-green-700">-{plan.savings}</Badge>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-4 w-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="mt-6 w-full rounded-full">
              Choisir
            </Button>
          </div>
        ))}
      </div>
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
    { q: "Quels produits dois-je fournir ?", a: "Nos intervenants apportent leurs produits. Si vous préférez qu'ils utilisent les vôtres, précisez-le dans les instructions." },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Centre d'aide</h2>
      
      <div className="rounded-2xl bg-primary/5 p-6">
        <h3 className="font-semibold text-gray-900">Besoin d'aide ?</h3>
        <p className="mt-1 text-gray-500">Notre équipe est disponible 7j/7 de 8h à 20h</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2 rounded-xl">
            📞 01 23 45 67 89
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl">
            ✉️ support@justmade.fr
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
