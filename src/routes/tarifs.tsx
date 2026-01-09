import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ArrowRight01Icon, 
  CheckmarkCircle02Icon,
  InformationCircleIcon
} from "@hugeicons/core-free-icons";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs ménage Genève & Nyon | Dès 45 CHF/h | Justmaid" },
      { name: "description", content: "Découvrez nos tarifs de ménage transparents. Ménage à domicile dès 45 CHF/h, fin de bail 45 CHF/h. Réductions pour abonnements. Pas de frais cachés. Devis gratuit." },
      { name: "keywords", content: "tarif femme de ménage genève, tarif homme de ménage genève, prix ménage suisse, coût aide ménagère, tarif nettoyage appartement, prix ménage nyon" },
      { property: "og:title", content: "Tarifs ménage Genève & Nyon | Justmaid" },
      { property: "og:description", content: "Tarifs transparents dès 45 CHF/h. Réductions abonnements. Devis gratuit." },
      { property: "og:url", content: "https://justmaid.ch/tarifs" },
    ],
    links: [
      { rel: "canonical", href: "https://justmaid.ch/tarifs" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://justmaid.ch" },
            { "@type": "ListItem", "position": 2, "name": "Tarifs", "item": "https://justmaid.ch/tarifs" }
          ]
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PriceSpecification",
          "price": "45",
          "priceCurrency": "CHF",
          "unitCode": "HUR",
          "description": "Tarif horaire pour le ménage à domicile"
        }),
      },
    ],
  }),
  component: TarifsPage,
});

function TarifsPage() {
  const services = [
    {
      name: "Ménage à domicile",
      emoji: "🏠",
      price: "45",
      unit: "/heure",
      description: "Nettoyage régulier ou ponctuel de votre intérieur",
      features: [
        "Minimum 3 heures",
        "Personnel vérifié et assuré",
        "Produits à fournir par le client",
        "Disponible 6j/7",
      ],
      popular: true,
      link: "/menage-domicile",
    },
    {
      name: "Ménage fin de bail",
      emoji: "🔑",
      price: "45",
      unit: "/heure",
      description: "Nettoyage complet pour récupérer votre garantie",
      features: [
        "Nettoyage aux standards suisses",
        "Checklist complète",
        "Intervention rapide possible",
        "Devis gratuit sur demande",
      ],
      popular: false,
      link: "/menage-fin-de-bail",
    },
    {
      name: "Nettoyage bureaux",
      emoji: "🏢",
      price: "Sur devis",
      unit: "",
      description: "Entretien professionnel de vos locaux",
      features: [
        "Contrat sur mesure",
        "Horaires flexibles",
        "Équipe dédiée",
        "Devis gratuit sous 24h",
      ],
      popular: false,
      link: "/nettoyage-bureau",
    },
  ];

  const subscriptions = [
    { frequency: "Hebdomadaire", discount: "2 CHF/h", savings: "~32 CHF/mois", recommended: true },
    { frequency: "Toutes les 2 semaines", discount: "2 CHF/h", savings: "~16 CHF/mois", recommended: false },
    { frequency: "Mensuel", discount: "2 CHF/h", savings: "~8 CHF/mois", recommended: false },
  ];

  const extras = [
    { name: "Nettoyage du four", price: "25 CHF" },
    { name: "Nettoyage du réfrigérateur", price: "20 CHF" },
    { name: "Intérieur des placards", price: "15 CHF" },
    { name: "Nettoyage des vitres", price: "5 CHF/fenêtre" },
    { name: "Repassage", price: "3.50 CHF/pièce" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Tarifs</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground font-bricolage-grotesque mb-6">
            Tarifs transparents 💰
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Pas de frais cachés, pas de mauvaises surprises. 
            Vous savez exactement ce que vous payez avant de réserver.
          </p>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
            Paiement après l'intervention
          </div>
        </div>
      </section>

      {/* Services pricing */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12 font-bricolage-grotesque">
            Nos services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div 
                key={idx} 
                className={`relative rounded-2xl border-2 p-6 transition-shadow hover:shadow-xl ${
                  service.popular ? "border-primary bg-primary/5" : "border-border bg-white"
                }`}
              >
                {service.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Plus populaire
                  </span>
                )}
                <div className="text-center mb-6">
                  <span className="text-4xl mb-4 block">{service.emoji}</span>
                  <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{service.price}</span>
                    <span className="text-muted-foreground">{service.unit}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-green-500 shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to={service.link}>
                  <Button 
                    className={`w-full rounded-full ${service.popular ? "" : "bg-muted text-foreground hover:bg-muted/80"}`}
                    variant={service.popular ? "default" : "secondary"}
                  >
                    En savoir plus
                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription discounts */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4 font-bricolage-grotesque">
            Économisez avec un abonnement 🎁
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Optez pour un ménage régulier et bénéficiez d'une réduction sur chaque intervention
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {subscriptions.map((sub, idx) => (
              <div 
                key={idx} 
                className={`rounded-2xl p-6 text-center ${
                  sub.recommended ? "bg-primary text-white" : "bg-white border border-border"
                }`}
              >
                {sub.recommended && (
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    Recommandé
                  </span>
                )}
                <h3 className={`text-lg font-bold mb-2 ${sub.recommended ? "text-white" : "text-foreground"}`}>
                  {sub.frequency}
                </h3>
                <p className={`text-3xl font-bold mb-2 ${sub.recommended ? "text-white" : "text-primary"}`}>
                  -{sub.discount}
                </p>
                <p className={`text-sm ${sub.recommended ? "text-white/80" : "text-muted-foreground"}`}>
                  Économie: {sub.savings}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extras */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4 font-bricolage-grotesque">
            Options supplémentaires ➕
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Personnalisez votre ménage avec nos options additionnelles
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {extras.map((extra, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between px-6 py-4 ${
                    idx !== extras.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="font-medium text-foreground">{extra.name}</span>
                  <span className="text-primary font-semibold">{extra.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ pricing */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12 font-bricolage-grotesque">
            Questions fréquentes sur les tarifs
          </h2>
          <div className="space-y-6">
            {[
              { q: "Quand dois-je payer ?", a: "Le paiement est prélevé après l'intervention, une fois le ménage terminé. Vous ne payez que si vous êtes satisfait." },
              { q: "Y a-t-il des frais de déplacement ?", a: "Non, les frais de déplacement sont inclus dans le tarif horaire pour Genève et Nyon." },
              { q: "Les produits de ménage sont-ils inclus ?", a: "Non, vous devez fournir vos propres produits de ménage et équipements (aspirateur, serpillère, etc.)." },
              { q: "Quelle est la durée minimum ?", a: "La durée minimum est de 3 heures par intervention." },
              { q: "Comment annuler une réservation ?", a: "Vous pouvez annuler gratuitement jusqu'à 24h avant l'intervention via votre espace client." },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                  <HugeiconsIcon icon={InformationCircleIcon} className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-muted-foreground pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 font-bricolage-grotesque">
            Prêt à réserver ? ✨
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Obtenez votre prix exact en 2 minutes. Réservation simple, paiement après intervention.
          </p>
          <Link to="/booking/cleaning">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg">
              Calculer mon prix
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
