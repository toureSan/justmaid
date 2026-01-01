import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  UserIcon,
  SunIcon,
} from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const steps = [
  {
    id: 1,
    icon: Calendar03Icon,
    description:
      "Sélectionnez la durée, la fréquence, la date et l'heure souhaitées de votre prochain ménage",
  },
  {
    id: 2,
    icon: UserIcon,
    description:
      "Nous vous mettrons en relation avec le meilleur agent de ménage disponible",
  },
  {
    id: 3,
    icon: SunIcon,
    description:
      "Détendez-vous et profitez de votre temps libre. Votre domicile sera nettoyé exactement selon vos préférences",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden" style={{ backgroundColor: '#2FCCC0' }}>
      {/* Decorative bubbles */}
      <div className="absolute top-20 left-10 w-8 h-8 rounded-full bg-white/20 blur-sm" />
      <div className="absolute bottom-32 left-20 w-4 h-4 rounded-full bg-white/30" />
      <div className="absolute top-40 right-1/3 w-6 h-6 rounded-full bg-white/15" />
      <div className="absolute bottom-20 right-20 w-10 h-10 rounded-full bg-white/20 blur-sm" />
      <div className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/25" />
      <div className="absolute bottom-10 left-1/4 w-6 h-6 rounded-full bg-white/20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left - Content Card */}
          <div className="relative">
            <div className="bg-gray-100/95 backdrop-blur-sm rounded-3xl p-8 sm:p-10 lg:p-12 shadow-xl">
              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-10">
                Comment ça fonctionne
              </h2>

              {/* Steps */}
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={step.id} className="relative">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 relative">
                        <HugeiconsIcon
                          icon={step.icon}
                          strokeWidth={1.5}
                          className="h-7 w-7 text-gray-700"
                        />
                        {/* Vertical line connector */}
                        {index < steps.length - 1 && (
                          <div className="absolute left-3.5 top-8 w-px h-12 bg-gray-300" />
                        )}
                      </div>

                      {/* Horizontal line */}
                      <div className="flex-1 pt-3">
                        <div className="h-px bg-gray-300" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-base leading-relaxed mt-3 max-w-md">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA Button - même couleur que les autres boutons (primary) */}
              <div className="mt-10">
                <Link to="/booking/cleaning">
                  <Button 
                    size="lg" 
                    className="rounded-full px-8 py-6 text-base font-semibold"
                  >
                    Réservez votre ménage
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right - Heart Shape with Image */}
          <div className="relative hidden lg:flex justify-center items-center">
            <div className="relative w-[400px] h-[400px] lg:w-[450px] lg:h-[450px]">
              {/* Heart SVG with image inside */}
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full drop-shadow-2xl"
              >
                <defs>
                  <clipPath id="heartClipHowItWorks">
                    <path d="M50 88.9 C25 70, 5 50, 5 30 C5 15, 20 5, 35 5 C42 5, 48 8, 50 12 C52 8, 58 5, 65 5 C80 5, 95 15, 95 30 C95 50, 75 70, 50 88.9Z" />
                  </clipPath>
                </defs>
                
                {/* White heart background */}
                <path 
                  d="M50 88.9 C25 70, 5 50, 5 30 C5 15, 20 5, 35 5 C42 5, 48 8, 50 12 C52 8, 58 5, 65 5 C80 5, 95 15, 95 30 C95 50, 75 70, 50 88.9Z" 
                  fill="white"
                />
                
                {/* Image inside heart - Femme de ménage souriante */}
                <image 
                  href="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=600&fit=crop&crop=face"
                  x="5" 
                  y="5" 
                  width="90" 
                  height="85"
                  clipPath="url(#heartClipHowItWorks)"
                  preserveAspectRatio="xMidYMid slice"
                />
              </svg>

              {/* Decorative elements around heart */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm" />
              <div className="absolute top-20 -right-8 w-10 h-10 rounded-full bg-white/40" />
              <div className="absolute -bottom-2 right-10 w-12 h-12 rounded-full bg-white/25 backdrop-blur-sm" />
              <div className="absolute bottom-20 -left-6 w-8 h-8 rounded-full bg-white/35" />
              <div className="absolute top-10 -left-4 w-6 h-6 rounded-full bg-white/30" />
              
              {/* Sparkles */}
              <div className="absolute top-8 right-20 text-2xl">✨</div>
              <div className="absolute bottom-16 left-8 text-xl">💖</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
