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

export const Route = createFileRoute("/nyon")({
  head: () => ({
    meta: [
      { title: "Femme de ménage Nyon | Service de ménage dès 45 CHF/h | Justmaid" },
      { name: "description", content: "Femme de ménage à Nyon et environs. Service professionnel de ménage à domicile. Personnel qualifié, vérifié et assuré. Réservation en ligne simple. Dès 45 CHF/h." },
      { name: "keywords", content: "femme de ménage nyon, aide ménagère nyon, ménage nyon, nettoyage appartement nyon, service ménage la côte" },
      { property: "og:title", content: "Femme de ménage Nyon | Justmaid" },
      { property: "og:description", content: "Service de ménage professionnel à Nyon. Personnel vérifié, dès 45 CHF/h." },
      { property: "og:url", content: "https://justmaid.ch/nyon" },
    ],
    links: [
      { rel: "canonical", href: "https://justmaid.ch/nyon" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://justmaid.ch" },
            { "@type": "ListItem", "position": 2, "name": "Nyon", "item": "https://justmaid.ch/nyon" }
          ]
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Justmaid Nyon",
          "description": "Service de ménage à domicile professionnel à Nyon et La Côte",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Nyon",
            "addressRegion": "VD",
            "addressCountry": "CH"
          },
          "geo": { "@type": "GeoCoordinates", "latitude": 46.3833, "longitude": 6.2333 },
          "areaServed": {
            "@type": "City",
            "name": "Nyon"
          },
          "priceRange": "CHF 45-80",
          "telephone": "+41 22 792 67 23"
        }),
      },
    ],
  }),
  component: NyonPage,
});

function NyonPage() {
  const communes = [
    "Nyon", "Gland", "Rolle", "Coppet", "Prangins", 
    "Chavannes-de-Bogis", "Crans-près-Céligny", "Founex", "Commugny", "Tannay",
    "Mies", "Versoix", "Genolier", "Begnins", "Vich"
  ];

  const stats = [
    { value: "50+", label: "Clients à Nyon", icon: UserMultiple02Icon },
    { value: "4.9/5", label: "Note moyenne", icon: StarIcon },
    { value: "24h", label: "Délai intervention", icon: Clock01Icon },
    { value: "15+", label: "Communes couvertes", icon: Location01Icon },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Nyon</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/nyon.jpg" 
            alt="Vue de Nyon - Château et lac Léman" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-full mb-4">
              📍 La Côte vaudoise
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-bricolage-grotesque leading-tight mb-6">
              Femme de ménage<br />
              <span className="text-green-600">à Nyon</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Service de ménage professionnel à Nyon et dans toutes les communes de La Côte. 
              Personnel local, vérifié et assuré.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/booking/cleaning">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  Réserver à Nyon
                  <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-border shadow-sm">
                <span className="text-3xl font-bold text-green-600">45 CHF</span>
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
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 mb-3">
                  <HugeiconsIcon icon={stat.icon} className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Communes */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4 font-bricolage-grotesque">
            Nous intervenons sur La Côte 🗺️
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            De Nyon à Rolle, de Gland à Coppet, nos femmes et hommes de ménage couvrent toute la région.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {communes.map((commune, idx) => (
              <span 
                key={idx} 
                className="px-4 py-2 bg-white border border-border rounded-full text-foreground hover:border-green-500 hover:bg-green-50 transition-colors cursor-default"
              >
                {commune}
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
                Nos services à Nyon 🏠
              </h2>
              <div className="space-y-4">
                {[
                  { title: "Ménage à domicile", desc: "Nettoyage régulier ou ponctuel de votre appartement ou maison", link: "/menage-domicile", available: true },
                  { title: "Ménage fin de bail", desc: "Récupérez votre garantie locative avec notre nettoyage complet", link: "/menage-fin-de-bail", available: true },
                  { title: "Nettoyage de bureaux", desc: "Entretien professionnel de vos locaux commerciaux", link: "/nettoyage-bureau", available: true },
                  { title: "Pressing & Blanchisserie", desc: "Lavage, séchage et livraison de vos vêtements", link: "/booking/laundry", available: false },
                  { title: "Repassage", desc: "Service de repassage professionnel à domicile", link: "/booking/laundry", available: false },
                ].map((service, idx) => (
                  service.available ? (
                    <Link key={idx} to={service.link} className="block p-4 bg-white rounded-xl border border-border hover:border-green-500 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{service.title}</h3>
                          <p className="text-sm text-muted-foreground">{service.desc}</p>
                        </div>
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5 text-green-600" />
                      </div>
                    </Link>
                  ) : (
                    <div key={idx} className="block p-4 bg-gray-50 rounded-xl border border-border opacity-75">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            {service.title}
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Bientôt</span>
                          </h3>
                          <p className="text-sm text-muted-foreground">{service.desc}</p>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="/femme-menage.png" 
                alt="Femme de ménage Justmaid à Nyon" 
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
            Prêt à réserver votre ménage à Nyon ? ✨
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Réservez en 2 minutes et recevez une confirmation immédiate. 
            Intervention possible dès demain sur toute La Côte.
          </p>
          <Link to="/booking/cleaning">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg bg-green-600 hover:bg-green-700">
              Réserver maintenant
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
