import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  CheckmarkCircle02Icon, 
  Calendar03Icon,
  Dollar02Icon,
  UserGroupIcon,
  Clock01Icon,
  SecurityCheckIcon,
  Rocket01Icon,
  Mail01Icon,
  SmartPhone01Icon,
  Location01Icon
} from "@hugeicons/core-free-icons";
import * as React from "react";

export const Route = createFileRoute("/devenir-intervenant")({
  component: DevenirIntervenantPage,
});

function DevenirIntervenantPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simuler l'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/80 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Rejoignez l'équipe justmaid
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Devenez intervenant(e) et travaillez en toute flexibilité. 
                Choisissez vos horaires, vos clients et développez votre activité.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <HugeiconsIcon icon={Dollar02Icon} strokeWidth={2} className="h-5 w-5" />
                  <span>Jusqu'à 25 CHF/h net</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="h-5 w-5" />
                  <span>Horaires flexibles</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="/femme-menage.png" 
                alt="Devenir intervenant justmaid" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Avantages */}
      <div className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Les avantages de travailler avec justmaid
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Dollar02Icon,
                title: "Rémunération attractive",
                description: "Gagnez jusqu'à 25 CHF/h net. Paiement régulier et garanti chaque mois."
              },
              {
                icon: Calendar03Icon,
                title: "Flexibilité totale",
                description: "Choisissez vos jours et horaires de travail. Travaillez quand vous le souhaitez."
              },
              {
                icon: Location01Icon,
                title: "Missions près de chez vous",
                description: "Nous vous proposons des clients dans votre zone géographique."
              },
              {
                icon: UserGroupIcon,
                title: "Clients réguliers",
                description: "Construisez votre clientèle fidèle avec les mêmes familles chaque semaine."
              },
              {
                icon: SecurityCheckIcon,
                title: "Couverture assurance",
                description: "Vous êtes couvert(e) par notre assurance responsabilité civile professionnelle."
              },
              {
                icon: Clock01Icon,
                title: "Support 6j/7",
                description: "Notre équipe est là pour vous accompagner et répondre à vos questions."
              },
            ].map((advantage, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <HugeiconsIcon icon={advantage.icon} strokeWidth={1.5} className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{advantage.title}</h3>
                <p className="text-gray-600 text-sm">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment ça marche */}
      <div className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Comment rejoindre justmaid ?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Candidatez", description: "Remplissez le formulaire ci-dessous avec vos informations" },
              { step: "2", title: "Entretien", description: "Nous vous contactons pour un entretien téléphonique" },
              { step: "3", title: "Vérification", description: "Vérification de vos références et documents" },
              { step: "4", title: "Démarrez", description: "Recevez vos premières missions et commencez à travailler" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critères */}
      <div className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Profil recherché
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="grid gap-4">
              {[
                "Expérience en ménage/nettoyage (professionnel ou personnel)",
                "Permis de travail valide en Suisse (B, C, L ou nationalité suisse/UE)",
                "Fiabilité et ponctualité",
                "Souci du détail et sens du service",
                "Bonne condition physique",
                "Maîtrise du français (oral)",
                "Disponibilité minimum 10h/semaine",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="py-16 bg-gray-50" id="candidature">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Postuler maintenant
            </h2>

            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-4">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Candidature envoyée !</h3>
                <p className="text-gray-600">
                  Merci pour votre candidature. Notre équipe vous contactera dans les 48h.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input id="firstName" name="firstName" required placeholder="Votre prénom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" name="lastName" required placeholder="Votre nom" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="email" name="email" type="email" required placeholder="votre@email.com" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <div className="relative">
                    <HugeiconsIcon icon={SmartPhone01Icon} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="phone" name="phone" type="tel" required placeholder="+41 79 123 45 67" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <div className="relative">
                    <HugeiconsIcon icon={Location01Icon} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="city" name="city" required placeholder="Ex: Genève, Nyon, Lausanne..." className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Expérience en ménage *</Label>
                  <select 
                    id="experience" 
                    name="experience" 
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="none">Aucune expérience professionnelle</option>
                    <option value="1-2">1-2 ans d'expérience</option>
                    <option value="3-5">3-5 ans d'expérience</option>
                    <option value="5+">Plus de 5 ans d'expérience</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permit">Type de permis de travail *</Label>
                  <select 
                    id="permit" 
                    name="permit" 
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="swiss">Nationalité suisse</option>
                    <option value="eu">Nationalité UE/AELE</option>
                    <option value="b">Permis B</option>
                    <option value="c">Permis C</option>
                    <option value="l">Permis L</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Disponibilités *</Label>
                  <Textarea 
                    id="availability" 
                    name="availability" 
                    required
                    placeholder="Ex: Lundi au vendredi, 8h-17h, environ 20h/semaine..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation">Pourquoi souhaitez-vous rejoindre justmaid ?</Label>
                  <Textarea 
                    id="motivation" 
                    name="motivation"
                    placeholder="Parlez-nous de vous et de vos motivations..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full rounded-full py-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} className="mr-2 h-5 w-5" />
                      Envoyer ma candidature
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  En soumettant ce formulaire, vous acceptez notre{" "}
                  <a href="/confidentialite" className="text-primary hover:underline">politique de confidentialité</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            Des questions ? Contactez notre équipe recrutement à{" "}
            <a href="mailto:contact@justmaid.ch" className="text-primary font-medium hover:underline">
              contact@justmaid.ch
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
