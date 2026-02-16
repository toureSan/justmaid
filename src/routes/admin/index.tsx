import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  DashboardBrowsingIcon,
  Calendar03Icon,
  UserMultipleIcon,
  MoneyBag02Icon,
  Search01Icon,
  Logout03Icon,
  RefreshIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Cancel01Icon,
  DeliveryTruck01Icon,
  FilterIcon,
  Mail01Icon,
  SmartPhone01Icon,
  Location01Icon,
  TimeQuarterPassIcon,
  Invoice01Icon,
  FileEditIcon,
  Building06Icon,
} from '@hugeicons/core-free-icons';
import { supabase } from '@/lib/supabase';
import type { BookingStatus } from '@/types/database';
import {
  type BookingWithCustomer,
  type AdminStats,
  getAdminStats,
  listAllBookings,
  listAllClients,
  updateBookingStatus,
  listAllQuoteRequests,
} from '@/services/adminService';
import type { Profile, QuoteRequest } from '@/types/database';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

type TabType = 'overview' | 'bookings' | 'clients' | 'quotes' | 'completed';

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: 'En attente',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  },
  confirmed: {
    label: 'Confirmée',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  in_progress: {
    label: 'En cours',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  completed: {
    label: 'Terminée',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  cancelled: {
    label: 'Annulée',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
};

const STATUS_ICON: Record<BookingStatus, typeof Clock01Icon> = {
  pending: Clock01Icon,
  confirmed: CheckmarkCircle02Icon,
  in_progress: DeliveryTruck01Icon,
  completed: CheckmarkCircle02Icon,
  cancelled: Cancel01Icon,
};

const SERVICE_LABELS: Record<string, string> = {
  cleaning: 'Ménage',
  laundry: 'Linge',
  ironing: 'Repassage',
  business_cleaning: 'Nettoyage bureau',
};

const PAGE_SIZE = 15;

function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Bookings
  const [bookings, setBookings] = useState<BookingWithCustomer[]>([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingsPage, setBookingsPage] = useState(0);
  const [bookingsSearch, setBookingsSearch] = useState('');
  const [bookingsFilter, setBookingsFilter] = useState<BookingStatus | ''>('');
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Clients
  const [clients, setClients] = useState<Profile[]>([]);
  const [clientsTotal, setClientsTotal] = useState(0);
  const [clientsPage, setClientsPage] = useState(0);
  const [clientsSearch, setClientsSearch] = useState('');
  const [clientsLoading, setClientsLoading] = useState(false);

  // Completed bookings
  const [completedBookings, setCompletedBookings] = useState<BookingWithCustomer[]>([]);
  const [completedTotal, setCompletedTotal] = useState(0);
  const [completedPage, setCompletedPage] = useState(0);
  const [completedLoading, setCompletedLoading] = useState(false);

  // Quotes
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [quotesTotal, setQuotesTotal] = useState(0);
  const [quotesPage, setQuotesPage] = useState(0);
  const [quotesLoading, setQuotesLoading] = useState(false);

  // Status update
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  // Detail panel
  const [selectedBooking, setSelectedBooking] = useState<BookingWithCustomer | null>(null);

  // Check auth
  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate({ to: '/admin/login' });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single() as { data: { role: string } | null };

      if (profile?.role !== 'admin') {
        navigate({ to: '/admin/login' });
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    }
    checkAuth();
  }, [navigate]);

  // Load stats
  const loadStats = useCallback(async () => {
    const { stats: data } = await getAdminStats();
    if (data) setStats(data);
  }, []);

  // Load bookings
  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    const { bookings: data, total } = await listAllBookings({
      status: bookingsFilter || undefined,
      search: bookingsSearch || undefined,
      limit: PAGE_SIZE,
      offset: bookingsPage * PAGE_SIZE,
    });
    setBookings(data);
    setBookingsTotal(total);
    setBookingsLoading(false);
  }, [bookingsFilter, bookingsSearch, bookingsPage]);

  // Load clients
  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    const { clients: data, total } = await listAllClients({
      search: clientsSearch || undefined,
      limit: PAGE_SIZE,
      offset: clientsPage * PAGE_SIZE,
    });
    setClients(data);
    setClientsTotal(total);
    setClientsLoading(false);
  }, [clientsSearch, clientsPage]);

  // Load completed bookings
  const loadCompleted = useCallback(async () => {
    setCompletedLoading(true);
    const { bookings: data, total } = await listAllBookings({
      status: 'completed',
      limit: PAGE_SIZE,
      offset: completedPage * PAGE_SIZE,
    });
    setCompletedBookings(data);
    setCompletedTotal(total);
    setCompletedLoading(false);
  }, [completedPage]);

  // Load quotes
  const loadQuotes = useCallback(async () => {
    setQuotesLoading(true);
    const { quotes: data, total } = await listAllQuoteRequests({
      limit: PAGE_SIZE,
      offset: quotesPage * PAGE_SIZE,
    });
    setQuotes(data);
    setQuotesTotal(total);
    setQuotesLoading(false);
  }, [quotesPage]);

  // Load data on auth
  useEffect(() => {
    if (isAuthorized) {
      loadStats();
      loadBookings();
      loadClients();
      loadCompleted();
      loadQuotes();
    }
  }, [isAuthorized, loadStats, loadBookings, loadClients, loadCompleted, loadQuotes]);

  const handleStatusChange = async (
    bookingId: string,
    newStatus: BookingStatus
  ) => {
    setUpdatingBooking(bookingId);
    const { error } = await updateBookingStatus(bookingId, newStatus);
    if (!error) {
      await loadBookings();
      await loadStats();
    }
    setUpdatingBooking(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/admin/login' });
  };

  const handleRefresh = () => {
    loadStats();
    loadBookings();
    loadClients();
    loadCompleted();
    loadQuotes();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-10 w-10 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-slate-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  const bookingsTotalPages = Math.ceil(bookingsTotal / PAGE_SIZE);
  const clientsTotalPages = Math.ceil(clientsTotal / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600">
                <HugeiconsIcon
                  icon={DashboardBrowsingIcon}
                  strokeWidth={1.5}
                  className="h-5 w-5 text-white"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 font-bricolage-grotesque leading-tight">
                  Justmaid Admin
                </h1>
                <p className="text-xs text-slate-500 -mt-0.5">
                  Tableau de bord
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="h-9 rounded-lg text-xs"
              >
                <HugeiconsIcon
                  icon={RefreshIcon}
                  strokeWidth={1.5}
                  className="h-4 w-4 mr-1"
                />
                Actualiser
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="h-9 rounded-lg text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <HugeiconsIcon
                  icon={Logout03Icon}
                  strokeWidth={1.5}
                  className="h-4 w-4 mr-1"
                />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200 w-fit">
          {(
            [
              {
                id: 'overview' as TabType,
                label: 'Vue d\'ensemble',
                icon: DashboardBrowsingIcon,
              },
              {
                id: 'bookings' as TabType,
                label: 'Commandes',
                icon: Calendar03Icon,
              },
              {
                id: 'clients' as TabType,
                label: 'Clients',
                icon: UserMultipleIcon,
              },
              {
                id: 'completed' as TabType,
                label: 'Terminées',
                icon: CheckmarkCircle02Icon,
              },
              {
                id: 'quotes' as TabType,
                label: 'Devis',
                icon: FileEditIcon,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <HugeiconsIcon
                icon={tab.icon}
                strokeWidth={1.5}
                className="h-4 w-4"
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total commandes"
                value={stats?.totalBookings ?? 0}
                icon={Calendar03Icon}
                color="blue"
              />
              <StatCard
                title="Clients"
                value={stats?.totalClients ?? 0}
                icon={UserMultipleIcon}
                color="emerald"
              />
              <StatCard
                title="Revenus"
                value={`${(stats?.totalRevenue ?? 0).toLocaleString('fr-CH')} CHF`}
                icon={MoneyBag02Icon}
                color="purple"
              />
              <StatCard
                title="Abonnements actifs"
                value={stats?.totalSubscriptions ?? 0}
                icon={Invoice01Icon}
                color="amber"
              />
            </div>

            {/* Status breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Répartition des commandes
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatusBreakdown
                  label="En attente"
                  count={stats?.pendingBookings ?? 0}
                  total={stats?.totalBookings ?? 1}
                  color="amber"
                />
                <StatusBreakdown
                  label="Confirmées"
                  count={stats?.confirmedBookings ?? 0}
                  total={stats?.totalBookings ?? 1}
                  color="blue"
                />
                <StatusBreakdown
                  label="Terminées"
                  count={stats?.completedBookings ?? 0}
                  total={stats?.totalBookings ?? 1}
                  color="emerald"
                />
                <StatusBreakdown
                  label="Annulées"
                  count={stats?.cancelledBookings ?? 0}
                  total={stats?.totalBookings ?? 1}
                  color="red"
                />
              </div>
            </div>

            {/* Recent bookings */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 pb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Dernières commandes
                </h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir tout
                </button>
              </div>
              <BookingsTable
                bookings={bookings.slice(0, 5)}
                loading={bookingsLoading}
                onStatusChange={handleStatusChange}
                updatingBooking={updatingBooking}
                onSelect={setSelectedBooking}
              />
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <HugeiconsIcon
                  icon={Search01Icon}
                  strokeWidth={1.5}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                />
                <Input
                  type="text"
                  placeholder="Rechercher par adresse, notes..."
                  value={bookingsSearch}
                  onChange={(e) => {
                    setBookingsSearch(e.target.value);
                    setBookingsPage(0);
                  }}
                  className="pl-10 h-10 rounded-lg bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FilterIcon}
                  strokeWidth={1.5}
                  className="h-4 w-4 text-slate-400"
                />
                <select
                  value={bookingsFilter}
                  onChange={(e) => {
                    setBookingsFilter(e.target.value as BookingStatus | '');
                    setBookingsPage(0);
                  }}
                  className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200">
              <BookingsTable
                bookings={bookings}
                loading={bookingsLoading}
                onStatusChange={handleStatusChange}
                updatingBooking={updatingBooking}
                onSelect={setSelectedBooking}
              />
              {/* Pagination */}
              {bookingsTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    {bookingsTotal} commande{bookingsTotal > 1 ? 's' : ''} au total
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={bookingsPage === 0}
                      onClick={() => setBookingsPage((p) => p - 1)}
                      className="h-8 rounded-lg text-xs"
                    >
                      <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        strokeWidth={2}
                        className="h-3 w-3"
                      />
                    </Button>
                    <span className="text-xs text-slate-600 min-w-[80px] text-center">
                      Page {bookingsPage + 1} / {bookingsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={bookingsPage >= bookingsTotalPages - 1}
                      onClick={() => setBookingsPage((p) => p + 1)}
                      className="h-8 rounded-lg text-xs"
                    >
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        strokeWidth={2}
                        className="h-3 w-3"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              />
              <Input
                type="text"
                placeholder="Rechercher par nom, email, téléphone..."
                value={clientsSearch}
                onChange={(e) => {
                  setClientsSearch(e.target.value);
                  setClientsPage(0);
                }}
                className="pl-10 h-10 rounded-lg bg-white"
              />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200">
              <ClientsTable clients={clients} loading={clientsLoading} />
              {/* Pagination */}
              {clientsTotalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    {clientsTotal} client{clientsTotal > 1 ? 's' : ''} au total
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={clientsPage === 0}
                      onClick={() => setClientsPage((p) => p - 1)}
                      className="h-8 rounded-lg text-xs"
                    >
                      <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        strokeWidth={2}
                        className="h-3 w-3"
                      />
                    </Button>
                    <span className="text-xs text-slate-600 min-w-[80px] text-center">
                      Page {clientsPage + 1} / {clientsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={clientsPage >= clientsTotalPages - 1}
                      onClick={() => setClientsPage((p) => p + 1)}
                      className="h-8 rounded-lg text-xs"
                    >
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        strokeWidth={2}
                        className="h-3 w-3"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completed Tab */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200">
              <BookingsTable
                bookings={completedBookings}
                loading={completedLoading}
                onStatusChange={handleStatusChange}
                updatingBooking={updatingBooking}
                onSelect={setSelectedBooking}
              />
              {Math.ceil(completedTotal / PAGE_SIZE) > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    {completedTotal} commande{completedTotal > 1 ? 's' : ''} terminée{completedTotal > 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={completedPage === 0}
                      onClick={() => setCompletedPage((p) => p - 1)}
                      className="h-8 rounded-lg text-xs"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-slate-600 min-w-[80px] text-center">
                      Page {completedPage + 1} / {Math.ceil(completedTotal / PAGE_SIZE)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={completedPage >= Math.ceil(completedTotal / PAGE_SIZE) - 1}
                      onClick={() => setCompletedPage((p) => p + 1)}
                      className="h-8 rounded-lg text-xs"
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200">
              <QuotesTable quotes={quotes} loading={quotesLoading} />
              {/* Pagination */}
              {Math.ceil(quotesTotal / PAGE_SIZE) > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    {quotesTotal} demande{quotesTotal > 1 ? 's' : ''} au total
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={quotesPage === 0}
                      onClick={() => setQuotesPage((p) => p - 1)}
                      className="h-8 rounded-lg text-xs"
                    >
                      <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        strokeWidth={2}
                        className="h-3 w-3"
                      />
                    </Button>
                    <span className="text-xs text-slate-600 min-w-[80px] text-center">
                      Page {quotesPage + 1} / {Math.ceil(quotesTotal / PAGE_SIZE)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={quotesPage >= Math.ceil(quotesTotal / PAGE_SIZE) - 1}
                      onClick={() => setQuotesPage((p) => p + 1)}
                      className="h-8 rounded-lg text-xs"
                    >
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        strokeWidth={2}
                        className="h-3 w-3"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Detail Panel */}
      {selectedBooking && (
        <BookingDetailPanel
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={async (id, status) => {
            await handleStatusChange(id, status);
            setSelectedBooking((prev) =>
              prev ? { ...prev, status } : null
            );
          }}
          updatingBooking={updatingBooking}
        />
      )}
    </div>
  );
}

/* ============================================================
   STAT CARD
   ============================================================ */

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: typeof Calendar03Icon;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </span>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClasses[color]}`}
        >
          <HugeiconsIcon icon={icon} strokeWidth={1.5} className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

/* ============================================================
   STATUS BREAKDOWN
   ============================================================ */

function StatusBreakdown({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: 'amber' | 'blue' | 'emerald' | 'red';
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barColors = {
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-600">{label}</span>
        <span className="text-xs font-semibold text-slate-900">{count}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColors[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-400 mt-1">{pct}%</p>
    </div>
  );
}

/* ============================================================
   BOOKINGS TABLE
   ============================================================ */

function BookingsTable({
  bookings,
  loading,
  onStatusChange,
  updatingBooking,
  onSelect,
}: {
  bookings: BookingWithCustomer[];
  loading: boolean;
  onStatusChange: (id: string, status: BookingStatus) => void;
  updatingBooking: string | null;
  onSelect?: (booking: BookingWithCustomer) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg
          className="animate-spin h-6 w-6 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <HugeiconsIcon
          icon={Calendar03Icon}
          strokeWidth={1.5}
          className="h-10 w-10 mb-2"
        />
        <p className="text-sm">Aucune commande trouvée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
              Client
            </th>
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              Service
            </th>
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              Date & Heure
            </th>
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              Adresse
            </th>
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              Prix
            </th>
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              Statut
            </th>
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const statusConf = STATUS_CONFIG[booking.status];
            const statusIcon = STATUS_ICON[booking.status];
            const customerName = booking.profiles
              ? [booking.profiles.first_name, booking.profiles.last_name]
                  .filter(Boolean)
                  .join(' ') || booking.profiles.email
              : 'N/A';

            return (
              <tr
                key={booking.id}
                onClick={() => onSelect?.(booking)}
                className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                {/* Client */}
                <td className="px-6 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">
                      {customerName}
                    </p>
                    {booking.profiles?.email && (
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">
                        {booking.profiles.email}
                      </p>
                    )}
                  </div>
                </td>
                {/* Service */}
                <td className="px-4 py-3.5">
                  <span className="text-sm text-slate-700">
                    {SERVICE_LABELS[booking.service_type] || booking.service_type}
                  </span>
                  <p className="text-xs text-slate-400">
                    {booking.duration}h &middot; {booking.home_type}
                  </p>
                </td>
                {/* Date */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5 text-slate-400"
                    />
                    <span className="text-sm text-slate-700">
                      {formatDate(booking.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <HugeiconsIcon
                      icon={TimeQuarterPassIcon}
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5 text-slate-400"
                    />
                    <span className="text-xs text-slate-400">
                      {booking.time}
                    </span>
                  </div>
                </td>
                {/* Adresse */}
                <td className="px-4 py-3.5">
                  <div className="flex items-start gap-1.5 max-w-[200px]">
                    <HugeiconsIcon
                      icon={Location01Icon}
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-slate-700 truncate">
                      {booking.address}
                    </span>
                  </div>
                </td>
                {/* Prix */}
                <td className="px-4 py-3.5">
                  <span className="text-sm font-semibold text-slate-900">
                    {booking.total_price} CHF
                  </span>
                </td>
                {/* Statut */}
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConf.bgColor} ${statusConf.color}`}
                  >
                    <HugeiconsIcon
                      icon={statusIcon}
                      strokeWidth={1.5}
                      className="h-3 w-3"
                    />
                    {statusConf.label}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                  {updatingBooking === booking.id ? (
                    <svg
                      className="animate-spin h-4 w-4 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        onStatusChange(
                          booking.id,
                          e.target.value as BookingStatus
                        )
                      }
                      className="text-xs h-8 px-2 rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="in_progress">En cours</option>
                      <option value="completed">Terminée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   CLIENTS TABLE
   ============================================================ */

function ClientsTable({
  clients,
  loading,
}: {
  clients: Profile[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg
          className="animate-spin h-6 w-6 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <HugeiconsIcon
          icon={UserMultipleIcon}
          strokeWidth={1.5}
          className="h-10 w-10 mb-2"
        />
        <p className="text-sm">Aucun client trouvé</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
              Client
            </th>
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              Email
            </th>
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              Téléphone
            </th>
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              Rôle
            </th>
            <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
              Inscrit le
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const fullName =
              [client.first_name, client.last_name]
                .filter(Boolean)
                .join(' ') || '—';
            const initials =
              (client.first_name?.[0] || '') +
              (client.last_name?.[0] || '') ||
              client.email[0]?.toUpperCase();

            return (
              <tr
                key={client.id}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
              >
                {/* Client */}
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {fullName}
                      </p>
                    </div>
                  </div>
                </td>
                {/* Email */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5 text-slate-400"
                    />
                    <span className="text-sm text-slate-700">
                      {client.email}
                    </span>
                  </div>
                </td>
                {/* Téléphone */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={SmartPhone01Icon}
                      strokeWidth={1.5}
                      className="h-3.5 w-3.5 text-slate-400"
                    />
                    <span className="text-sm text-slate-700">
                      {client.phone || '—'}
                    </span>
                  </div>
                </td>
                {/* Rôle */}
                <td className="px-4 py-3.5">
                  <Badge
                    variant={client.role === 'admin' ? 'default' : 'secondary'}
                    className="rounded-full text-[10px]"
                  >
                    {client.role === 'admin'
                      ? 'Admin'
                      : client.role === 'provider'
                        ? 'Intervenant'
                        : 'Client'}
                  </Badge>
                </td>
                {/* Date inscription */}
                <td className="px-4 py-3.5">
                  <span className="text-sm text-slate-600">
                    {formatDate(client.created_at)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   BOOKING DETAIL PANEL
   ============================================================ */

function BookingDetailPanel({
  booking,
  onClose,
  onStatusChange,
  updatingBooking,
}: {
  booking: BookingWithCustomer;
  onClose: () => void;
  onStatusChange: (id: string, status: BookingStatus) => void;
  updatingBooking: string | null;
}) {
  const statusConf = STATUS_CONFIG[booking.status];
  const statusIcon = STATUS_ICON[booking.status];
  const customerName = booking.profiles
    ? [booking.profiles.first_name, booking.profiles.last_name]
        .filter(Boolean)
        .join(' ') || booking.profiles.email
    : 'N/A';

  // Parse notes for extras, pets, frequency, cleaning type
  const parseNotes = (notes: string | null) => {
    if (!notes) return { extras: [], hasPets: false, frequency: null, cleaningType: null, userNotes: null };
    const parts = notes.split(' | ');
    const extras: string[] = [];
    let hasPets = false;
    let frequency: string | null = null;
    let cleaningType: string | null = null;
    let userNotes: string | null = null;

    for (const part of parts) {
      if (part.startsWith('[EXTRAS]')) {
        extras.push(part.replace('[EXTRAS] ', ''));
      } else if (part.startsWith('[ANIMAUX]')) {
        hasPets = true;
      } else if (part.startsWith('[ABONNEMENT]')) {
        frequency = part.replace('[ABONNEMENT] ', '');
      } else if (part.startsWith('[TYPE]')) {
        cleaningType = part.replace('[TYPE] ', '');
      } else {
        userNotes = part;
      }
    }
    return { extras, hasPets, frequency, cleaningType, userNotes };
  };

  const parsedNotes = parseNotes(booking.notes);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-[60] h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Détails de la commande
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              {booking.id.slice(0, 8)}...
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Banner */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${statusConf.bgColor}`}>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={statusIcon} strokeWidth={1.5} className={`h-5 w-5 ${statusConf.color}`} />
              <span className={`text-sm font-semibold ${statusConf.color}`}>
                {statusConf.label}
              </span>
            </div>
            <select
              value={booking.status}
              onChange={(e) => onStatusChange(booking.id, e.target.value as BookingStatus)}
              disabled={updatingBooking === booking.id}
              className="text-xs h-8 px-2 rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          {/* Client */}
          <DetailSection title="Client">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{customerName}</p>
                {booking.profiles?.email && (
                  <p className="text-xs text-slate-500">{booking.profiles.email}</p>
                )}
              </div>
            </div>
            {booking.profiles?.phone && (
              <DetailRow icon={SmartPhone01Icon} label="Téléphone" value={booking.profiles.phone} />
            )}
          </DetailSection>

          {/* Service */}
          <DetailSection title="Service">
            <DetailRow
              icon={Calendar03Icon}
              label="Type de service"
              value={SERVICE_LABELS[booking.service_type] || booking.service_type}
            />
            {parsedNotes.cleaningType && (
              <DetailRow icon={CheckmarkCircle02Icon} label="Type de ménage" value={parsedNotes.cleaningType} />
            )}
            <DetailRow icon={Clock01Icon} label="Durée" value={`${booking.duration}h`} />
            <DetailRow icon={Calendar03Icon} label="Type de logement" value={booking.home_type} />
            {booking.home_size && (
              <DetailRow icon={Calendar03Icon} label="Taille" value={booking.home_size} />
            )}
          </DetailSection>

          {/* Date & Lieu */}
          <DetailSection title="Date & Lieu">
            <DetailRow icon={Calendar03Icon} label="Date" value={formatDate(booking.date)} />
            <DetailRow icon={TimeQuarterPassIcon} label="Heure" value={booking.time} />
            <DetailRow icon={Location01Icon} label="Adresse" value={booking.address} />
            {booking.address_details && (
              <DetailRow icon={Location01Icon} label="Complément" value={booking.address_details} />
            )}
          </DetailSection>

          {/* Tâches */}
          {booking.tasks && booking.tasks.length > 0 && (
            <DetailSection title="Tâches demandées">
              <div className="flex flex-wrap gap-2">
                {booking.tasks.map((task, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.5} className="h-3 w-3 text-emerald-500" />
                    {task}
                  </span>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Extras & Notes */}
          {(parsedNotes.extras.length > 0 || parsedNotes.hasPets || parsedNotes.frequency || parsedNotes.userNotes) && (
            <DetailSection title="Informations supplémentaires">
              {parsedNotes.frequency && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 mb-2">
                  <span className="text-xs font-medium text-blue-700">Abonnement : {parsedNotes.frequency}</span>
                </div>
              )}
              {parsedNotes.extras.map((extra, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-50 mb-2">
                  <span className="text-xs font-medium text-purple-700">{extra}</span>
                </div>
              ))}
              {parsedNotes.hasPets && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 mb-2">
                  <span className="text-xs font-medium text-amber-700">Présence d'animaux</span>
                </div>
              )}
              {parsedNotes.userNotes && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-xs font-medium text-slate-500 mb-1">Notes du client</p>
                  <p className="text-sm text-slate-700">{parsedNotes.userNotes}</p>
                </div>
              )}
            </DetailSection>
          )}

          {/* Prix */}
          <DetailSection title="Facturation">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 text-white">
              <span className="text-sm font-medium">Total</span>
              <span className="text-xl font-bold">{booking.total_price} CHF</span>
            </div>
          </DetailSection>

          {/* Méta */}
          <DetailSection title="Informations système">
            <DetailRow icon={Calendar03Icon} label="Créée le" value={formatDateTime(booking.created_at)} />
            <DetailRow icon={Calendar03Icon} label="Mise à jour" value={formatDateTime(booking.updated_at)} />
            {booking.provider_id && (
              <DetailRow icon={UserMultipleIcon} label="Intervenant" value={booking.provider_id.slice(0, 8) + '...'} />
            )}
            <div className="mt-2">
              <p className="text-[10px] font-mono text-slate-400 break-all">ID: {booking.id}</p>
              <p className="text-[10px] font-mono text-slate-400 break-all">User: {booking.user_id}</p>
            </div>
          </DetailSection>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   QUOTES TABLE
   ============================================================ */

const QUOTE_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: 'En attente', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200' },
  contacted: { label: 'Contacté', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  quoted: { label: 'Devis envoyé', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  accepted: { label: 'Accepté', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200' },
  rejected: { label: 'Refusé', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
};

function QuotesTable({
  quotes,
  loading,
}: {
  quotes: QuoteRequest[];
  loading: boolean;
}) {
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <svg className="animate-spin h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <HugeiconsIcon icon={FileEditIcon} strokeWidth={1.5} className="h-10 w-10 mb-2" />
        <p className="text-sm">Aucune demande de devis</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                Entreprise
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Contact
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Email / Tél
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Adresse
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Surface
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Fréquence
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Statut
              </th>
              <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => {
              const statusConf = QUOTE_STATUS_CONFIG[quote.status] || QUOTE_STATUS_CONFIG.pending;
              return (
                <tr
                  key={quote.id}
                  onClick={() => setSelectedQuote(quote)}
                  className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <HugeiconsIcon icon={Building06Icon} strokeWidth={1.5} className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-900 truncate max-w-[160px]">
                        {quote.company_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-slate-700">{quote.contact_name}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs text-slate-600 truncate max-w-[150px]">{quote.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <HugeiconsIcon icon={SmartPhone01Icon} strokeWidth={1.5} className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs text-slate-400">{quote.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-slate-700 truncate max-w-[150px] block">
                      {quote.address}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-slate-600">{quote.surface_area || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-slate-600">{quote.frequency || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusConf.bgColor} ${statusConf.color}`}>
                      {statusConf.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-500">{formatDate(quote.created_at)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quote Detail Panel */}
      {selectedQuote && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedQuote(null)} />
          <div className="fixed right-0 top-0 z-[60] h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Demande de devis</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedQuote.company_name}</p>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Statut */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${(QUOTE_STATUS_CONFIG[selectedQuote.status] || QUOTE_STATUS_CONFIG.pending).bgColor}`}>
                <span className={`text-sm font-semibold ${(QUOTE_STATUS_CONFIG[selectedQuote.status] || QUOTE_STATUS_CONFIG.pending).color}`}>
                  {(QUOTE_STATUS_CONFIG[selectedQuote.status] || QUOTE_STATUS_CONFIG.pending).label}
                </span>
              </div>

              {/* Entreprise */}
              <DetailSection title="Entreprise">
                <DetailRow icon={Building06Icon} label="Nom" value={selectedQuote.company_name} />
                <DetailRow icon={Location01Icon} label="Adresse" value={selectedQuote.address} />
                {selectedQuote.surface_area && (
                  <DetailRow icon={Calendar03Icon} label="Surface" value={selectedQuote.surface_area} />
                )}
                {selectedQuote.frequency && (
                  <DetailRow icon={Clock01Icon} label="Fréquence souhaitée" value={selectedQuote.frequency} />
                )}
              </DetailSection>

              {/* Contact */}
              <DetailSection title="Contact">
                <DetailRow icon={UserMultipleIcon} label="Nom" value={selectedQuote.contact_name} />
                <DetailRow icon={Mail01Icon} label="Email" value={selectedQuote.email} />
                <DetailRow icon={SmartPhone01Icon} label="Téléphone" value={selectedQuote.phone} />
              </DetailSection>

              {/* Message */}
              {selectedQuote.message && (
                <DetailSection title="Message">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedQuote.message}</p>
                  </div>
                </DetailSection>
              )}

              {/* Dates */}
              <DetailSection title="Informations">
                <DetailRow icon={Calendar03Icon} label="Reçue le" value={formatDateTime(selectedQuote.created_at)} />
                <DetailRow icon={Calendar03Icon} label="Mise à jour" value={formatDateTime(selectedQuote.updated_at)} />
                <p className="text-[10px] font-mono text-slate-400 break-all mt-2">ID: {selectedQuote.id}</p>
              </DetailSection>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ============================================================
   DETAIL SECTION & ROW
   ============================================================ */

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: typeof Calendar03Icon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2">
        <HugeiconsIcon icon={icon} strokeWidth={1.5} className="h-4 w-4 text-slate-400" />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-medium text-slate-900 text-right max-w-[60%] break-words">
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-CH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
