import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { 
  Booking, 
  BookingInsert, 
  BookingUpdate, 
  BookingStatus,
  ServiceType 
} from '@/types/database';

// =====================================================
// TYPES
// =====================================================

export interface CreateBookingData {
  serviceType: ServiceType;
  address: string;
  addressDetails?: string;
  latitude?: number;
  longitude?: number;
  homeType: string;
  homeSize?: string;
  date: string;
  time: string;
  duration: number;
  tasks: string[];
  notes?: string;
  totalPrice: number;
}

export interface BookingWithDetails extends Booking {
  customer?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
  };
}

// =====================================================
// CRÉER UNE RÉSERVATION
// =====================================================

export async function createBooking(
  userId: string,
  data: CreateBookingData
): Promise<{ booking: Booking | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Mode démo: sauvegarder dans localStorage
    const booking: Booking = {
      id: `booking_${Date.now()}`,
      user_id: userId,
      service_type: data.serviceType,
      address: data.address,
      address_details: data.addressDetails || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      home_type: data.homeType,
      home_size: data.homeSize || null,
      date: data.date,
      time: data.time,
      duration: data.duration,
      tasks: data.tasks,
      notes: data.notes || null,
      status: 'pending',
      total_price: data.totalPrice,
      provider_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('bookings') || '[]');
    existing.push(booking);
    localStorage.setItem('bookings', JSON.stringify(existing));

    return { booking, error: null };
  }

  const insertData: BookingInsert = {
    user_id: userId,
    service_type: data.serviceType,
    address: data.address,
    address_details: data.addressDetails,
    latitude: data.latitude,
    longitude: data.longitude,
    home_type: data.homeType,
    home_size: data.homeSize,
    date: data.date,
    time: data.time,
    duration: data.duration,
    tasks: data.tasks,
    notes: data.notes,
    total_price: data.totalPrice,
  };

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    return { booking: null, error: error.message };
  }

  return { booking, error: null };
}

// =====================================================
// LISTER LES RÉSERVATIONS
// =====================================================

export async function listBookings(
  userId: string,
  options?: {
    status?: BookingStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{ bookings: Booking[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Mode démo: récupérer du localStorage
    const all = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    let filtered = all.filter((b) => b.user_id === userId);
    
    if (options?.status) {
      filtered = filtered.filter((b) => b.status === options.status);
    }
    
    // Trier par date de création décroissante
    filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    if (options?.offset) {
      filtered = filtered.slice(options.offset);
    }
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return { bookings: filtered, error: null };
  }

  let query = supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error listing bookings:', error);
    return { bookings: [], error: error.message };
  }

  return { bookings: data || [], error: null };
}

// =====================================================
// OBTENIR UNE RÉSERVATION PAR ID
// =====================================================

export async function getBooking(
  bookingId: string
): Promise<{ booking: Booking | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const all = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    const booking = all.find((b) => b.id === bookingId);
    return { booking: booking || null, error: booking ? null : 'Réservation non trouvée' };
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error) {
    console.error('Error fetching booking:', error);
    return { booking: null, error: error.message };
  }

  return { booking: data, error: null };
}

// =====================================================
// METTRE À JOUR UNE RÉSERVATION
// =====================================================

export async function updateBooking(
  bookingId: string,
  updates: BookingUpdate
): Promise<{ booking: Booking | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const all = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    const index = all.findIndex((b) => b.id === bookingId);
    
    if (index === -1) {
      return { booking: null, error: 'Réservation non trouvée' };
    }

    all[index] = { ...all[index], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem('bookings', JSON.stringify(all));

    return { booking: all[index], error: null };
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking:', error);
    return { booking: null, error: error.message };
  }

  return { booking: data, error: null };
}

// =====================================================
// ANNULER UNE RÉSERVATION
// =====================================================

export async function cancelBooking(
  bookingId: string
): Promise<{ success: boolean; error: string | null }> {
  const result = await updateBooking(bookingId, { status: 'cancelled' });
  return { success: !!result.booking, error: result.error };
}

// =====================================================
// CONFIRMER UNE RÉSERVATION (après paiement)
// =====================================================

export async function confirmBooking(
  bookingId: string
): Promise<{ success: boolean; error: string | null }> {
  const result = await updateBooking(bookingId, { status: 'confirmed' });
  return { success: !!result.booking, error: result.error };
}

// =====================================================
// COMPTER LES RÉSERVATIONS
// =====================================================

export async function countBookings(
  userId: string,
  status?: BookingStatus
): Promise<{ count: number; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const all = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    let filtered = all.filter((b) => b.user_id === userId);
    if (status) {
      filtered = filtered.filter((b) => b.status === status);
    }
    return { count: filtered.length, error: null };
  }

  let query = supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (status) {
    query = query.eq('status', status);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting bookings:', error);
    return { count: 0, error: error.message };
  }

  return { count: count || 0, error: null };
}

// =====================================================
// RÉSERVATIONS À VENIR
// =====================================================

export async function getUpcomingBookings(
  userId: string,
  limit = 5
): Promise<{ bookings: Booking[]; error: string | null }> {
  const today = new Date().toISOString().split('T')[0];

  if (!isSupabaseConfigured()) {
    const all = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    const upcoming = all
      .filter((b) => 
        b.user_id === userId && 
        b.date >= today && 
        ['pending', 'confirmed'].includes(b.status)
      )
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
    
    return { bookings: upcoming, error: null };
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .gte('date', today)
    .in('status', ['pending', 'confirmed'])
    .order('date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming bookings:', error);
    return { bookings: [], error: error.message };
  }

  return { bookings: data || [], error: null };
}

// =====================================================
// HISTORIQUE DES RÉSERVATIONS
// =====================================================

export async function getBookingHistory(
  userId: string,
  limit = 10
): Promise<{ bookings: Booking[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const all = JSON.parse(localStorage.getItem('bookings') || '[]') as Booking[];
    const history = all
      .filter((b) => 
        b.user_id === userId && 
        ['completed', 'cancelled'].includes(b.status)
      )
      .sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, limit);
    
    return { bookings: history, error: null };
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['completed', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching booking history:', error);
    return { bookings: [], error: error.message };
  }

  return { bookings: data || [], error: null };
}
