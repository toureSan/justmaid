import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Mail01Icon,
  LockIcon,
  ArrowRight01Icon,
  ViewIcon,
  ViewOffIcon,
  DashboardBrowsingIcon,
} from '@hugeicons/core-free-icons';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const Route = createFileRoute('/admin/login')({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Vérifier si l'utilisateur est déjà connecté (retour après OAuth Google)
  useEffect(() => {
    async function checkExistingSession() {
      // Échanger les tokens si présents dans l'URL (retour OAuth)
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          // Nettoyer le hash de l'URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          // Profil n'existe pas - créer si email admin autorisé
          const adminEmails = ['touremaka739@gmail.com', 'info@justmaid.company'];
          if (adminEmails.includes((user.email || '').toLowerCase())) {
            await supabase.from('profiles').upsert({
              id: user.id,
              email: user.email!,
              first_name: user.user_metadata?.full_name?.split(' ')[0] || null,
              last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
              avatar_url: user.user_metadata?.avatar_url || null,
              role: 'admin',
            });
            navigate({ to: '/admin' });
            return;
          }
        }

        if (profile?.role === 'admin') {
          navigate({ to: '/admin' });
        }
      }
    }
    checkExistingSession();
  }, [navigate]);

  // Écouter les changements d'auth (callback après Google OAuth)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            // Profil inexistant - le créer automatiquement en tant qu'admin si email autorisé
            const adminEmails = ['touremaka739@gmail.com', 'info@justmaid.company'];
            const userEmail = session.user.email || '';

            if (adminEmails.includes(userEmail.toLowerCase())) {
              const { error: insertError } = await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  email: userEmail,
                  first_name: session.user.user_metadata?.full_name?.split(' ')[0] || null,
                  last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || null,
                  avatar_url: session.user.user_metadata?.avatar_url || null,
                  role: 'admin',
                });

              if (!insertError) {
                navigate({ to: '/admin' });
                return;
              }
              setError(`Impossible de créer le profil admin: ${insertError.message}`);
            } else {
              await supabase.auth.signOut();
              setError(`Profil introuvable (erreur: ${profileError.message}). Votre email "${userEmail}" n'est pas autorisé.`);
            }
            setIsGoogleLoading(false);
            return;
          }

          if (profile?.role === 'admin') {
            navigate({ to: '/admin' });
          } else {
            await supabase.auth.signOut();
            setError(`Accès refusé. Votre rôle est "${profile?.role || 'inconnu'}" (admin requis). Exécutez dans Supabase SQL Editor: UPDATE profiles SET role = 'admin' WHERE id = '${session.user.id}';`);
            setIsGoogleLoading(false);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      localStorage.setItem('admin_login_redirect', 'true');

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        localStorage.removeItem('admin_login_redirect');
        throw authError;
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion avec Google');
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw new Error(`Erreur d'authentification: ${authError.message}`);
      }

      if (!data.user) {
        throw new Error('Connexion échouée');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error(`Erreur profil: ${profileError.message}`);
      }

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error(`Accès refusé. Votre rôle est "${profile?.role || 'inconnu'}" (admin requis).`);
      }

      navigate({ to: '/admin' });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 mb-4">
            <HugeiconsIcon
              icon={DashboardBrowsingIcon}
              strokeWidth={1.5}
              className="h-8 w-8 text-white"
            />
          </div>
          <h1 className="text-3xl font-bold text-white font-bricolage-grotesque">
            Administration
          </h1>
          <p className="mt-2 text-slate-400">
            Connectez-vous pour accéder au tableau de bord
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl mb-6 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirection...
              </span>
            ) : (
              <>
                <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuer avec Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-slate-500">ou</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-slate-300 text-sm">
                Email administrateur
              </Label>
              <div className="relative mt-2">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  strokeWidth={1.5}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@justmaid.ch"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-12 pl-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300 text-sm">
                Mot de passe
              </Label>
              <div className="relative mt-2">
                <HugeiconsIcon
                  icon={LockIcon}
                  strokeWidth={1.5}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500"
                />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-12 pl-12 pr-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <HugeiconsIcon
                    icon={showPassword ? ViewOffIcon : ViewIcon}
                    strokeWidth={1.5}
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 border-0 text-white font-semibold"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Se connecter
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    className="h-5 w-5"
                  />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-slate-500 text-sm">
          Justmaid Administration &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
