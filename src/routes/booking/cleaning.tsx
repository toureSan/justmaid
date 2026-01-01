import { createFileRoute } from "@tanstack/react-router";
import { BookingWizard } from "@/components/booking";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldIcon, Tick02Icon, Clock01Icon } from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/booking/cleaning")({ component: CleaningBookingPage });

function CleaningBookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Réserver un ménage
          </h1>
          <p className="mt-2 text-muted-foreground">
            Remplissez le formulaire ci-dessous pour réserver votre intervention
          </p>
          
          {/* Trust badges */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-4 w-4 text-primary" />
              <span>Personnel vérifié</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="h-4 w-4 text-primary" />
              <span>Disponible aujourd'hui</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon icon={ShieldIcon} strokeWidth={2} className="h-4 w-4 text-primary" />
              <span>Satisfaction garantie</span>
            </div>
          </div>
        </div>

        {/* Wizard */}
        <BookingWizard />
      </div>
    </div>
  );
}
