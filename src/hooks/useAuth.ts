import * as React from 'react';
import { 
  getCurrentUser, 
  signIn, 
  signUp, 
  signOut, 
  signInWithGoogle, 
  signInWithApple,
  onAuthStateChange,
  updateProfile,
  type AuthUser 
} from '@/services/authService';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupabaseReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, metadata?: { firstName?: string; lastName?: string; phone?: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  updateProfile: (updates: { first_name?: string; last_name?: string; phone?: string; avatar_url?: string }) => Promise<{ error: string | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const isSupabaseReady = isSupabaseConfigured();

  // Charger l'utilisateur au montage
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // S'abonner aux changements d'authentification
    const unsubscribe = onAuthStateChange((newUser) => {
      setUser(newUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await signIn(email, password);
    if (result.user) {
      setUser(result.user);
    }
    setIsLoading(false);
    return { error: result.error };
  };

  const handleSignUp = async (
    email: string, 
    password: string, 
    metadata?: { firstName?: string; lastName?: string; phone?: string }
  ) => {
    setIsLoading(true);
    const result = await signUp(email, password, metadata);
    if (result.user) {
      setUser(result.user);
    }
    setIsLoading(false);
    return { error: result.error };
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    setUser(null);
    // Nettoyer aussi le localStorage pour le mode démo (seulement côté client)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('justmaid_user');
    }
    setIsLoading(false);
  };

  const handleSignInWithGoogle = async () => {
    if (!isSupabaseReady) {
      // Mode démo
      const demoUser: AuthUser = {
        id: `google_${Date.now()}`,
        email: 'demo@gmail.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        fullName: 'Jean Dupont',
        phone: null,
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        role: 'client',
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('justmaid_user', JSON.stringify({
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.fullName,
          avatar: demoUser.avatarUrl,
          provider: 'google',
        }));
      }
      return { error: null };
    }
    return signInWithGoogle();
  };

  const handleSignInWithApple = async () => {
    if (!isSupabaseReady) {
      // Mode démo
      const demoUser: AuthUser = {
        id: `apple_${Date.now()}`,
        email: 'demo@icloud.com',
        firstName: 'Marie',
        lastName: 'Martin',
        fullName: 'Marie Martin',
        phone: null,
        avatarUrl: null,
        role: 'client',
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('justmaid_user', JSON.stringify({
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.fullName,
          provider: 'apple',
        }));
      }
      return { error: null };
    }
    return signInWithApple();
  };

  const handleUpdateProfile = async (updates: { 
    first_name?: string; 
    last_name?: string; 
    phone?: string; 
    avatar_url?: string;
  }) => {
    if (!user) {
      return { error: 'Non connecté' };
    }

    if (!isSupabaseReady) {
      // Mode démo: mettre à jour localement
      const updatedUser: AuthUser = {
        ...user,
        firstName: updates.first_name ?? user.firstName,
        lastName: updates.last_name ?? user.lastName,
        fullName: [updates.first_name ?? user.firstName, updates.last_name ?? user.lastName].filter(Boolean).join(' '),
        phone: updates.phone ?? user.phone,
        avatarUrl: updates.avatar_url ?? user.avatarUrl,
      };
      setUser(updatedUser);
      return { error: null };
    }

    const result = await updateProfile(user.id, updates);
    if (result.user) {
      setUser(result.user);
    }
    return { error: result.error };
  };

  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSupabaseReady,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    signInWithGoogle: handleSignInWithGoogle,
    signInWithApple: handleSignInWithApple,
    updateProfile: handleUpdateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook simplifié pour vérifier si l'utilisateur est connecté
export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}

// Hook pour récupérer l'utilisateur courant
export function useCurrentUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}
