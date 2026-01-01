import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Menu01Icon, 
  Cancel01Icon,
  Tick02Icon,
  Tag01Icon,
  RepeatIcon,
  Wallet01Icon,
  StarIcon,
  GiftIcon,
  UserIcon,
  HelpCircleIcon,
  Logout02Icon,
  SecurityLockIcon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import * as React from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

// Type pour l'utilisateur local
interface LocalUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

export function Header() {
  const navigate = useNavigate();
  
  // État local pour l'authentification (fonctionne en SSR)
  const [user, setUser] = React.useState<LocalUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  // Charger l'utilisateur uniquement côté client
  React.useEffect(() => {
    setIsClient(true);
    
    const loadUser = async () => {
      if (isSupabaseConfigured()) {
        // Utiliser Supabase
        const supabase = getSupabase();
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        if (supaUser) {
          setUser({
            id: supaUser.id,
            email: supaUser.email || "",
            fullName: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "Utilisateur",
            avatarUrl: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture,
          });
          setIsAuthenticated(true);
        }
        
        // Écouter les changements d'auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              fullName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Utilisateur",
              avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            });
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        });
        
        return () => subscription.unsubscribe();
      } else {
        // Mode démo - fallback localStorage
        const savedUser = localStorage.getItem("justmaid_user");
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            setUser({
              id: parsed.id,
              email: parsed.email,
              fullName: parsed.name || parsed.email,
              avatarUrl: parsed.avatar,
            });
            setIsAuthenticated(true);
          } catch {
            // Ignore parsing errors
          }
        }
      }
    };
    
    loadUser();
  }, []);

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    }
    localStorage.removeItem("justmaid_user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    }
    // Mode démo fallback
    const demoUser = {
      id: `google_${Date.now()}`,
      email: "demo@gmail.com",
      name: "Jean Dupont",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      provider: "google",
    };
    localStorage.setItem("justmaid_user", JSON.stringify(demoUser));
    setUser({ id: demoUser.id, email: demoUser.email, fullName: demoUser.name, avatarUrl: demoUser.avatar });
    setIsAuthenticated(true);
    return { error: null };
  };

  const signInWithApple = async (): Promise<{ error: string | null }> => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    }
    // Mode démo fallback
    const demoUser = {
      id: `apple_${Date.now()}`,
      email: "demo@icloud.com",
      name: "Marie Martin",
      provider: "apple",
    };
    localStorage.setItem("justmaid_user", JSON.stringify(demoUser));
    setUser({ id: demoUser.id, email: demoUser.email, fullName: demoUser.name, avatarUrl: null });
    setIsAuthenticated(true);
    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!email || !password) return { error: "Email et mot de passe requis" };
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return { error: null };
    }
    // Mode démo fallback
    const demoUser = { id: `email_${Date.now()}`, email, name: email.split("@")[0], provider: "email" };
    localStorage.setItem("justmaid_user", JSON.stringify(demoUser));
    setUser({ id: demoUser.id, email: demoUser.email, fullName: demoUser.name, avatarUrl: null });
    setIsAuthenticated(true);
    return { error: null };
  };

  const signUp = async (email: string, password: string, metadata?: { firstName?: string; lastName?: string }): Promise<{ error: string | null }> => {
    if (!email || !password) return { error: "Email et mot de passe requis" };
    const fullName = [metadata?.firstName, metadata?.lastName].filter(Boolean).join(" ") || email.split("@")[0];
    
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            first_name: metadata?.firstName,
            last_name: metadata?.lastName,
          },
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    }
    // Mode démo fallback
    const demoUser = { id: `email_${Date.now()}`, email, name: fullName, provider: "email" };
    localStorage.setItem("justmaid_user", JSON.stringify(demoUser));
    setUser({ id: demoUser.id, email: demoUser.email, fullName: demoUser.name, avatarUrl: null });
    setIsAuthenticated(true);
    return { error: null };
  };
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  const handleLogout = async () => {
    await signOut();
    setSidebarOpen(false);
    navigate({ to: "/" });
  };

  const menuItems = [
    { icon: Tick02Icon, label: "Mes commandes", href: "/dashboard", tab: "home" },
    { icon: Tag01Icon, label: "Prix et services", href: "/dashboard", tab: "prices" },
    { icon: RepeatIcon, label: "Commandes répétées", href: "/dashboard", tab: "recurring" },
  ];

  const economyItems = [
    { icon: Wallet01Icon, label: "Mon portefeuille", description: "Acheter ou offrir des crédits", href: "/dashboard", tab: "subscriptions", highlight: true },
    { icon: StarIcon, label: "Abonnements", href: "/dashboard", tab: "subscriptions" },
    { icon: GiftIcon, label: "Parrainer un ami", href: "/dashboard", tab: "referral" },
  ];

  const infoItems = [
    { icon: UserIcon, label: "Compte", href: "/dashboard", tab: "account" },
    { icon: HelpCircleIcon, label: "Centre d'aide", href: "/dashboard", tab: "help" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: '#2FCCC0' }}>
              <span className="text-lg font-bold text-white">J</span>
            </div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>justmaid</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Accueil
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Nos services
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Comment ça marche
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Aide
            </Link>
          </nav>

          {/* Desktop CTA / User Menu */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && user ? (
              <>
                <Link to="/booking/cleaning">
                  <Button size="sm" className="rounded-full px-5">
                    Réserver maintenant
                  </Button>
                </Link>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-border bg-muted/50 py-1.5 pl-3 pr-1.5 transition-colors hover:bg-muted"
                >
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="h-4 w-4 text-muted-foreground" />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-primary-foreground">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                >
                  Se connecter
                </Button>
                <Link to="/booking/cleaning">
                  <Button size="sm" className="rounded-full px-5">
                    Réserver maintenant
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && user && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary overflow-hidden"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-primary-foreground">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <HugeiconsIcon
                icon={mobileMenuOpen ? Cancel01Icon : Menu01Icon}
                strokeWidth={2}
                className="h-6 w-6"
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border/40 bg-background md:hidden">
            <nav className="flex flex-col gap-1 px-4 py-4">
              <Link
                to="/"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/services"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nos services
              </Link>
              <Link
                to="/"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Comment ça marche
              </Link>
              <Link
                to="/"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Aide
              </Link>
              {!isAuthenticated && (
                <div className="mt-4 flex flex-col gap-2 border-t border-border/40 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowAuthModal(true);
                    }}
                  >
                    Se connecter
                  </Button>
                  <Link to="/booking/cleaning" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-full">
                      Réserver maintenant
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* User Sidebar */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 z-[70] h-full w-full max-w-sm bg-background shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border p-6">
              <div>
                <p className="text-sm text-muted-foreground">Salut,</p>
                <p className="text-xl font-bold text-foreground">{user?.fullName}</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100%-80px)] p-4">
              {/* Main Menu Items */}
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate({ to: item.href, search: { tab: item.tab } });
                    }}
                    className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-foreground transition-colors hover:bg-muted"
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Economy Section */}
              <div className="mt-6">
                <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Économiser avec justmaid
                </p>
                <div className="space-y-1">
                  {economyItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setSidebarOpen(false);
                        navigate({ to: item.href, search: { tab: item.tab } });
                      }}
                      className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                        item.highlight 
                          ? "bg-amber-50 hover:bg-amber-100" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <HugeiconsIcon 
                        icon={item.icon} 
                        strokeWidth={1.5} 
                        className={`h-5 w-5 ${item.highlight ? "text-amber-600" : "text-muted-foreground"}`} 
                      />
                      <div className="text-left">
                        <span className={`font-medium ${item.highlight ? "text-amber-900" : "text-foreground"}`}>
                          {item.label}
                        </span>
                        {item.description && (
                          <p className="text-xs text-amber-700">{item.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Section */}
              <div className="mt-6">
                <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Plus d'informations
                </p>
                <div className="space-y-1">
                  {infoItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setSidebarOpen(false);
                        navigate({ to: item.href, search: { tab: item.tab } });
                      }}
                      className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-foreground transition-colors hover:bg-muted"
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout */}
              <div className="mt-6 border-t border-border pt-4">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-primary transition-colors hover:bg-primary/5"
                >
                  <HugeiconsIcon icon={Logout02Icon} strokeWidth={1.5} className="h-5 w-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal d'authentification */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onGoogleAuth={signInWithGoogle}
          onAppleAuth={signInWithApple}
          onEmailSignIn={signIn}
          onEmailSignUp={signUp}
        />
      )}
    </>
  );
}

