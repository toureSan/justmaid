import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { SettingsIcon, MailIcon } from "@hugeicons/core-free-icons";
import * as React from "react";

export const Route = createFileRoute("/booking/laundry")({ component: LaundryBookingPage });

function LaundryBookingPage() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: save to localStorage
    const notifications = JSON.parse(localStorage.getItem("laundry_notifications") || "[]");
    notifications.push({ email, date: new Date().toISOString() });
    localStorage.setItem("laundry_notifications", JSON.stringify(notifications));
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <Badge className="mb-4 bg-primary/10 text-primary">Bientôt disponible</Badge>
        
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <HugeiconsIcon icon={SettingsIcon} strokeWidth={1.5} className="h-10 w-10 text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold sm:text-4xl">Pressing & Blanchisserie</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Notre service de pressing arrive bientôt ! Nous récupérerons vos vêtements, 
          les laverons, sécherons et repasserons. Livraison à domicile incluse.
        </p>

        <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
          {!submitted ? (
            <>
              <h2 className="text-lg font-semibold">Soyez informé du lancement</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Laissez votre email pour être notifié dès que le service sera disponible.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <HugeiconsIcon 
                    icon={MailIcon} 
                    strokeWidth={2} 
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" 
                  />
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
                <Button type="submit" className="rounded-full">
                  Me notifier
                </Button>
              </form>
            </>
          ) : (
            <div className="py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                ✓
              </div>
              <h2 className="text-lg font-semibold">Merci !</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Nous vous préviendrons dès que le service pressing sera disponible.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
