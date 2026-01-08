import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockIcon,
  ArrowRight01Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion avec Google");
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      navigate({ to: "/dashboard", search: { tab: "home" } });
    } catch (err: any) {
      setError(err.message || "Email ou mot de passe incorrect");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-Justmaid-turquoise text-white font-bold text-xl">
              J
            </div>
            <span className="text-2xl font-bold text-gray-900 font-bricolage-grotesque">
              Justmaid
            </span>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-bricolage-grotesque">
              Connexion
            </h1>
            <p className="mt-2 text-gray-600">
              Accédez à votre espace client Justmaid
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl mb-6"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">ou</span>
            </div>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <div className="relative mt-2">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  strokeWidth={1.5}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-12 pl-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">
                  Mot de passe
                </Label>
                <a
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative mt-2">
                <HugeiconsIcon
                  icon={LockIcon}
                  strokeWidth={1.5}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-12 pl-12 pr-12 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              className="w-full h-12 rounded-xl text-base"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="ml-2 h-5 w-5"
              />
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-8 text-center text-gray-600">
            Pas encore de compte ?{" "}
            <Link
              to="/auth/register"
              className="text-primary font-semibold hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:flex-1 relative">
        <img
          src="/equipe-menage1.png"
          alt="Équipe Justmaid"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(47, 204, 192, 0.9) 0%, rgba(37, 168, 158, 0.9) 100%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-lg">
            <h2 className="text-4xl font-bold font-bricolage-grotesque mb-6">
              Bienvenue chez Justmaid ✨
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Réservez votre ménage en quelques clics et profitez d'un intérieur
              impeccable.
            </p>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold">+500</p>
                <p className="text-white/80 text-sm">Intervenants</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">4.9/5</p>
                <p className="text-white/80 text-sm">Satisfaction</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">24h</p>
                <p className="text-white/80 text-sm">Disponibilité</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
