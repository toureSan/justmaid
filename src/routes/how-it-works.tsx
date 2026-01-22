import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SmartPhone01Icon,
  Clock01Icon,
  Calendar03Icon,
  Home01Icon,
  Tick02Icon,
  StarIcon,
  ArrowRight01Icon,
  SecurityLockIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorksPage,
  head: () => ({
    meta: [
      {
        title: "Comment ça marche ? | 3 étapes simples | Justmaid",
      },
      {
        name: "description",
        content: "Réservez en 3 étapes : 1. Choisissez date et durée 2. Un pro vérifié intervient 3. Profitez ! Paiement sécurisé après intervention. Simple et sans engagement.",
      },
      {
        property: "og:title",
        content: "Comment ça marche ? | 3 étapes simples | Justmaid",
      },
      {
        property: "og:description",
        content: "Réservez en 3 étapes simples. Paiement sécurisé après intervention.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://justmaid.ch/how-it-works",
      },
    ],
  }),
});

const steps = [
  {
    id: 1,
    title: "Réservez en ligne",
    description: "Choisissez votre date, heure et durée. Indiquez votre adresse et les tâches à effectuer. C'est simple et rapide !",
    icon: SmartPhone01Icon,
    image: "/equipe-menage1.png",
    details: [
      "Disponible 6j/7, de 7h à 22h",
      "Réservation en moins de 2 minutes",
      "Confirmation instantanée par email",
      "Modification gratuite jusqu'à 24h avant",
    ],
  },
  {
    id: 2,
    title: "Paiement sécurisé",
    description: "Payez en toute sécurité. Votre carte est pré-autorisée mais le paiement n'est effectué qu'après l'intervention.",
    icon: CreditCardIcon,
    image: "/femme-2-menage.png",
    details: [
      "Visa, Mastercard, Apple Pay, Google Pay",
      "Paiement après intervention réussie",
      "Factures disponibles dans votre espace",
      "Remboursement garanti si insatisfait",
    ],
  },
  {
    id: 3,
    title: "Un professionnel chez vous",
    description: "Notre intervenant(e) arrive à l'heure convenue, équipé(e) et prêt(e) à transformer votre intérieur.",
    icon: Home01Icon,
    image: "/homme-menage.png",
    details: [
      "Personnel vérifié et formé",
      "Assuré pour votre tranquillité",
      "Produits écologiques disponibles",
      "Même intervenant à chaque visite",
    ],
  },
  {
    id: 4,
    title: "Profitez de votre temps libre",
    description: "Pendant que nous nettoyons, détendez-vous ! Vous recevrez une notification une fois le ménage terminé.",
    icon: StarIcon,
    image: "/menage-equipe6.png",
    details: [
      "Notification de fin d'intervention",
      "Évaluez votre intervenant",
      "Historique de vos réservations",
      "Réservez à nouveau en 1 clic",
    ],
  },
];

const guarantees = [
  {
    icon: SecurityLockIcon,
    title: "100% Sécurisé",
    description: "Personnel vérifié, assuré et formé",
  },
  {
    icon: Tick02Icon,
    title: "Satisfaction garantie",
    description: "Remboursement si vous n'êtes pas satisfait",
  },
  {
    icon: Clock01Icon,
    title: "Annulation gratuite",
    description: "Jusqu'à 24h avant l'intervention",
  },
  {
    icon: Calendar03Icon,
    title: "Disponible aujourd'hui",
    description: "Créneaux disponibles dans la journée",
  },
];

function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner with Background Image */}
      <section className="relative overflow-hidden min-h-[500px] sm:min-h-[550px] lg:min-h-[600px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/equipe-menage3.png"
            alt="Équipe Justmaid"
            className="h-full w-full object-cover object-top"
          />
          {/* Turquoise overlay for text readability */}
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'linear-gradient(to right, rgba(47, 204, 192, 0.95), rgba(47, 204, 192, 0.80), rgba(47, 204, 192, 0.60))' 
            }} 
          />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white font-bricolage-grotesque leading-tight">
              Comment ça marche ? 
            </h1>
            <p className="mt-6 text-xl text-white/90 max-w-xl">
              Réservez votre ménage en 4 étapes simples. Un intérieur impeccable n'a jamais été aussi accessible.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link to="/booking/cleaning">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 rounded-full h-14 px-8 text-lg font-semibold shadow-xl">
                  Réserver maintenant
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap gap-6 text-white text-sm">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-5 w-5 text-white" />
                <span>Personnel vérifié</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="h-5 w-5 text-white" />
                <span>Disponible aujourd'hui</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="h-5 w-5 text-white" />
                <span>4.9/5 avis clients</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-bricolage-grotesque">
              4 étapes simples
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              De la réservation à l'intervention, tout est pensé pour vous simplifier la vie.
            </p>
          </div>

          <div className="space-y-20 lg:space-y-32">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col gap-12 lg:gap-20 lg:items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                {/* Image */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="overflow-hidden rounded-3xl shadow-2xl">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="h-[350px] sm:h-[450px] lg:h-[500px] w-full object-cover object-top"
                      />
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6">
                      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary text-white font-bold text-2xl sm:text-3xl shadow-xl">
                        {step.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 lg:max-w-lg">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <HugeiconsIcon
                        icon={step.icon}
                        strokeWidth={1.5}
                        className="h-7 w-7 text-primary"
                      />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    {step.description}
                  </p>

                  {/* Details list */}
                  <ul className="space-y-4">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-justmaid-turquoise/20">
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            strokeWidth={2}
                            className="h-4 w-4 text-justmaid-turquoise"
                          />
                        </div>
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-bricolage-grotesque">
              Nos garanties ✨
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Réservez en toute confiance
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((guarantee) => (
              <div
                key={guarantee.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <HugeiconsIcon
                    icon={guarantee.icon}
                    strokeWidth={1.5}
                    className="h-7 w-7 text-primary"
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {guarantee.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {guarantee.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-justmaid-turquoise">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-bricolage-grotesque">
            Prêt à essayer ? 🏠
          </h2>
          <p className="mt-6 text-xl text-white/90">
            Réservez votre premier ménage et profitez d’un intérieur impeccable avec Justmaid.
          </p>
          <div className="mt-10">
            <Link to="/booking/cleaning">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full h-14 px-10 text-lg font-semibold shadow-xl">
                Réserver mon ménage
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-white/80 text-sm">
            Annulation gratuite jusqu'à 24h avant • Satisfaction garantie
          </p>
        </div>
      </section>
    </div>
  );
}
