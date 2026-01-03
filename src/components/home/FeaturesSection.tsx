import { HugeiconsIcon } from "@hugeicons/react";
import {
  SmartPhone01Icon,
  Clock01Icon,
  Calendar03Icon,
  Home01Icon,
  Tick02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Feature {
  id: number;
  tag: string;
  title: string;
  description: string;
  points: { icon: typeof SmartPhone01Icon; text: string }[];
  image: string;
  cardTitle: string;
  cardDescription: string;
  cardIcon: string;
}

const features: Feature[] = [
  {
    id: 1,
    tag: "SIMPLE 📱",
    title: "Réservez votre ménage",
    description: "Réservez en quelques clics. Choisissez la date, l'heure et la durée qui vous conviennent le mieux.",
    points: [
      { icon: SmartPhone01Icon, text: "Réservez en ligne ou sur notre application" },
      { icon: Clock01Icon, text: "Créneaux disponibles le week-end et le soir" },
    ],
    image: "/equipe-menage.png",
    cardTitle: "Réservation confirmée",
    cardDescription: "Votre aide-ménagère arrive à l'heure.",
    cardIcon: "✨",
  },
  {
    id: 2,
    tag: "FIABLE 🛡️",
    title: "Un professionnel à domicile",
    description: "Nous sélectionnons rigoureusement nos intervenants. Personnel vérifié, formé et assuré.",
    points: [
      { icon: Tick02Icon, text: "Vérification des antécédents et références" },
      { icon: StarIcon, text: "Intervenants notés en moyenne 4.9/5" },
    ],
    image: "/homme-menage.png",
    cardTitle: "Personnel vérifié",
    cardDescription: "Formés et assurés.",
    cardIcon: "🛡️",
  },
  {
    id: 3,
    tag: "FLEXIBLE 🎯",
    title: "Profitez de votre temps libre",
    description: "Détendez-vous pendant que nous prenons soin de votre intérieur. Modifiez ou annulez facilement.",
    points: [
      { icon: Calendar03Icon, text: "Annulation gratuite jusqu'à 24h avant" },
      { icon: Home01Icon, text: "Même intervenant à chaque visite" },
    ],
    image: "/femme-2-menage.png",
    cardTitle: "Maison impeccable",
    cardDescription: "Vous pouvez vous détendre.",
    cardIcon: "🏠",
  },
];

function FeatureBlock({ feature, index }: { feature: Feature; index: number }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const isReversed = index % 2 === 1;
  
  return (
    <div 
      ref={ref}
      className={`flex flex-col gap-8 lg:gap-16 lg:items-center ${
        isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
      }`}
    >
      {/* Text Content */}
      <div className={`flex-1 lg:max-w-lg scroll-animate scroll-fade-up ${isVisible ? 'animate-in' : ''}`}>
        {/* Tag */}
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          {feature.tag}
        </p>
        
        {/* Title with number */}
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: '#2FCCC0' }}
          >
            {feature.id}
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {feature.title}
          </h3>
        </div>
        
        {/* Description */}
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          {feature.description}
        </p>

        {/* Feature points */}
        <div className="space-y-4">
          {feature.points.map((point, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div 
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(47, 204, 192, 0.15)' }}
              >
                <HugeiconsIcon 
                  icon={point.icon} 
                  strokeWidth={1.5} 
                  style={{ color: '#2FCCC0' }}
                  className="h-5 w-5" 
                />
              </div>
              <p className="font-medium text-gray-800">{point.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Image with floating card */}
      <div className={`flex-1 relative scroll-animate ${isReversed ? 'scroll-fade-left' : 'scroll-fade-right'} scroll-delay-2 ${isVisible ? 'animate-in' : ''}`}>
        <div className="relative">
          {/* Main image */}
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl">
            <img
              src={feature.image}
              alt={feature.title}
              className="h-[320px] sm:h-[400px] lg:h-[480px] w-full object-cover"
            />
          </div>

          {/* Floating card */}
          <div className={`absolute bottom-4 sm:bottom-6 ${isReversed ? 'right-4 sm:right-6' : 'left-4 sm:left-6'}`}>
            <div className="rounded-xl bg-white p-4 shadow-xl ring-1 ring-gray-100 w-[220px] sm:w-[250px]">
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#2FCCC0' }}
                >
                  <span className="text-lg">{feature.cardIcon}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{feature.cardTitle}</p>
                  <p className="text-xs text-gray-500">{feature.cardDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className={`mb-10 sm:mb-16 scroll-animate scroll-fade-up ${headerVisible ? 'animate-in' : ''}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-bricolage-grotesque">
            Comment ça marche ? 🚀
          </h2>
        </div>

        {/* Features */}
        <div className="space-y-16 sm:space-y-20 lg:space-y-28">
          {features.map((feature, index) => (
            <FeatureBlock key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
