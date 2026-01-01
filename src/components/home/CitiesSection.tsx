import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const cities = [
  { name: "Genève", image: "/geneve.jpg", available: true, size: "large" },
  { name: "Sion", image: "/sion.jpg", available: false, size: "small" },
  { name: "Nyon", image: "/nyon.jpg", available: true, size: "small" },
  { name: "Vevey", image: "/vevey.jpg", available: false, size: "medium" },
  { name: "Montreux", image: "/montreux.jpg", available: false, size: "medium" },
  { name: "Neuchâtel", image: "/neuchatel.jpg", available: false, size: "medium" },
  { name: "Lausanne", image: "/lausanne.jpg", available: false, size: "large" },
];

export function CitiesSection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>();
  
  return (
    <section className="py-10 sm:py-16 lg:py-24 bg-white">
      <div ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-10 sm:mb-14 scroll-animate scroll-fade-up ${isVisible ? 'animate-in' : ''}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-bricolage-grotesque">
            Où nous intervenons 📍
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">
            justmaid est disponible à Genève et Nyon. D'autres villes arrivent bientôt !
          </p>
        </div>

        {/* Cities Grid - Bento style */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 scroll-animate scroll-scale scroll-delay-2 ${isVisible ? 'animate-in' : ''}`}>
          {/* Row 1: Genève (large) + Sion + Nyon */}
          <div className="col-span-2 row-span-2">
            <CityCard city={cities[0]} className="h-full min-h-[250px] sm:min-h-[350px]" />
          </div>
          <div className="col-span-1">
            <CityCard city={cities[1]} className="h-[120px] sm:h-[170px]" />
          </div>
          <div className="col-span-1">
            <CityCard city={cities[2]} className="h-[120px] sm:h-[170px]" />
          </div>
          
          {/* Row 2: Vevey + Montreux */}
          <div className="col-span-1">
            <CityCard city={cities[3]} className="h-[120px] sm:h-[170px]" />
          </div>
          <div className="col-span-1">
            <CityCard city={cities[4]} className="h-[120px] sm:h-[170px]" />
          </div>
          
          {/* Row 3: Neuchâtel + Lausanne (large) */}
          <div className="col-span-2 row-span-2">
            <CityCard city={cities[5]} className="h-full min-h-[200px] sm:min-h-[280px]" />
          </div>
          <div className="col-span-2 row-span-2">
            <CityCard city={cities[6]} className="h-full min-h-[200px] sm:min-h-[280px]" />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 sm:mt-14 text-center">
          <p className="text-gray-600 mb-4">
            Votre ville n'est pas listée ? Inscrivez-vous pour être notifié ! 🔔
          </p>
          <a
            href="/booking/cleaning"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            Réserver à Genève ou Nyon
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

interface CityCardProps {
  city: {
    name: string;
    image: string;
    available: boolean;
  };
  className?: string;
}

function CityCard({ city, className = "" }: CityCardProps) {
  return (
    <div className={`relative group overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer ${className}`}>
      <img
        src={city.image}
        alt={city.name}
        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
          !city.available ? "grayscale" : ""
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      
      {/* City name */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
        <span className="text-white font-bold text-lg sm:text-xl lg:text-2xl">
          {city.name}
        </span>
      </div>

      {/* Status badge */}
      {city.available ? (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <span className="bg-green-500 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            Disponible
          </span>
        </div>
      ) : (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <span className="bg-white/90 text-gray-700 text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1 rounded-full">
            ⏳ Bientôt
          </span>
        </div>
      )}
    </div>
  );
}
