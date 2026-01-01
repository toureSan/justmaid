import { HugeiconsIcon } from "@hugeicons/react";
import {
  SmartPhone01Icon,
  Clock01Icon,
  Calendar03Icon,
  Home01Icon,
  Tick02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";

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
  reverse?: boolean;
}

const features: Feature[] = [
  {
    id: 1,
    tag: "SIMPLE 📱",
    title: "Réservez votre ménage",
    description: "Réservez en quelques clics. Choisissez la date, l'heure et la durée qui vous conviennent le mieux.",
    points: [
      { icon: SmartPhone01Icon, text: "Réservez en ligne ou avec notre web ou mobile" },
      { icon: Clock01Icon, text: "Créneaux disponibles le week-end et le soir" },
    ],
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=900&fit=crop",
    cardTitle: "Réservation confirmée",
    cardDescription: "Votre aide-ménagère arrivera à l'heure convenue.",
    cardIcon: "✨",
    reverse: false,
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
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&h=900&fit=crop",
    cardTitle: "Personnel vérifié",
    cardDescription: "Tous nos intervenants sont formés et assurés.",
    cardIcon: "🛡️",
    reverse: true,
  },
  {
    id: 3,
    tag: "FLEXIBLE 🎯",
    title: "Profitez de votre temps libre",
    description: "Détendez-vous pendant que nous prenons soin de votre intérieur. Modifiez ou annulez facilement.",
    points: [
      { icon: Calendar03Icon, text: "Annulation gratuite jusqu'à 24h avant" },
      { icon: Home01Icon, text: "Même intervenant à chaque visite si vous le souhaitez" },
    ],
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=900&fit=crop",
    cardTitle: "Maison impeccable",
    cardDescription: "Votre intérieur brille, vous pouvez vous détendre.",
    cardIcon: "🏠",
    reverse: false,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile Title */}
        <div className="lg:hidden mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Comment ça marche ? 🚀
          </h2>
        </div>

        <div className="space-y-12 sm:space-y-16 lg:space-y-32">
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center ${
                feature.reverse ? "lg:grid-flow-dense" : ""
              }`}
            >
              {/* Section Title - only above first image */}
              {index === 0 && (
                <div className="hidden lg:block lg:col-start-2 lg:row-start-1 mb-4">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Comment ça marche ? 🚀
                  </h2>
                </div>
              )}
              {/* Text Content */}
              <div className={feature.reverse ? "lg:col-start-2" : ""}>
                <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  {feature.tag}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {/* Styled number badge */}
                  <div 
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold text-lg shadow-md"
                    style={{ backgroundColor: '#2FCCC0' }}
                  >
                    {feature.id}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                    {feature.title}
                  </h2>
                </div>
                <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature points */}
                <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                  {feature.points.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(47, 204, 192, 0.15)' }}>
                        <HugeiconsIcon 
                          icon={point.icon} 
                          strokeWidth={1.5} 
                          style={{ color: '#2FCCC0' }}
                          className="h-5 w-5 sm:h-6 sm:w-6" 
                        />
                      </div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{point.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image with floating card */}
              <div className={`relative ${feature.reverse ? "lg:col-start-1" : ""}`}>
                <div className="relative">
                  {/* Main image */}
                  <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="h-[300px] sm:h-[400px] w-full object-cover lg:h-[500px]"
                    />
                  </div>

                  {/* Floating card - hidden on small mobile, visible from sm */}
                  <div className="hidden sm:block absolute bottom-6 left-1/2 -translate-x-1/2 lg:bottom-10 lg:left-auto lg:right-6 lg:translate-x-0">
                    <div className="rounded-xl sm:rounded-2xl bg-white p-4 sm:p-5 shadow-xl ring-1 ring-gray-100 w-[240px] sm:w-[260px]">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Icon circle with turquoise background */}
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: '#2FCCC0' }}>
                          <span className="text-xl sm:text-2xl">{feature.cardIcon}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-primary text-sm sm:text-base">{feature.cardTitle}</p>
                          <p className="mt-1 text-xs sm:text-sm text-gray-500">{feature.cardDescription}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

