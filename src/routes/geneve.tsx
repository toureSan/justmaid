import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowRight01Icon, 
  CheckmarkCircle02Icon,
  Location01Icon,
  Clock01Icon,
  StarIcon,
  UserMultiple02Icon
} from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/geneve")({
  head: () => ({
    meta: [
      { title: "Femme de ménage Genève | Service de ménage dès 45 CHF/h | Justmaid" },
      { name: "description", content: "Trouvez une femme de ménage à Genève. Service professionnel, personnel vérifié et assuré. Intervention dans tous les quartiers de Genève. Réservation en ligne, dès 45 CHF/h." },
      { name: "keywords", content: "femme de ménage genève, aide ménagère genève, ménage genève, nettoyage appartement genève, service ménage genève" },
      { property: "og:title", content: "Femme de ménage Genève | Justmaid" },
      { property: "og:description", content: "Service de ménage professionnel à Genève. Personnel vérifié, dès 45 CHF/h." },
      { property: "og:url", content: "https://justmaid.ch/geneve" },
    ],
    links: [
      { rel: "canonical", href: "https://justmaid.ch/geneve" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://justmaid.ch" },
            { "@type": "ListItem", "position": 2, "name": "Genève", "item": "https://justmaid.ch/geneve" }
          ]
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Justmaid Genève",
          "description": "Service de ménage à domicile professionnel à Genève",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Genève",
            "addressRegion": "GE",
            "addressCountry": "CH"
          },
          "geo": { "@type": "GeoCoordinates", "latitude": 46.2044, "longitude": 6.1432 },
          "areaServed": {
            "@type": "City",
            "name": "Genève"
          },
          "priceRange": "CHF 45-80",
          "telephone": "+41 22 792 67 23"
        }),
      },
    ],
  }),
  component: GenevePage,
});

function GenevePage() {
  const quartiers = [
    "Eaux-Vives", "Plainpalais", "Champel", "Carouge", "Petit-Saconnex", 
    "Servette", "Pâquis", "Jonction", "Chêne-Bourg", "Thônex",
    "Vernier", "Meyrin", "Lancy", "Onex", "Grand-Saconnex"
  ];

  const stats = [
    { value: "200+", label: "Clients satisfaits", icon: UserMultiple02Icon },
    { value: "4.9/5", label: "Note moyenne", icon: StarIcon },
    { value: "24h", label: "Délai intervention", icon: Clock01Icon },
    { value: "15+", label: "Quartiers couverts", icon: Location01Icon },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Genève</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/geneve.jpg" 
            alt="Vue de Genève - Jet d'eau et lac Léman" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-4">
              📍 Canton de Genève
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-bricolage-grotesque leading-tight mb-6">
              Femme de ménage<br />
              <span className="text-blue-600">à Genève</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Service de ménage professionnel dans tous les quartiers de Genève. 
              Personnel local, vérifié et assuré. Réservation simple et rapide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/booking/cleaning">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto">
                  Réserver à Genève
                  <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-border shadow-sm">
                <span className="text-3xl font-bold text-primary">45 CHF</span>
                <span className="text-muted-foreground">/heure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <HugeiconsIcon icon={stat.icon} className="h-6 w-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quartiers */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4 font-bricolage-grotesque">
            Nous intervenons dans tous les quartiers 🗺️
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            De Carouge aux Eaux-Vives, de Meyrin à Thônex, nos femmes et hommes de ménage sont disponibles partout à Genève.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {quartiers.map((quartier, idx) => (
              <span 
                key={idx} 
                className="px-4 py-2 bg-white border border-border rounded-full text-foreground hover:border-primary hover:bg-primary/5 transition-colors cursor-default"
              >
                {quartier}
              </span>
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
                Nos services à Genève 🏠
              </h2>
              <div className="space-y-4">
                {[
                  { title: "Ménage à domicile", desc: "Nettoyage régulier ou ponctuel de votre appartement ou maison", link: "/menage-domicile" },
                  { title: "Ménage fin de bail", desc: "Récupérez votre garantie locative avec notre nettoyage complet", link: "/menage-fin-de-bail" },
                  { title: "Nettoyage de bureaux", desc: "Entretien professionnel de vos locaux commerciaux", link: "/nettoyage-bureau" },
                ].map((service, idx) => (
                  <Link key={idx} to={service.link} className="block p-4 bg-white rounded-xl border border-border hover:border-primary hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{service.title}</h3>
                        <p className="text-sm text-muted-foreground">{service.desc}</p>
                      </div>
                      <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5 text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="/equipe-menage1.png" 
                alt="Équipe de ménage Justmaid à Genève" 
                className="rounded-3xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 font-bricolage-grotesque">
            Prêt à réserver votre ménage à Genève ? ✨
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Réservez en 2 minutes et recevez une confirmation immédiate. 
            Intervention possible dès demain dans tout le canton.
          </p>
          <Link to="/booking/cleaning">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg">
              Réserver maintenant
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
