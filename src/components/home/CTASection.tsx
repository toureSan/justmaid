import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Clock01Icon, ShieldIcon } from "@hugeicons/core-free-icons";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-primary py-10 sm:py-16 lg:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            Prêt à avoir un intérieur impeccable ? ✨
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
            Réservez votre premier ménage maintenant et profitez d'un service de qualité dès aujourd'hui.
          </p>

          {/* Features */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="h-5 w-5" />
              <span>Disponible aujourd'hui</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <HugeiconsIcon icon={ShieldIcon} strokeWidth={2} className="h-5 w-5" />
              <span>Satisfaction garantie</span>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/booking/cleaning">
              <Button
                size="lg"
                className="rounded-full bg-white px-8 text-base font-semibold text-primary hover:bg-white/90"
              >
                Réserver maintenant
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="ml-2 h-5 w-5"
                />
              </Button>
            </Link>
            <Link to="/services">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-primary-foreground/30 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10"
              >
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
