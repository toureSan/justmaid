import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import * as React from "react";

const services = [
  {
    id: "cleaning",
    title: "Ménage à domicile 🧹",
    description:
      "Faites appel à nos femmes de ménage qualifiées pour un intérieur impeccable. Disponible dans la journée.",
    image: "/equipe-menage1.png",
    href: "/menage-domicile",
    available: true,
    onQuote: false,
    features: [
      "Personnel vérifié et assuré",
      "Disponible aujourd'hui",
      "Produits à fournir par le client",
      "Réservation flexible",
    ],
    price: "À partir de 45 CHF/h",
  },
  {
    id: "fin-bail",
    title: "Ménage fin de bail 🔑",
    description:
      "Récupérez votre garantie locative avec notre nettoyage complet aux standards suisses.",
    image: "/equipe-menage3.png",
    href: "/menage-fin-de-bail",
    available: true,
    onQuote: false,
    features: [
      "Standards suisses",
      "Checklist complète",
      "Garantie récupérée",
      "Devis gratuit",
    ],
    price: "À partir de 45 CHF/h",
  },
  {
    id: "bureaux",
    title: "Nettoyage de bureaux 🏢",
    description:
      "Entretien professionnel de vos locaux commerciaux. Devis personnalisé.",
    image: "/menage-equipe6.png",
    href: "/nettoyage-bureau",
    available: true,
    onQuote: true,
    features: [
      "Tous types de locaux",
      "Horaires flexibles",
      "Équipe dédiée",
      "Contrat sur mesure",
    ],
    price: "Sur devis",
  },
  {
    id: "laundry",
    title: "Pressing & Blanchisserie 👔",
    description:
      "Nous récupérons vos vêtements, les lavons, séchons et repassons. Livraison à domicile.",
    image: "/lavage-menage.png",
    href: "/booking/laundry",
    available: false,
    onQuote: false,
    features: [
      "Récupération à domicile",
      "Lavage au kilo",
      "Séchage & repassage",
      "Livraison sous 48h",
    ],
    price: "",
    comingSoon: true,
  },
  {
    id: "ironing",
    title: "Repassage ✨",
    description:
      "Service de repassage professionnel pour tous vos vêtements et linges de maison.",
    image: "/repassage-menage.png",
    href: "/booking/laundry",
    available: false,
    onQuote: false,
    features: [
      "Chemises & costumes",
      "Linge de maison",
      "Qualité pressing",
      "Livraison incluse",
    ],
    price: "",
    comingSoon: true,
  },
];

export function ServicesSection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>();
  const sliderRef = React.useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 400;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <section className="py-16 sm:py-24">
      <div ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-12 flex items-end justify-between scroll-animate scroll-fade-up ${isVisible ? 'animate-in' : ''}`}>
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Nos services professionnels 💼
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Des services de qualité pour simplifier votre quotidien
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="hidden lg:flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors"
              aria-label="Précédent"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} className="h-5 w-5 text-foreground" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors"
              aria-label="Suivant"
            >
              <HugeiconsIcon icon={ArrowRight02Icon} className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Services Slider */}
        <div 
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {services.map((service, index) => (
            <div 
              key={service.id}
              className={`shrink-0 w-[400px] snap-start scroll-animate scroll-fade-up ${isVisible ? 'animate-in' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
        
        {/* Mobile scroll indicator */}
        <div className="flex justify-center mt-4 lg:hidden">
          <p className="text-sm text-muted-foreground">← Glissez pour voir plus →</p>
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
    <div className="group relative h-full flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
      {/* Image */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className={`h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
            !service.available ? "grayscale-30" : ""
          }`}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        
        {service.onQuote && (
          <Badge className="absolute right-4 top-4 bg-blue-500 text-white">
            Sur devis
          </Badge>
        )}
        
        {service.comingSoon && (
          <Badge className="absolute right-4 top-4 bg-white/90 text-primary">
            Bientôt disponible
          </Badge>
        )}
        
        {service.available && !service.onQuote && (
          <Badge className="absolute right-4 top-4 bg-green-500 text-white">
            Disponible
          </Badge>
        )}
        
        {/* Price tag */}
        <div className="absolute bottom-4 left-4">
          <p className="text-xl font-bold text-white">
            {service.onQuote ? "Sur devis" : service.price ? service.price : "Prix bientôt disponible"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col space-y-4 p-6">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{service.title}</h3>
          <p className="mt-2 text-base text-muted-foreground">
            {service.description}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 flex-1">
          {service.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2.5 text-base text-muted-foreground"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA - Always at bottom */}
        <div className="pt-4">
          {service.available ? (
            <Link to={service.href}>
              <Button className="w-full rounded-full h-12 text-base">
                {service.onQuote ? "Demander un devis" : "Réserver maintenant"}
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
