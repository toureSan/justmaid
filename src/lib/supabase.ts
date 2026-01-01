import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Helper pour détecter si on est côté client
const isClient = typeof window !== 'undefined';

// Variables d'environnement - vérifier si disponibles
const getEnvVar = (key: string): string | undefined => {
  try {
    // Vite expose les variables via import.meta.env
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] as string | undefined;
    }
  } catch {
    // Ignorer les erreurs pendant le SSR
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Créer le client Supabase de manière lazy pour éviter les erreurs SSR
let _supabase: SupabaseClient<Database> | null = null;

export const getSupabase = (): SupabaseClient<Database> => {
  if (!_supabase) {
    _supabase = createClient<Database>(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder-key',
      {
        auth: {
          autoRefreshToken: true,
          persistSession: isClient,
          detectSessionInUrl: isClient,
        },
      }
    );
  }
  return _supabase;
};

// Export pour compatibilité (utilise le getter)
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return getSupabase()[prop as keyof SupabaseClient<Database>];
  },
});

// Helper pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  const url = getEnvVar('VITE_SUPABASE_URL');
  const key = getEnvVar('VITE_SUPABASE_ANON_KEY');
  return !!(url && key && !url.includes('placeholder') && !key.includes('REMPLACE'));
};
