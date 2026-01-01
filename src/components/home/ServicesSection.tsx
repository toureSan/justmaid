import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const services = [
  {
    id: "cleaning",
    title: "Ménage à domicile",
    emoji: "🧹",
    description: "Faites appel à nos femmes de ménage qualifiées pour un intérieur impeccable. Disponible dans la journée.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=800&fit=crop",
    href: "/booking/cleaning",
    available: true,
    features: [
      "Personnel vérifié et assuré",
      "Disponible aujourd'hui",
      "Produits inclus sur demande",
      "Réservation flexible",
    ],
    price: "25 CHF/h",
  },
  {
    id: "laundry",
    title: "Pressing & Blanchisserie",
    emoji: "👔",
    description: "Nous récupérons vos vêtements, les lavons, séchons et repassons. Livraison à domicile.",
    image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&h=800&fit=crop",
    href: "/booking/laundry",
    available: false,
    features: [
      "Récupération à domicile",
      "Lavage au kilo",
      "Séchage & repassage",
      "Livraison sous 48h",
    ],
    price: "8 CHF/kg",
  },
  {
    id: "ironing",
    title: "Repassage",
    emoji: "✨",
    description: "Service de repassage professionnel pour tous vos vêtements et linges de maison.",
    image: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=600&h=800&fit=crop",
    href: "/booking/laundry",
    available: false,
    features: [
      "Chemises & costumes",
      "Linge de maison",
      "Qualité pressing",
      "Livraison incluse",
    ],
    price: "2 CHF/pièce",
  },
];

export function ServicesSection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>();
  
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-background">
      <div ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-12 sm:mb-16 scroll-animate scroll-fade-up ${isVisible ? 'animate-in' : ''}`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-bricolage-grotesque">
            Nos services professionnels 💼
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Des services de qualité pour simplifier votre quotidien
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {services.map((service, index) => (
            <div 
              key={service.id}
              className={`scroll-animate scroll-fade-up ${isVisible ? 'animate-in' : ''}`}
              style={{ animationDelay: `${(index + 1) * 0.15}s` }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  service: (typeof services)[0];
}

function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div className="group">
      {/* Large Image */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl h-[350px] sm:h-[450px] lg:h-[500px] mb-5">
        <img
          src={service.image}
          alt={service.title}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !service.available ? "grayscale-[30%]" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Badge */}
        <div className="absolute top-4 right-4">
          {service.available ? (
            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Disponible
            </span>
          ) : (
            <span className="bg-primary/90 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              Bientôt disponible
            </span>
          )}
        </div>
        
        {/* Price tag */}
        <div className="absolute bottom-5 left-5">
          <p className="text-xl sm:text-2xl font-bold text-white">
            À partir de {service.price}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            {service.title} <span>{service.emoji}</span>
          </h3>
          <p className="mt-2 text-muted-foreground">
            {service.description}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {service.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <span className="h-2 w-2 rounded-full bg-justmaid-turquoise shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="pt-2">
          {service.available ? (
            <Link to={service.href}>
              <Button className="w-full rounded-full h-12 text-base">
                Réserver maintenant
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="ml-2 h-5 w-5"
                />
              </Button>
            </Link>
          ) : (
            <Link to={service.href}>
              <Button variant="outline" className="w-full rounded-full h-12 text-base">
                Être notifié
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="ml-2 h-5 w-5"
                />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
