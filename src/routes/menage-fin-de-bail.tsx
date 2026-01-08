import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowRight01Icon, 
  CheckmarkCircle02Icon,
  Home01Icon,
  SecurityCheckIcon,
  Clock01Icon,
  NoteIcon
} from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/menage-fin-de-bail")({
  head: () => ({
    meta: [
      { title: "Ménage fin de bail Genève & Nyon | 45 CHF/h | Justmaid" },
      { name: "description", content: "Nettoyage fin de bail professionnel à Genève et Nyon. Récupérez votre garantie locative. Nettoyage complet selon les standards suisses. 45 CHF/heure, devis gratuit." },
      { name: "keywords", content: "ménage fin de bail genève, nettoyage remise des clés, nettoyage appartement départ, garantie locative suisse, ménage état des lieux" },
      { property: "og:title", content: "Ménage fin de bail Genève & Nyon | Justmaid" },
      { property: "og:description", content: "Récupérez votre garantie locative. Nettoyage fin de bail professionnel. 45 CHF/h." },
      { property: "og:url", content: "https://justmaid.ch/menage-fin-de-bail" },
    ],
    links: [
      { rel: "canonical", href: "https://justmaid.ch/menage-fin-de-bail" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://justmaid.ch" },
            { "@type": "ListItem", "position": 2, "name": "Ménage fin de bail", "item": "https://justmaid.ch/menage-fin-de-bail" }
          ]
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Nettoyage fin de bail",
          "description": "Nettoyage professionnel pour remise des clés et récupération de la garantie locative",
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
  component: MenageFinDeBailPage,
});

function MenageFinDeBailPage() {
  const features = [
    { icon: SecurityCheckIcon, title: "Garantie locative", description: "Nettoyage aux standards suisses pour récupérer 100% de votre dépôt" },
    { icon: NoteIcon, title: "Conforme état des lieux", description: "Nous connaissons les exigences des régies genevoises" },
    { icon: Clock01Icon, title: "Intervention rapide", description: "Disponible même en dernière minute avant remise des clés" },
    { icon: Home01Icon, title: "Tout type de bien", description: "Appartement, studio, maison, colocation - nous gérons tout" },
  ];

  const checklist = [
    { zone: "Cuisine", tasks: ["Four et plaques", "Hotte aspirante", "Réfrigérateur intérieur/extérieur", "Placards (intérieur)", "Évier et robinetterie", "Sols et plinthes"] },
    { zone: "Salle de bain", tasks: ["Baignoire/douche (joints inclus)", "WC complet", "Lavabo et miroir", "Carrelage murs et sol", "Ventilation", "Placards"] },
    { zone: "Pièces", tasks: ["Fenêtres (intérieur)", "Sols (tous types)", "Plinthes et interrupteurs", "Radiateurs", "Portes et poignées", "Placards encastrés"] },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Ménage fin de bail</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-br from-orange-50 via-background to-background overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <span className="inline-block bg-orange-100 text-orange-700 text-sm font-medium px-4 py-2 rounded-full mb-4">
                  🔑 Récupérez votre garantie
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-bricolage-grotesque leading-tight">
                  Ménage<br />
                  <span className="text-orange-600">fin de bail</span>
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-lg">
                Nettoyage complet de votre appartement pour la remise des clés. 
                Nous connaissons les exigences des régies genevoises et garantissons un résultat impeccable.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/booking/cleaning">
                  <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
                    Réserver maintenant
                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-border shadow-sm">
                  <span className="text-3xl font-bold text-orange-600">45 CHF</span>
                  <span className="text-muted-foreground">/heure</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-green-500" />
                  <span>Devis gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-green-500" />
                  <span>Standards suisses</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="/equipe-menage3.png" 
                alt="Équipe nettoyage fin de bail Justmaid" 
                className="rounded-3xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-orange-600 text-white rounded-2xl p-5 shadow-xl">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-sm opacity-90">Garantie récupérée</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12 font-bricolage-grotesque">
            Pourquoi nous faire confiance ? 💪
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl bg-white border border-border hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-orange-100 mb-4">
                  <HugeiconsIcon icon={feature.icon} className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-4 font-bricolage-grotesque">
            Notre checklist complète 📋
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Voici ce que nous nettoyons pour garantir une remise des clés sans souci
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {checklist.map((zone, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                    {idx + 1}
                  </span>
                  {zone.zone}
                </h3>
                <ul className="space-y-2">
                  {zone.tasks.map((task, tidx) => (
                    <li key={tidx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-green-500 shrink-0" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 font-bricolage-grotesque">
            Déménagement bientôt ? 📦
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ne prenez pas de risque avec votre garantie locative. 
            Réservez votre nettoyage fin de bail et partez l'esprit tranquille.
          </p>
          <Link to="/booking/cleaning">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg bg-orange-600 hover:bg-orange-700">
              Obtenir un devis gratuit
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
