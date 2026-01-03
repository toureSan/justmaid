import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  ArrowLeft02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi du lien");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
            <HugeiconsIcon
              icon={Tick02Icon}
              strokeWidth={2}
              className="h-10 w-10 text-green-600"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 font-bricolage-grotesque mb-4">
            Email envoyé ! 📧
          </h1>
          <p className="text-gray-600 mb-8">
            Si un compte existe avec l'adresse <strong>{email}</strong>, vous
            recevrez un lien pour réinitialiser votre mot de passe.
          </p>
          <Link to="/auth/login">
            <Button className="rounded-xl h-12 px-8">
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-justmaid-turquoise text-white font-bold text-xl">
            J
          </div>
          <span className="text-2xl font-bold text-gray-900 font-bricolage-grotesque">
            justmaid
          </span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-bricolage-grotesque">
            Mot de passe oublié ?
          </h1>
          <p className="mt-2 text-gray-600">
            Entrez votre email et nous vous enverrons un lien de réinitialisation
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-12 rounded-xl"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl text-base"
            disabled={isLoading}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
          </Button>
        </form>

        {/* Back Link */}
        <Link
          to="/auth/login"
          className="mt-8 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            strokeWidth={1.5}
            className="h-5 w-5"
          />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
