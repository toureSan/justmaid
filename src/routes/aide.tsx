import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  ArrowRight01Icon,
  Mail01Icon,
  Call02Icon,
  Message01Icon,
  Calendar03Icon,
  CreditCardIcon,
  Home01Icon,
  UserIcon,
  SecurityLockIcon,
  ArrowDown01Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";

export const Route = createFileRoute("/aide")({
  component: AidePage,
  head: () => ({
    meta: [
      {
        title: "Aide & FAQ | Questions fréquentes | Justmaid",
      },
      {
        name: "description",
        content: "Trouvez les réponses à vos questions sur Justmaid : réservation, paiement, annulation, intervention. Contactez notre équipe par email ou téléphone.",
      },
      {
        property: "og:title",
        content: "Aide & FAQ | Questions fréquentes | Justmaid",
      },
      {
        property: "og:description",
        content: "Trouvez les réponses à vos questions sur Justmaid. Contactez notre équipe.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://Justmaid.ch/aide",
      },
    ],
  }),
});

const categories = [
  {
    id: "reservation",
    title: "Réservation",
    icon: Calendar03Icon,
    description: "Comment réserver, modifier ou annuler",
    questions: [
      {
        question: "Comment réserver un ménage ?",
        answer: "Rendez-vous sur notre page d'accueil ou cliquez sur 'Réserver maintenant'. Indiquez votre code postal, choisissez la date, l'heure et la durée souhaitées. Sélectionnez les tâches à effectuer et confirmez votre réservation. Vous recevrez un email de confirmation immédiatement.",
      },
      {
        question: "Puis-je modifier ma réservation ?",
        answer: "Oui, vous pouvez modifier votre réservation gratuitement jusqu'à 24 heures avant l'intervention. Connectez-vous à votre espace client, accédez à 'Mes réservations' et cliquez sur 'Modifier'.",
      },
      {
        question: "Comment annuler ma réservation ?",
        answer: "L'annulation est gratuite jusqu'à 24h avant l'intervention. Rendez-vous dans votre tableau de bord, sélectionnez la réservation et cliquez sur 'Annuler'. Au-delà de ce délai, des frais peuvent s'appliquer.",
      },
      {
        question: "Puis-je réserver pour le jour même ?",
        answer: "Oui ! Selon les disponibilités, nous pouvons intervenir le jour même ou le lendemain.",
      },
      {
        question: "Quelle est la durée minimum d'une intervention ?",
        answer: "La durée minimum est de 3 heures. Nous recommandons 3 heures pour un appartement standard et 4-5 heures pour une maison ou un grand ménage.",
      },
    ],
  },
  {
    id: "paiement",
    title: "Paiement",
    icon: CreditCardIcon,
    description: "Moyens de paiement et facturation",
    questions: [
      {
        question: "Quels moyens de paiement acceptez-vous ?",
        answer: "Nous acceptons Visa, Mastercard, Apple Pay et Google Pay. Twint sera bientôt disponible. Le paiement est sécurisé via Stripe.",
      },
      {
        question: "Quand suis-je débité ?",
        answer: "Votre carte est pré-autorisée lors de la réservation, mais le paiement n'est effectué qu'après l'intervention réussie. Si vous annulez avant 24h, aucun montant n'est débité.",
      },
      {
        question: "Comment obtenir une facture ?",
        answer: "Les factures sont automatiquement envoyées par email après chaque intervention. Vous pouvez également les télécharger depuis votre espace client dans la section 'Historique'.",
      },
      {
        question: "Proposez-vous des abonnements ?",
        answer: "Oui ! Nous proposerons bientôt des formules d'abonnement avec des tarifs préférentiels pour les ménages réguliers (hebdomadaires ou bimensuels).",
      },
    ],
  },
  {
    id: "intervention",
    title: "Intervention",
    icon: Home01Icon,
    description: "Déroulement et prestations",
    questions: [
      {
        question: "Que dois-je préparer avant l'intervention ?",
        answer: "Assurez-vous que l'intervenant puisse accéder au logement. Rangez les objets de valeur et précieux. Si vous avez des consignes particulières, indiquez-les dans les notes lors de la réservation.",
      },
      {
        question: "L'intervenant apporte-t-il les produits ?",
        answer: "Par défaut, nos intervenants utilisent leurs propres produits écologiques. Vous pouvez demander à utiliser vos produits lors de la réservation si vous préférez.",
      },
      {
        question: "Puis-je demander le même intervenant ?",
        answer: "Oui ! Nous privilégions la continuité. Après votre première intervention, vous pouvez demander le même intervenant pour vos prochaines réservations.",
      },
      {
        question: "Que faire si je ne suis pas satisfait ?",
        answer: "Votre satisfaction est notre priorité. Contactez-nous dans les 24h suivant l'intervention. Nous organiserons une reprise gratuite ou un remboursement selon le cas.",
      },
      {
        question: "Les intervenants sont-ils assurés ?",
        answer: "Oui, tous nos intervenants sont couverts par une assurance responsabilité civile professionnelle. En cas de dommage, vous êtes protégé.",
      },
    ],
  },
  {
    id: "compte",
    title: "Mon compte",
    icon: UserIcon,
    description: "Gestion de votre espace client",
    questions: [
      {
        question: "Comment créer un compte ?",
        answer: "Vous pouvez créer un compte lors de votre première réservation ou en cliquant sur 'Se connecter' puis 'Créer un compte'. Vous pouvez vous inscrire avec Google ou avec votre email.",
      },
      {
        question: "J'ai oublié mon mot de passe",
        answer: "Cliquez sur 'Se connecter' puis 'Mot de passe oublié'. Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe.",
      },
      {
        question: "Comment modifier mes informations ?",
        answer: "Connectez-vous à votre compte, allez dans 'Mon compte' depuis le menu. Vous pouvez y modifier votre nom, email, téléphone et adresses.",
      },
      {
        question: "Comment supprimer mon compte ?",
        answer: "Contactez-nous à contact@Justmaid.ch avec votre demande de suppression. Nous traiterons votre demande sous 48h conformément au RGPD.",
      },
    ],
  },
  {
    id: "securite",
    title: "Sécurité & Confiance",
    icon: SecurityLockIcon,
    description: "Vérification et garanties",
    questions: [
      {
        question: "Comment vérifiez-vous les intervenants ?",
        answer: "Chaque intervenant passe par un processus de vérification : entretien, vérification d'identité, contrôle des références, et période d'essai supervisée. Seuls les meilleurs sont sélectionnés.",
      },
      {
        question: "Mes données sont-elles protégées ?",
        answer: "Oui, nous respectons le RGPD et les lois suisses sur la protection des données. Vos informations personnelles sont cryptées et jamais partagées à des tiers.",
      },
      {
        question: "Que se passe-t-il en cas de vol ou dommage ?",
        answer: "Tous nos intervenants sont assurés. En cas d'incident, contactez-nous immédiatement. Notre assurance couvre les dommages matériels jusqu'à 10'000 CHF.",
      },
    ],
  },
];

