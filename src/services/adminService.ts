import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  Booking,
  BookingStatus,
  Profile,
  Payment,
  Subscription,
  QuoteRequest,
} from '@/types/database';

export interface BookingWithCustomer extends Booking {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    phone: string | null;
  } | null;
}

export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalClients: number;
  totalRevenue: number;
  totalSubscriptions: number;
}

/**
 * Vérifier si l'utilisateur connecté est admin
 */
export async function checkIsAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

/**
 * Récupérer les statistiques admin
 */
export async function getAdminStats(): Promise<{
  stats: AdminStats | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { stats: null, error: 'Supabase non configuré' };
  }

  try {
    const [bookingsRes, clientsRes, paymentsRes, subscriptionsRes] =
      await Promise.all([
        supabase.from('bookings').select('status, total_price'),
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'client'),
        supabase
          .from('payments')
          .select('amount')
          .eq('status', 'succeeded'),
        supabase
          .from('subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
      ]);

    const bookings = bookingsRes.data || [];
    const totalRevenue = (paymentsRes.data || []).reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const stats: AdminStats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === 'pending').length,
      confirmedBookings: bookings.filter((b) => b.status === 'confirmed')
        .length,
      completedBookings: bookings.filter((b) => b.status === 'completed')
        .length,
      cancelledBookings: bookings.filter((b) => b.status === 'cancelled')
        .length,
      totalClients: clientsRes.count || 0,
      totalRevenue,
      totalSubscriptions: subscriptionsRes.count || 0,
    };

    return { stats, error: null };
  } catch (err: any) {
    return { stats: null, error: err.message };
  }
}

/**
 * Lister toutes les réservations (admin)
 */
export async function listAllBookings(options?: {
  status?: BookingStatus;
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{ bookings: BookingWithCustomer[]; total: number; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { bookings: [], total: 0, error: 'Supabase non configuré' };
  }

  // Récupérer les bookings sans jointure (plus fiable)
  let query = supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.search) {
    query = query.or(
      `address.ilike.%${options.search}%,notes.ilike.%${options.search}%`
    );
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options?.limit || 20) - 1
    );
  } else if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Admin: Error listing bookings:', error);
    return { bookings: [], total: 0, error: error.message };
  }

  const bookings = data || [];

  // Récupérer les profils des clients en une seule requête
  const userIds = [...new Set(bookings.map((b) => b.user_id))];
  let profilesMap: Record<string, { first_name: string | null; last_name: string | null; email: string; phone: string | null }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone')
      .in('id', userIds);

    if (profiles) {
      profilesMap = Object.fromEntries(
        profiles.map((p) => [p.id, { first_name: p.first_name, last_name: p.last_name, email: p.email, phone: p.phone }])
      );
    }
  }

  // Combiner bookings + profiles
  const bookingsWithCustomers: BookingWithCustomer[] = bookings.map((b) => ({
    ...b,
    profiles: profilesMap[b.user_id] || null,
  }));

  return {
    bookings: bookingsWithCustomers,
    total: count || 0,
    error: null,
  };
}

/**
 * Lister tous les clients (admin)
 */
export async function listAllClients(options?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{ clients: Profile[]; total: number; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { clients: [], total: 0, error: 'Supabase non configuré' };
  }

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options?.search) {
    query = query.or(
      `email.ilike.%${options.search}%,first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,phone.ilike.%${options.search}%`
    );
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options?.limit || 20) - 1
    );
  } else if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Admin: Error listing clients:', error);
    return { clients: [], total: 0, error: error.message };
  }

  return { clients: data || [], total: count || 0, error: null };
}

/**
 * Mettre à jour le statut d'une réservation (admin)
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase non configuré' };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId);

  if (error) {
    console.error('Admin: Error updating booking status:', error);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Lister les paiements (admin)
 */
export async function listAllPayments(options?: {
  limit?: number;
  offset?: number;
}): Promise<{ payments: Payment[]; total: number; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { payments: [], total: 0, error: 'Supabase non configuré' };
  }

  let query = supabase
    .from('payments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options?.limit || 20) - 1
    );
  } else if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, count, error } = await query;

  if (error) {
    return { payments: [], total: 0, error: error.message };
  }

  return { payments: data || [], total: count || 0, error: null };
}

/**
 * Lister les abonnements (admin)
 */
export async function listAllSubscriptions(options?: {
  limit?: number;
  offset?: number;
}): Promise<{
  subscriptions: Subscription[];
  total: number;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { subscriptions: [], total: 0, error: 'Supabase non configuré' };
  }

  let query = supabase
    .from('subscriptions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options?.limit || 20) - 1
    );
  } else if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, count, error } = await query;

  if (error) {
    return { subscriptions: [], total: 0, error: error.message };
  }

  return { subscriptions: data || [], total: count || 0, error: null };
}

/**
 * Lister les demandes de devis (admin)
 */
export async function listAllQuoteRequests(options?: {
  limit?: number;
  offset?: number;
}): Promise<{
  quotes: QuoteRequest[];
  total: number;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { quotes: [], total: 0, error: 'Supabase non configuré' };
  }

  let query = supabase
    .from('quote_requests')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options?.limit || 20) - 1
    );
  } else if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, count, error } = await query;

  if (error) {
    return { quotes: [], total: 0, error: error.message };
  }

  return { quotes: data || [], total: count || 0, error: null };
}
