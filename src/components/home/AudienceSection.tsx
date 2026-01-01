import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const audiences = [
  {
    id: "you",
    emoji: "✨",
    label: "Vous",
    description: "Prenez enfin du temps pour vous. Lisez ce livre que vous repoussez depuis des mois, profitez d'une soirée Netflix sans culpabilité, ou simplement savourez le calme d'une maison impeccable. Un intérieur propre, c'est l'esprit libre.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop",
  },
  {
    id: "businesses",
    emoji: "🏢",
    label: "Entreprises",
    description: "Offrez à vos équipes un environnement de travail impeccable. Des bureaux propres, des espaces communs accueillants, des sanitaires irréprochables. Résultat : une meilleure productivité et des collaborateurs plus heureux.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
  },
  {
    id: "professionals",
    emoji: "💼",
    label: "Professionnels",
    description: "Entre les réunions, les deadlines et les trajets, qui a le temps de passer l'aspirateur ? Laissez-nous gérer votre intérieur pendant que vous vous concentrez sur votre carrière. Rentrez dans une maison propre, l'esprit tranquille.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop",
  },
];

export function AudienceSection() {
  const [activeId, setActiveId] = React.useState("you");
  const activeAudience = audiences.find(a => a.id === activeId) || audiences[0];
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className={`mb-12 lg:mb-16 scroll-animate scroll-fade-up ${isVisible ? 'animate-in' : ''}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-bricolage-grotesque">
            Profitez d'une vie sans corvée 💖
            <br />
            <span className="text-primary">Concentrez-vous sur ce que vous aimez.</span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {audiences.map((audience) => (
            <button
              key={audience.id}
              onClick={() => setActiveId(audience.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-medium transition-all ${
                activeId === audience.id
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span className="text-lg">{audience.emoji}</span>
              <span>{audience.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Text */}
          <div className={`order-2 lg:order-1 scroll-animate scroll-fade-left scroll-delay-2 ${isVisible ? 'animate-in' : ''}`}>
            <span className="text-5xl mb-6 block">{activeAudience.emoji}</span>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-bricolage-grotesque">
              Parfait pour les {activeAudience.label.toLowerCase()}
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              {activeAudience.description}
            </p>
            <Link to="/booking/cleaning">
              <Button size="lg" className="rounded-full px-8 h-14 text-base">
                Réserver maintenant →
              </Button>
            </Link>
          </div>

          {/* Right - Image */}
          <div className={`order-1 lg:order-2 relative h-[300px] sm:h-[400px] lg:h-[450px] rounded-3xl overflow-hidden shadow-xl scroll-animate scroll-fade-right scroll-delay-3 ${isVisible ? 'animate-in' : ''}`}>
            {audiences.map((audience) => (
              <img
                key={audience.id}
                src={audience.image}
                alt={audience.label}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 ${
                  activeId === audience.id ? "opacity-100 scale-100" : "opacity-0 scale-105"
                }`}
              />
            ))}
            
            {/* Floating badge */}
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
                <p className="text-sm font-semibold text-gray-900">+200 clients satisfaits</p>
                <p className="text-xs text-gray-500">dans cette catégorie</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
