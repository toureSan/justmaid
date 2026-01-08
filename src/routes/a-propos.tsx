import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  CheckmarkCircle02Icon, 
  UserGroupIcon, 
  SecurityCheckIcon,
  Rocket01Icon,
  Tick02Icon,
  Target01Icon
} from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/a-propos")({
  component: AProposPage,
});

function AProposPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 via-white to-primary/5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            À propos de <span className="text-primary">Justmaid</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nous simplifions le quotidien des familles et professionnels en Suisse romande 
            grâce à des services de ménage de qualité, accessibles et fiables.
          </p>
        </div>
      </div>

      {/* Notre mission */}
      <div className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Chez Justmaid, nous croyons que tout le monde mérite de rentrer dans un intérieur 
                propre et accueillant. Notre mission est de rendre les services de ménage 
                professionnels accessibles à tous, avec une qualité irréprochable et des 
                tarifs transparents.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Nous mettons en relation des particuliers avec des intervenants qualifiés, 
                vérifiés et assurés. Chaque intervention est une promesse de qualité.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Basés à Genève, nous intervenons dans toute la région lémanique : 
                Genève, Nyon, Lausanne, Vevey, Montreux et environs.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/equipe-menage.png" 
                alt="Équipe Justmaid" 
                className="rounded-2xl shadow-lg w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-white p-6 rounded-2xl shadow-lg">
                <p className="text-3xl font-bold">200+</p>
                <p className="text-sm opacity-90">clients satisfaits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nos valeurs */}
      <div className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nos valeurs</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Tick02Icon,
                title: "Qualité",
                description: "Des intervenants formés et un contrôle qualité rigoureux pour chaque intervention."
              },
              {
                icon: SecurityCheckIcon,
                title: "Confiance",
                description: "Tous nos intervenants sont vérifiés, assurés et évalués par nos clients."
              },
              {
                icon: Target01Icon,
                title: "Simplicité",
                description: "Réservez en quelques clics, nous nous occupons de tout le reste."
              },
              {
                icon: UserGroupIcon,
                title: "Proximité",
                description: "Une équipe locale, disponible 6j/7 pour répondre à vos besoins."
              },
            ].map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <HugeiconsIcon icon={value.icon} strokeWidth={1.5} className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pourquoi nous choisir */}
      <div className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Pourquoi choisir Justmaid ?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Intervenants vérifiés et assurés",
              "Tarifs transparents sans surprise",
              "Réservation en ligne 24h/24",
              "Service client réactif",
              "Satisfaction garantie",
              "Même intervenant à chaque visite",
              "Annulation gratuite sous 24h",
              "Paiement 100% sécurisé",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à découvrir nos services ?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Réservez votre première intervention en quelques clics et découvrez 
            pourquoi nos clients nous font confiance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking/cleaning">
              <Button size="lg" variant="secondary" className="rounded-full px-8">
                <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} className="mr-2 h-5 w-5" />
                Réserver maintenant
              </Button>
            </Link>
            <Link to="/aide">
              <Button size="lg" variant="outline" className="rounded-full px-8 bg-transparent text-white border-white hover:bg-white/10">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Une question ?</h2>
          <p className="text-gray-600 mb-8">
            Notre équipe est à votre disposition pour répondre à toutes vos questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a href="mailto:contact@Justmaid.ch" className="text-primary font-medium hover:underline">
              contact@Justmaid.ch
            </a>
            <span className="hidden sm:block text-gray-300">|</span>
            <a href="tel:+41227926723" className="text-primary font-medium hover:underline">
              +41 22 792 67 23
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
