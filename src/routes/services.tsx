import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  ArrowRight01Icon,
  Clock01Icon,
  Home01Icon,
  StarIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      {
        title: "Nos services de ménage | Nettoyage, Pressing, Repassage | Justmaid",
      },
      {
        name: "description",
        content: "Découvrez nos services de ménage à domicile à Genève et Nyon : nettoyage régulier, ménage d'entreprise, pressing et repassage. Professionnels qualifiés, tarifs transparents.",
      },
      {
        property: "og:title",
        content: "Nos services de ménage | Nettoyage, Pressing, Repassage | Justmaid",
      },
      {
        property: "og:description",
        content: "Découvrez nos services de ménage à domicile à Genève et Nyon. Professionnels qualifiés, tarifs transparents.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://justmaid.ch/services",
      },
    ],
  }),
});

const services = [
  {
    id: "cleaning",
    title: "Ménage à domicile",
    emoji: "🧹",
    subtitle: "Un intérieur impeccable, sans effort",
    description: "Faites appel à nos professionnels du ménage pour transformer votre intérieur. Que ce soit pour un nettoyage régulier ou un grand ménage ponctuel, notre équipe s'occupe de tout.",
    image: "/equipe-menage1.png",
    available: true,
    price: "45 CHF/h",
    duration: "2 à 5 heures",
    href: "/booking/cleaning",
    features: [
      "Nettoyage des sols (aspirateur, serpillière)",
      "Dépoussiérage des meubles et surfaces",
      "Nettoyage de la cuisine (plan de travail, évier, électroménager)",
      "Nettoyage de la salle de bain (lavabo, douche, WC)",
      "Changement des draps et faire les lits",
      "Nettoyage des vitres intérieures",
      "Rangement et organisation",
    ],
    benefits: [
      {
        icon: Tick02Icon,
        title: "Personnel vérifié",
        description: "Tous nos intervenants sont vérifiés et assurés",
      },
      {
        icon: Clock01Icon,
        title: "Disponible aujourd'hui",
        description: "Intervention rapide selon disponibilités",
      },
      {
        icon: StarIcon,
        title: "Qualité garantie",
        description: "Satisfaction ou remboursement",
      },
      {
        icon: Calendar03Icon,
        title: "Flexibilité totale",
        description: "Modifiez ou annulez gratuitement jusqu'à 24h avant",
      },
    ],
    faq: [
      {
        question: "Dois-je fournir les produits de nettoyage ?",
        answer: "Non, nos intervenants peuvent venir avec leurs propres produits écologiques. Vous pouvez aussi demander à utiliser vos produits si vous préférez.",
      },
      {
        question: "Combien de temps dure une intervention ?",
        answer: "La durée dépend de la taille de votre logement et des tâches demandées. En moyenne, comptez 3h pour un appartement de 60-80m².",
      },
      {
        question: "Puis-je avoir toujours le même intervenant ?",
        answer: "Oui ! Nous privilégions la continuité. Vous pouvez demander le même intervenant à chaque visite.",
      },
    ],
  },
  {
    id: "laundry",
    title: "Pressing & Blanchisserie",
    emoji: "👔",
    subtitle: "Vos vêtements comme neufs, livrés chez vous",
    description: "Nous récupérons vos vêtements à domicile, les lavons, séchons et repassons avec soin, puis les livrons chez vous. Plus besoin de courir au pressing !",
    image: "/lavage-menage.png",
    available: false,
    price: "Prix bientôt disponible",
    duration: "48h de délai",
    href: "/booking/laundry",
    features: [
      "Récupération à domicile de vos vêtements",
      "Lavage professionnel au kilo",
      "Séchage délicat adapté aux textiles",
      "Repassage soigné de chaque pièce",
      "Pliage et emballage protecteur",
      "Livraison à domicile sous 48h",
      "Traitement des taches tenaces",
    ],
    benefits: [
      {
        icon: Home01Icon,
        title: "Service à domicile",
        description: "On vient chercher et on livre chez vous",
      },
      {
        icon: Clock01Icon,
        title: "Rapide",
        description: "Livraison sous 48h garantie",
      },
      {
        icon: StarIcon,
        title: "Qualité pressing",
        description: "Traitement professionnel de vos vêtements",
      },
      {
        icon: Tick02Icon,
        title: "Écologique",
        description: "Produits respectueux de l'environnement",
      },
    ],
    faq: [
      {
        question: "Comment fonctionne la récupération ?",
        answer: "Vous réservez un créneau, nous passons récupérer vos vêtements dans un sac fourni. Sous 48h, nous vous les ramenons propres et repassés.",
      },
      {
        question: "Quel est le poids minimum ?",
        answer: "Le minimum est de 3kg pour une commande. En moyenne, cela correspond à environ 10-15 vêtements.",
      },
      {
        question: "Traitez-vous les vêtements délicats ?",
        answer: "Oui, nous prenons soin de tous les textiles : soie, laine, cachemire... Indiquez-nous les pièces délicates lors de la commande.",
      },
    ],
  },
  {
    id: "ironing",
    title: "Repassage",
    emoji: "✨",
    subtitle: "Des vêtements parfaitement repassés",
    description: "Service de repassage professionnel pour tous vos vêtements et linges de maison. Chemises, costumes, draps... tout est traité avec le plus grand soin.",
    image: "/repassage-menage.png",
    available: false,
    price: "Prix bientôt disponible",
    duration: "48h de délai",
    href: "/booking/laundry",
    features: [
      "Repassage de chemises et chemisiers",
      "Repassage de pantalons et jupes",
      "Repassage de costumes et vestes",
      "Repassage de draps et housses de couette",
      "Repassage de nappes et serviettes",
      "Pliage soigné ou sur cintre",
      "Livraison à domicile",
    ],
    benefits: [
      {
        icon: StarIcon,
        title: "Qualité professionnelle",
        description: "Repassage impeccable comme au pressing",
      },
      {
        icon: Clock01Icon,
        title: "Gain de temps",
        description: "Plus de corvée de repassage le dimanche",
      },
      {
        icon: Home01Icon,
        title: "Pratique",
        description: "Récupération et livraison à domicile",
      },
      {
        icon: Tick02Icon,
        title: "Prix transparent",
        description: "Tarif à la pièce, sans surprise",
      },
    ],
    faq: [
      {
        question: "Comment comptez-vous les pièces ?",
        answer: "Chaque vêtement compte comme une pièce. Les draps de lit comptent comme 2 pièces, les housses de couette comme 3 pièces.",
      },
      {
        question: "Puis-je demander un repassage sur cintre ?",
        answer: "Oui, vous pouvez choisir entre le pliage ou la livraison sur cintre selon vos préférences.",
      },
      {
        question: "Que se passe-t-il si un vêtement est abîmé ?",
        answer: "Nous sommes assurés. En cas de dommage, nous vous remboursons ou remplaçons le vêtement.",
      },
    ],
  },
];

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative overflow-hidden min-h-[400px] sm:min-h-[450px]">
        <div className="absolute inset-0">
          <img
            src="/menage-equipe6.png"
            alt="Équipe Justmaid"
            className="h-full w-full object-cover object-top"
          />
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'linear-gradient(to right, rgba(47, 204, 192, 0.95), rgba(47, 204, 192, 0.80), rgba(47, 204, 192, 0.60))' 
            }} 
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white font-bricolage-grotesque leading-tight">
              Nos services
            </h1>
            <p className="mt-6 text-xl text-white/90 max-w-xl">
              Des services de qualité professionnelle pour simplifier votre quotidien. Ménage, pressing, repassage... on s'occupe de tout !
            </p>
          </div>
        </div>
      </section>

      {/* Services Détaillés */}
      {services.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={`py-16 sm:py-24 ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
              {/* Image */}
              <div className={`flex-1 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="relative">
                  <div className="overflow-hidden rounded-3xl shadow-2xl">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-[350px] sm:h-[450px] lg:h-[500px] w-full object-cover object-top"
                    />
                  </div>
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    {service.available ? (
                      <span className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        Disponible
                      </span>
                    ) : (
                      <span className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg">
                        Bientôt disponible
                      </span>
                    )}
                  </div>
                  {/* Price tag */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-white rounded-xl px-4 py-2 shadow-lg">
                      <p className="text-sm text-gray-500">À partir de</p>
                      <p className="text-2xl font-bold text-gray-900">{service.price}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`flex-1 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{service.emoji}</span>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-bricolage-grotesque">
                      {service.title}
                    </h2>
                    <p className="text-primary font-medium">{service.subtitle}</p>
                  </div>
                </div>

                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  {service.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ce qui est inclus :
                  </h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-justmaid-turquoise/20 mt-0.5">
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            strokeWidth={2}
                            className="h-3.5 w-3.5 text-justmaid-turquoise"
                          />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {service.available ? (
                    <Link to={service.href}>
                      <Button size="lg" className="rounded-full h-14 px-8 text-base">
                        Réserver maintenant
                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link to={service.href}>
                      <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base">
                        Être notifié du lancement
                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-justmaid-turquoise/10 mb-4">
                    <HugeiconsIcon
                      icon={benefit.icon}
                      strokeWidth={1.5}
                      className="h-6 w-6 text-justmaid-turquoise"
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 font-bricolage-grotesque">
                Questions fréquentes
              </h3>
              <div className="grid gap-6 lg:grid-cols-3">
                {service.faq.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {item.question}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-justmaid-turquoise">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-bricolage-grotesque">
            Prêt à simplifier votre quotidien ? ✨
          </h2>
          <p className="mt-6 text-xl text-white/90">
            Réservez votre premier service maintenant et découvrez la différence Justmaid.
          </p>
          <div className="mt-10">
            <Link to="/booking/cleaning">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full h-14 px-10 text-lg font-semibold shadow-xl">
                Réserver un ménage
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
