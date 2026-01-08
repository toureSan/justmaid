import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Service, City, Review } from '@/types/database';

// =====================================================
// SERVICES
// =====================================================

// Données par défaut pour le mode démo
const defaultServices: Service[] = [
  {
    id: '1',
    name: 'Ménage à domicile',
    slug: 'cleaning',
    description: 'Faites appel à nos femmes de ménage qualifiées pour un intérieur impeccable.',
    short_description: 'Nettoyage régulier ou ponctuel. Sols, vitres, cuisine, salle de bain...',
    base_price: 45,
    price_unit: 'CHF/h',
    image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
    emoji: '🧹',
    is_available: true,
    features: ['Personnel vérifié et assuré', 'Disponible aujourd\'hui', 'Produits à fournir', 'Réservation flexible'],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ménage d\'entreprise',
    slug: 'business_cleaning',
    description: 'Des locaux propres pour vos équipes. Bureaux, espaces communs, sanitaires.',
    short_description: 'Nettoyage professionnel de vos locaux',
    base_price: 30,
    price_unit: 'CHF/h',
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
    emoji: '🏢',
    is_available: true,
    features: ['Intervention hors heures', 'Contrat régulier', 'Devis personnalisé', 'Personnel formé'],
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Pressing sur mesure',
    slug: 'laundry',
    description: 'On récupère, lave, sèche et repasse vos vêtements. Livraison sous 48h.',
    short_description: 'Lavage, séchage et repassage de vos vêtements',
    base_price: 0,
    price_unit: '',
    image_url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600',
    emoji: '👔',
    is_available: false,
    features: ['Récupération à domicile', 'Lavage au kilo', 'Séchage & repassage', 'Livraison sous 48h'],
    created_at: new Date().toISOString(),
  },
];

/**
 * Récupérer tous les services
 */
export async function getServices(): Promise<{ services: Service[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { services: defaultServices, error: null };
  }

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error);
    return { services: defaultServices, error: error.message };
  }

  return { services: data || defaultServices, error: null };
}

/**
 * Récupérer un service par slug
 */
export async function getServiceBySlug(
  slug: string
): Promise<{ service: Service | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const service = defaultServices.find((s) => s.slug === slug);
    return { service: service || null, error: service ? null : 'Service non trouvé' };
  }

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching service:', error);
    return { service: null, error: error.message };
  }

  return { service: data, error: null };
}

// =====================================================
// CITIES
// =====================================================

// Données par défaut pour le mode démo
const defaultCities: City[] = [
  { id: '1', name: 'Genève', canton: 'Genève', image_url: '/geneve.jpg', is_available: true, bookings_count: 150, created_at: new Date().toISOString() },
  { id: '2', name: 'Nyon', canton: 'Vaud', image_url: '/nyon.jpg', is_available: true, bookings_count: 30, created_at: new Date().toISOString() },
  { id: '3', name: 'Lausanne', canton: 'Vaud', image_url: '/lausanne.jpg', is_available: false, bookings_count: 0, created_at: new Date().toISOString() },
  { id: '4', name: 'Montreux', canton: 'Vaud', image_url: '/montreux.jpg', is_available: false, bookings_count: 0, created_at: new Date().toISOString() },
  { id: '5', name: 'Vevey', canton: 'Vaud', image_url: '/vevey.jpg', is_available: false, bookings_count: 0, created_at: new Date().toISOString() },
  { id: '6', name: 'Neuchâtel', canton: 'Neuchâtel', image_url: '/neuchatel.jpg', is_available: false, bookings_count: 0, created_at: new Date().toISOString() },
  { id: '7', name: 'Sion', canton: 'Valais', image_url: '/sion.jpg', is_available: false, bookings_count: 0, created_at: new Date().toISOString() },
];

/**
 * Récupérer toutes les villes
 */
export async function getCities(): Promise<{ cities: City[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { cities: defaultCities, error: null };
  }

  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('is_available', { ascending: false })
    .order('bookings_count', { ascending: false });

  if (error) {
    console.error('Error fetching cities:', error);
    return { cities: defaultCities, error: error.message };
  }

  return { cities: data || defaultCities, error: null };
}

/**
 * Récupérer les villes disponibles uniquement
 */
export async function getAvailableCities(): Promise<{ cities: City[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { cities: defaultCities.filter((c) => c.is_available), error: null };
  }

  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('is_available', true)
    .order('bookings_count', { ascending: false });

  if (error) {
    console.error('Error fetching available cities:', error);
    return { cities: [], error: error.message };
  }

  return { cities: data || [], error: null };
}

/**
 * S'inscrire pour être notifié quand une ville sera disponible
 */
export async function subscribeToCity(
  cityId: string,
  email: string,
  userId?: string
): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Mode démo: juste simuler le succès
    console.log('City notification subscription (demo):', { cityId, email });
    return { success: true, error: null };
  }

  const { error } = await supabase
    .from('city_notifications')
    .insert({
      city_id: cityId,
      email,
      user_id: userId,
    });

  if (error) {
    // Ignorer l'erreur de duplicate
    if (error.code === '23505') {
      return { success: true, error: null };
    }
    console.error('Error subscribing to city:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// =====================================================
// REVIEWS
// =====================================================

/**
 * Récupérer les avis récents (pour la page d'accueil)
 */
export async function getRecentReviews(
  limit = 12
): Promise<{ reviews: Review[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Mode démo: pas d'avis
    return { reviews: [], error: null };
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .gte('rating', 4)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching reviews:', error);
    return { reviews: [], error: error.message };
  }

  return { reviews: data || [], error: null };
}

/**
 * Créer un avis
 */
export async function createReview(
  bookingId: string,
  userId: string,
  rating: number,
  comment?: string,
  providerId?: string
): Promise<{ review: Review | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { review: null, error: 'Supabase non configuré' };
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: bookingId,
      user_id: userId,
      provider_id: providerId,
      rating,
      comment,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating review:', error);
    return { review: null, error: error.message };
  }

  return { review: data, error: null };
}

/**
 * Statistiques globales
 */
export async function getStats(): Promise<{
  totalBookings: number;
  averageRating: number;
  totalReviews: number;
}> {
  if (!isSupabaseConfigured()) {
    return {
      totalBookings: 200,
      averageRating: 4.9,
      totalReviews: 200,
    };
  }

  // Ces requêtes peuvent être optimisées avec des vues ou des fonctions
  const [bookingsResult, reviewsResult] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('rating'),
  ]);

  const totalBookings = bookingsResult.count || 0;
  const reviews = reviewsResult.data || [];
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 4.9;

  return {
    totalBookings,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews,
  };
}