const contactMethods = [
  {
    icon: Mail01Icon,
    title: "Email",
    description: "Réponse sous 24h",
    value: "contact@Justmaid.ch",
    href: "mailto:contact@Justmaid.ch",
  },
  {
    icon: Call02Icon,
    title: "Téléphone",
    description: "Lun-Ven 9h-18h",
    value: "+41 22 792 67 23",
    href: "tel:+41227926723",
  },
  {
    icon: Location01Icon,
    title: "Adresse",
    description: "Siège social",
    value: "Rte de Mon-Idée, 1226 Thônex",
    href: "https://maps.google.com/?q=Rte+de+Mon-Idée,+1226+Thônex,+Suisse",
  },
];

function AidePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("reservation");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const activeQuestions = categories.find((c) => c.id === activeCategory)?.questions || [];

  const filteredQuestions = searchQuery
    ? categories.flatMap((c) =>
        c.questions
          .filter(
            (q) =>
              q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((q) => ({ ...q, category: c.title }))
      )
    : [];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    alert("Message envoyé ! Nous vous répondrons sous 24h.");
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section 
        className="relative overflow-hidden py-16 sm:py-20"
        style={{ 
          background: 'linear-gradient(135deg, #2FCCC0 0%, #25A89E 100%)' 
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white font-bricolage-grotesque">
            Comment pouvons-nous vous aider ? 💬
          </h1>
          <p className="mt-4 text-xl text-white/90">
            Trouvez rapidement une réponse à vos questions
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                strokeWidth={1.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 z-10"
              />
              <Input
                type="text"
                placeholder="Rechercher une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 rounded-full text-lg border-0 shadow-lg bg-white text-gray-900 placeholder:text-gray-500"
              />
            </div>

            {/* Search Results */}
            {searchQuery && filteredQuestions.length > 0 && (
              <div className="mt-4 bg-white rounded-2xl shadow-xl p-4 text-left max-h-80 overflow-y-auto">
                {filteredQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => {
                      setSearchQuery("");
                      setOpenQuestion(`search-${idx}`);
                    }}
                  >
                    <p className="font-medium text-gray-900">{q.question}</p>
                    <p className="text-sm text-primary">{q.category}</p>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && filteredQuestions.length === 0 && (
              <div className="mt-4 bg-white rounded-2xl shadow-xl p-6 text-center">
                <p className="text-gray-600">Aucun résultat trouvé</p>
                <p className="text-sm text-gray-500 mt-2">
                  Essayez avec d'autres mots-clés ou contactez-nous directement
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-bricolage-grotesque">
              Questions fréquentes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Sélectionnez une catégorie pour voir les questions
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Categories Sidebar */}
            <div className="lg:w-72 shrink-0">
              <div className="bg-gray-50 rounded-2xl p-2 lg:sticky lg:top-24">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all ${
                      activeCategory === category.id
                        ? "bg-white shadow-sm text-primary"
                        : "text-gray-600 hover:bg-white/50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        activeCategory === category.id
                          ? "bg-primary/10"
                          : "bg-gray-200"
                      }`}
                    >
                      <HugeiconsIcon
                        icon={category.icon}
                        strokeWidth={1.5}
                        className={`h-5 w-5 ${
                          activeCategory === category.id ? "text-primary" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{category.title}</p>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="flex-1">
              <div className="space-y-4">
                {activeQuestions.map((item, idx) => {
                  const isOpen = openQuestion === `${activeCategory}-${idx}`;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenQuestion(isOpen ? null : `${activeCategory}-${idx}`)
                        }
                        className="w-full flex items-center justify-between p-6 text-left"
                      >
                        <span className="font-semibold text-gray-900 pr-4">
                          {item.question}
                        </span>
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          strokeWidth={2}
                          className={`h-5 w-5 text-gray-400 shrink-0 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6">
                          <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-bricolage-grotesque">
              Vous n'avez pas trouvé votre réponse ? 🤔
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Notre équipe est là pour vous aider
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Methods */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Nous contacter
              </h3>
              <div className="space-y-4">
                {contactMethods.map((method) => (
                  <a
                    key={method.title}
                    href={method.href}
                    className="flex items-center gap-4 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <HugeiconsIcon
                        icon={method.icon}
                        strokeWidth={1.5}
                        className="h-7 w-7 text-primary"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{method.title}</p>
                      <p className="text-sm text-gray-500">{method.description}</p>
                      <p className="text-primary font-medium">{method.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Envoyer un message
              </h3>
              <form onSubmit={handleContactSubmit} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <Input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, name: e.target.value })
                        }
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, email: e.target.value })
                        }
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet
                    </label>
                    <Input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, subject: e.target.value })
                      }
                      placeholder="De quoi s'agit-il ?"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      placeholder="Décrivez votre demande..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-full h-12">
                    Envoyer le message
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      className="ml-2 h-5 w-5"
                    />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-bricolage-grotesque">
              Liens utiles
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/booking/cleaning"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-Justmaid-turquoise/10 mx-auto mb-4 group-hover:bg-Justmaid-turquoise/20 transition-colors">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  strokeWidth={1.5}
                  className="h-7 w-7 text-Justmaid-turquoise"
                />
              </div>
              <h3 className="font-semibold text-gray-900">Réserver un ménage</h3>
              <p className="text-sm text-gray-500 mt-1">Disponible aujourd'hui</p>
            </Link>

            <Link
              to="/how-it-works"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <HugeiconsIcon
                  icon={Home01Icon}
                  strokeWidth={1.5}
                  className="h-7 w-7 text-primary"
                />
              </div>
              <h3 className="font-semibold text-gray-900">Comment ça marche</h3>
              <p className="text-sm text-gray-500 mt-1">4 étapes simples</p>
            </Link>

            <Link
              to="/services"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <span className="text-2xl">🧹</span>
              </div>
              <h3 className="font-semibold text-gray-900">Nos services</h3>
              <p className="text-sm text-gray-500 mt-1">Ménage, pressing, repassage</p>
            </Link>

            <Link
              to="/auth/login"
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-100 mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <HugeiconsIcon
                  icon={UserIcon}
                  strokeWidth={1.5}
                  className="h-7 w-7 text-purple-600"
                />
              </div>
              <h3 className="font-semibold text-gray-900">Mon espace</h3>
              <p className="text-sm text-gray-500 mt-1">Se connecter</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
