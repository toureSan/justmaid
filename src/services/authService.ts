import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile, ProfileUpdate, UserRole } from '@/types/database';

// Helper pour détecter si on est côté client
const isClient = typeof window !== 'undefined';

// Type pour l'utilisateur authentifié
export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

// Convertir un profil Supabase en AuthUser
function profileToAuthUser(profile: Profile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    fullName: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email,
    phone: profile.phone,
    avatarUrl: profile.avatar_url,
    role: profile.role,
  };
}

// =====================================================
// AUTHENTIFICATION
// =====================================================

/**
 * Inscription avec email et mot de passe
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: { firstName?: string; lastName?: string; phone?: string }
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase non configuré' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: metadata?.firstName,
        last_name: metadata?.lastName,
        phone: metadata?.phone,
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: 'Inscription échouée' };
  }

  // Récupérer le profil créé
  const profile = await getProfile(data.user.id);
  return { user: profile, error: null };
}

/**
 * Connexion avec email et mot de passe
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase non configuré' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (!data.user) {
    return { user: null, error: 'Connexion échouée' };
  }

  const profile = await getProfile(data.user.id);
  return { user: profile, error: null };
}

/**
 * Connexion avec Google
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase non configuré' };
  }

  if (!isClient) {
    return { error: 'Cette fonction ne peut être appelée que côté client' };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Connexion avec Apple
 */
export async function signInWithApple(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase non configuré' };
  }

  if (!isClient) {
    return { error: 'Cette fonction ne peut être appelée que côté client' };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Déconnexion
 */
export async function signOut(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    // Mode démo: supprimer du localStorage
    if (isClient) {
      localStorage.removeItem('justmaid_user');
    }
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Récupérer l'utilisateur actuellement connecté
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    // Mode démo: récupérer du localStorage (seulement côté client)
    if (isClient) {
      const saved = localStorage.getItem('justmaid_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            id: parsed.id,
            email: parsed.email,
            firstName: parsed.name?.split(' ')[0] || null,
            lastName: parsed.name?.split(' ').slice(1).join(' ') || null,
            fullName: parsed.name || parsed.email,
            phone: null,
            avatarUrl: parsed.avatar || null,
            role: 'client',
          };
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  return getProfile(user.id);
}

/**
 * Réinitialiser le mot de passe
 */
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: 'Supabase non configuré' };
  }

  if (!isClient) {
    return { error: 'Cette fonction ne peut être appelée que côté client' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// =====================================================
// PROFIL
// =====================================================

/**
 * Récupérer le profil d'un utilisateur
 */
export async function getProfile(userId: string): Promise<AuthUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profileToAuthUser(data);
}

/**
 * Mettre à jour le profil
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { user: null, error: 'Supabase non configuré' };
  }

  const { data, error } = await (supabase
    .from('profiles') as ReturnType<typeof supabase.from>)
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: profileToAuthUser(data as Profile), error: null };
}

// =====================================================
// LISTENERS
// =====================================================

/**
 * S'abonner aux changements d'état d'authentification
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
): () => void {
  if (!isSupabaseConfigured()) {
    // Mode démo: pas de listener
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        callback(profile);
      } else {
        callback(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}
