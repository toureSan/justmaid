import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

const services = [
  {
    id: "cleaning",
    title: "Ménage à domicile 🧹",
    description:
      "Faites appel à nos femmes de ménage qualifiées pour un intérieur impeccable. Disponible dans la journée.",
    image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=300&fit=crop",
    href: "/booking/cleaning",
    available: true,
    features: [
      "Personnel vérifié et assuré",
      "Disponible aujourd'hui",
      "Produits inclus sur demande",
      "Réservation flexible",
    ],
    price: "À partir de 25 CHF/h",
  },
  {
    id: "laundry",
    title: "Pressing & Blanchisserie 👔",
    description:
      "Nous récupérons vos vêtements, les lavons, séchons et repassons. Livraison à domicile.",
    image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=300&fit=crop",
    href: "/booking/laundry",
    available: false,
    features: [
      "Récupération à domicile",
      "Lavage au kilo",
      "Séchage & repassage",
      "Livraison sous 48h",
    ],
    price: "À partir de 8 CHF/kg",
    comingSoon: true,
  },
  {
    id: "ironing",
    title: "Repassage ✨",
    description:
      "Service de repassage professionnel pour tous vos vêtements et linges de maison.",
    image: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=400&h=300&fit=crop",
    href: "/booking/laundry",
    available: false,
    features: [
      "Chemises & costumes",
      "Linge de maison",
      "Qualité pressing",
      "Livraison incluse",
    ],
    price: "À partir de 2 CHF/pièce",
    comingSoon: true,
  },
];

export function ServicesSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Nos services professionnels 💼
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Des services de qualité pour simplifier votre quotidien
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ServiceCardProps {
  service: (typeof services)[0];
  index: number;
}

function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <div
      className="group relative animate-fade-in-up overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {service.comingSoon && (
          <Badge className="absolute right-4 top-4 bg-white/90 text-primary">
            Bientôt disponible
          </Badge>
        )}
        
        {service.available && (
          <Badge className="absolute right-4 top-4 bg-green-500 text-white">
            Disponible
          </Badge>
        )}
        
        {/* Price tag */}
        <div className="absolute bottom-4 left-4">
          <p className="text-lg font-bold text-white">{service.price}</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {service.description}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {service.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        {service.available ? (
          <Link to={service.href}>
            <Button className="w-full rounded-full">
              Réserver maintenant
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="ml-2 h-4 w-4"
              />
            </Button>
          </Link>
        ) : (
          <Link to={service.href}>
            <Button variant="outline" className="w-full rounded-full">
              Être notifié
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="ml-2 h-4 w-4"
              />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
