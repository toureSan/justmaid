import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowRight01Icon, 
  CheckmarkCircle02Icon,
  Home01Icon,
  CleaningBucketIcon,
  Calendar03Icon,
  UserMultiple02Icon
} from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/menage-domicile")({
  head: () => ({
    meta: [
      { title: "Ménage à domicile Genève & Nyon | Dès 45 CHF/h | Justmaid" },
      { name: "description", content: "Service de ménage à domicile professionnel à Genève et Nyon. Femmes et hommes de ménage qualifiés, vérifiés et assurés. Réservation en ligne, intervention dès demain. 45 CHF/heure." },
      { name: "keywords", content: "ménage à domicile genève, femme de ménage nyon, homme de ménage nyon, aide ménagère suisse, nettoyage appartement, ménage maison genève" },
      { property: "og:title", content: "Ménage à domicile Genève & Nyon | Justmaid" },
      { property: "og:description", content: "Service de ménage professionnel à domicile. Personnel qualifié et vérifié. Dès 45 CHF/h." },
      { property: "og:url", content: "https://justmaid.ch/menage-domicile" },
    ],
    links: [
      { rel: "canonical", href: "https://justmaid.ch/menage-domicile" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://justmaid.ch" },
            { "@type": "ListItem", "position": 2, "name": "Ménage à domicile", "item": "https://justmaid.ch/menage-domicile" }
          ]
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Ménage à domicile",
          "description": "Service de ménage à domicile professionnel à Genève et Nyon",
          "provider": { "@type": "LocalBusiness", "name": "Justmaid" },
          "areaServed": ["Genève", "Nyon"],
          "offers": {
            "@type": "Offer",
            "price": "45",
            "priceCurrency": "CHF",
            "priceSpecification": { "@type": "UnitPriceSpecification", "price": "45", "priceCurrency": "CHF", "unitCode": "HUR" }
          }
        }),
      },
    ],
  }),
  component: MenageDomicilePage,
});

function MenageDomicilePage() {
  const features = [
    { icon: CleaningBucketIcon, title: "Nettoyage complet", description: "Cuisine, salles de bain, chambres, salon - tout est nettoyé selon vos besoins" },
    { icon: UserMultiple02Icon, title: "Personnel vérifié", description: "Tous nos intervenants sont vérifiés, formés et assurés" },
    { icon: Calendar03Icon, title: "Flexibilité totale", description: "Ponctuel ou régulier, adaptez la fréquence à votre rythme" },
    { icon: Home01Icon, title: "Tous types de logements", description: "Appartement, maison, studio, villa - nous intervenons partout" },
  ];

  const services = [
    "Nettoyage des sols (aspirateur, serpillère)",
    "Nettoyage des surfaces et meubles",
    "Nettoyage cuisine (plan de travail, évier, électroménager)",
    "Nettoyage salle de bain (douche, WC, lavabo)",
    "Changement des draps et linge de lit",
    "Rangement des espaces de vie",
    "Nettoyage des vitres intérieures",
    "Dépoussiérage et entretien général",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Ménage à domicile</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-4">
                  🏠 Service n°1 en Suisse romande
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-bricolage-grotesque leading-tight">
                  Ménage à domicile<br />
                  <span className="text-primary">professionnel</span>
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-lg">
                Confiez votre intérieur à nos femmes et hommes de ménage qualifiés. 
                Personnel vérifié, assuré et noté 4.9/5 par nos clients.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/booking/cleaning">
                  <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto">
                    Réserver maintenant
                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-border shadow-sm">
                  <span className="text-3xl font-bold text-primary">45 CHF</span>
                  <span className="text-muted-foreground">/heure</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-green-500" />
                  <span>Intervention dès demain</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-green-500" />
                  <span>Minimum 3 heures</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="/equipe-menage1.png" 
                alt="Équipe de ménage professionnel Justmaid" 
                className="rounded-3xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">⭐</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">4.9/5</p>
                    <p className="text-xs text-muted-foreground">200+ avis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12 font-bricolage-grotesque">
            Pourquoi choisir Justmaid ? 🌟
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl bg-white border border-border hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                  <HugeiconsIcon icon={feature.icon} className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services inclus */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 font-bricolage-grotesque">
                Ce qui est inclus 📋
              </h2>
              <p className="text-muted-foreground mb-8">
                Nos intervenants s'adaptent à vos besoins. Voici les prestations généralement incluses :
              </p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {services.map((service, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{service}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img 
                src="/femme-menage.png" 
                alt="Personnel de ménage Justmaid en action" 
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
            Prêt à profiter d'un intérieur impeccable ? ✨
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Réservez en 2 minutes et recevez une confirmation immédiate. 
            Nos intervenants sont disponibles dès demain.
          </p>
          <Link to="/booking/cleaning">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg">
              Réserver mon ménage
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
