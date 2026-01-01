import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Leaf01Icon,
  ShieldIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

export function MissionSection() {
  const features = [
    {
      icon: Leaf01Icon,
      text: "Produits écologiques et respectueux de l'environnement",
    },
    {
      icon: ShieldIcon,
      text: "Personnel vérifié, formé et assuré",
    },
    {
      icon: Clock01Icon,
      text: "Disponible 7j/7 avec réservation en quelques clics",
    },
  ];

  return (
    <section className="relative py-10 sm:py-16 lg:py-28 bg-gradient-to-br from-primary via-primary to-blue-600 overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Left - Heart Shape with Image */}
          <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
            {/* Heart SVG Shape with Image */}
            <div className="relative w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px]">
              <svg 
                viewBox="0 0 100 100" 
                className="w-full h-full drop-shadow-2xl"
              >
                <defs>
                  <clipPath id="heartClip">
                    <path d="M50 88.9 C25 70, 5 50, 5 30 C5 15, 20 5, 35 5 C42 5, 48 8, 50 12 C52 8, 58 5, 65 5 C80 5, 95 15, 95 30 C95 50, 75 70, 50 88.9Z" />
                  </clipPath>
                  <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                {/* Background heart */}
                <path 
                  d="M50 88.9 C25 70, 5 50, 5 30 C5 15, 20 5, 35 5 C42 5, 48 8, 50 12 C52 8, 58 5, 65 5 C80 5, 95 15, 95 30 C95 50, 75 70, 50 88.9Z" 
                  fill="url(#heartGradient)"
                />
                {/* Image inside heart - Femme de ménage métisse souriante */}
                <image 
                  href="https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&h=600&fit=crop&crop=face"
                  x="5" 
                  y="5" 
                  width="90" 
                  height="85"
                  clipPath="url(#heartClip)"
                  preserveAspectRatio="xMidYMid slice"
                />
              </svg>
            </div>
          </div>

          {/* Right - Content */}
          <div className="text-white text-center lg:text-left order-1 lg:order-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Réinventer l'avenir du ménage à domicile. 🌟
            </h2>

            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 sm:gap-4 justify-center lg:justify-start">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: '#2FCCC0' }}>
                    <HugeiconsIcon icon={feature.icon} strokeWidth={1.5} className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <p className="text-sm sm:text-base lg:text-lg font-medium">{feature.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link to="/services">
                <Button 
                  variant="outline" 
                  className="rounded-full px-8 py-6 text-base font-semibold bg-white text-primary border-white hover:bg-white/90 hover:text-primary"
                >
                  À propos de nous
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

