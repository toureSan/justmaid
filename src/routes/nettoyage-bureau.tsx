import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowRight01Icon, 
  CheckmarkCircle02Icon,
  Building03Icon,
  Calendar03Icon,
  UserMultiple02Icon,
  NoteIcon
} from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/nettoyage-bureau")({
  head: () => ({
    meta: [
      { title: "Nettoyage de bureaux Genève | Entreprises | Justmaid" },
      { name: "description", content: "Service de nettoyage de bureaux professionnel à Genève. Entretien régulier ou ponctuel pour entreprises, cabinets, commerces. Devis gratuit personnalisé." },
      { name: "keywords", content: "nettoyage bureau genève, entreprise nettoyage professionnel, ménage entreprise suisse, entretien locaux professionnels, société nettoyage genève" },
      { property: "og:title", content: "Nettoyage de bureaux Genève | Justmaid" },
      { property: "og:description", content: "Nettoyage professionnel pour entreprises. Devis gratuit et personnalisé." },
      { property: "og:url", content: "https://justmaid.ch/nettoyage-bureau" },
    ],
    links: [
      { rel: "canonical", href: "https://justmaid.ch/nettoyage-bureau" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://justmaid.ch" },
            { "@type": "ListItem", "position": 2, "name": "Nettoyage de bureaux", "item": "https://justmaid.ch/nettoyage-bureau" }
          ]
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Nettoyage de bureaux",
          "description": "Service de nettoyage professionnel pour entreprises et locaux commerciaux",
          "provider": { "@type": "LocalBusiness", "name": "Justmaid" },
          "areaServed": ["Genève", "Nyon", "Lausanne"]
        }),
      },
    ],
  }),
  component: NettoyageBureauPage,
});

function NettoyageBureauPage() {
  const features = [
    { icon: Building03Icon, title: "Tous types de locaux", description: "Bureaux, open spaces, commerces, cabinets médicaux, salles de réunion" },
    { icon: Calendar03Icon, title: "Horaires flexibles", description: "Intervention tôt le matin, en soirée ou le week-end selon vos besoins" },
    { icon: UserMultiple02Icon, title: "Équipe dédiée", description: "Personnel formé aux spécificités du nettoyage professionnel" },
    { icon: NoteIcon, title: "Contrat sur mesure", description: "Fréquence et prestations adaptées à votre entreprise" },
  ];

  const services = [
    "Nettoyage et désinfection des postes de travail",
    "Entretien des espaces communs",
    "Nettoyage des sanitaires",
    "Vidage des corbeilles et tri sélectif",
    "Aspiration et lavage des sols",
    "Nettoyage des vitres intérieures",
    "Dépoussiérage du mobilier",
    "Désinfection des points de contact",
  ];

  const sectors = [
    { name: "Bureaux & Open spaces", icon: "🏢" },
    { name: "Cabinets médicaux", icon: "🏥" },
    { name: "Commerces & Boutiques", icon: "🏪" },
    { name: "Restaurants & Cafés", icon: "☕" },
    { name: "Salles de sport", icon: "💪" },
    { name: "Coworking", icon: "💻" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Nettoyage de bureaux</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-blue-50 via-background to-background overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4">
                  🏢 Pour les professionnels
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-bricolage-grotesque leading-tight">
                  Nettoyage<br />
                  <span className="text-blue-600">de bureaux</span>
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-lg">
                Offrez à vos collaborateurs un environnement de travail propre et sain. 
                Service sur mesure pour entreprises de toutes tailles.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/booking/cleaning">
                  <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                    Demander un devis gratuit
                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-green-500" />
                  <span>Devis sous 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-green-500" />
                  <span>Sans engagement</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="/menage-equipe6.png" 
                alt="Équipe nettoyage bureaux Justmaid" 
                className="rounded-3xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white rounded-2xl p-5 shadow-xl">
                <p className="text-2xl font-bold">50+</p>
                <p className="text-sm opacity-90">Entreprises clientes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12 font-bricolage-grotesque">
            Notre approche professionnelle 💼
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl bg-white border border-border hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100 mb-4">
                  <HugeiconsIcon icon={feature.icon} className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 font-bricolage-grotesque">
                Nos prestations 🧹
              </h2>
              <ul className="space-y-3">
                {services.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <span className="text-foreground">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">Secteurs d'activité</h3>
              <div className="grid grid-cols-2 gap-4">
                {sectors.map((sector, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-border">
                    <span className="text-2xl">{sector.icon}</span>
                    <span className="font-medium text-foreground">{sector.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 font-bricolage-grotesque">
            Besoin d'un devis personnalisé ? 📝
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Contactez-nous pour discuter de vos besoins. 
            Nous vous proposons une solution adaptée à votre entreprise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking/cleaning">
              <Button size="lg" className="rounded-full h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700">
                Demander un devis
                <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="tel:+41227926723">
              <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg">
                📞 022 792 67 23
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