// Modal d'authentification
function AuthModal({
  onClose,
  onGoogleAuth,
  onAppleAuth,
  onEmailSignIn,
  onEmailSignUp,
}: {
  onClose: () => void;
  onGoogleAuth: () => Promise<{ error: string | null }>;
  onAppleAuth: () => Promise<{ error: string | null }>;
  onEmailSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onEmailSignUp: (email: string, password: string, metadata?: { firstName?: string; lastName?: string; phone?: string }) => Promise<{ error: string | null }>;
}) {
  const [authMode, setAuthMode] = React.useState<"choose" | "email_login" | "email_register">("choose");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    const result = await onGoogleAuth();
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    setIsLoading(false);
  };

  const handleAppleAuth = async () => {
    setIsLoading(true);
    setError(null);
    const result = await onAppleAuth();
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    setIsLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setError(null);
    
    let result: { error: string | null };
    if (authMode === "email_register") {
      const [firstName, ...lastNameParts] = name.split(' ');
      result = await onEmailSignUp(email, password, { 
        firstName, 
        lastName: lastNameParts.join(' ') || undefined 
      });
    } else {
      result = await onEmailSignIn(email, password);
    }
    
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {authMode === "choose" ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <HugeiconsIcon icon={SecurityLockIcon} strokeWidth={1.5} className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Connexion</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Connectez-vous ou créez un compte pour continuer
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Social Auth Buttons */}
            <div className="space-y-3">
              {/* Google */}
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-white px-4 py-3.5 font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted/50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>

              {/* Apple */}
              <button
                onClick={handleAppleAuth}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-black px-4 py-3.5 font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continuer avec Apple
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-muted-foreground">ou</span>
                </div>
              </div>

              {/* Email */}
              <button
                onClick={() => setAuthMode("email_login")}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-white px-4 py-3.5 font-medium text-foreground transition-all hover:border-primary/50 hover:bg-muted/50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Continuer avec Email
              </button>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
              En continuant, vous acceptez nos{" "}
              <a href="#" className="text-primary hover:underline">Conditions d'utilisation</a>
              {" "}et notre{" "}
              <a href="#" className="text-primary hover:underline">Politique de confidentialité</a>
            </p>
          </>
        ) : (
          <>
            {/* Email Auth Form */}
            <button
              onClick={() => setAuthMode("choose")}
              className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="h-4 w-4" />
              Retour
            </button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {authMode === "email_login" ? "Se connecter" : "Créer un compte"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {authMode === "email_login" 
                  ? "Entrez vos identifiants pour continuer" 
                  : "Créez votre compte justmaid"}
              </p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {authMode === "email_register" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Nom complet</label>
                  <input
                    type="text"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  placeholder="jean@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full rounded-full py-6 text-base font-semibold"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Connexion en cours...
                  </span>
                ) : authMode === "email_login" ? (
                  "Se connecter"
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              {authMode === "email_login" ? (
                <p className="text-muted-foreground">
                  Pas encore de compte ?{" "}
                  <button 
                    onClick={() => setAuthMode("email_register")}
                    className="text-primary font-medium hover:underline"
                  >
                    S'inscrire
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Déjà un compte ?{" "}
                  <button 
                    onClick={() => setAuthMode("email_login")}
                    className="text-primary font-medium hover:underline"
                  >
                    Se connecter
                  </button>
                </p>
              )}
            </div>
          </>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
              <p className="text-sm font-medium text-muted-foreground">Connexion en cours...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
