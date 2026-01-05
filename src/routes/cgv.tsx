import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cgv")({
  component: CGVPage,
});

function CGVPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales de Vente</h1>
          <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : Janvier 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Objet</h2>
              <p className="text-gray-600 leading-relaxed">
                Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre 
                justmaid, société de services de ménage à domicile, et ses clients. En utilisant nos services, 
                vous acceptez ces conditions dans leur intégralité.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Services proposés</h2>
              <p className="text-gray-600 leading-relaxed">
                justmaid propose des services de ménage à domicile, comprenant :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Nettoyage régulier ou ponctuel d'appartements et maisons</li>
                <li>Service de repassage à domicile</li>
                <li>Nettoyage des vitres</li>
                <li>Services de blanchisserie</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Réservation et paiement</h2>
              <p className="text-gray-600 leading-relaxed">
                Les réservations s'effectuent en ligne via notre plateforme. Le paiement est requis lors de la 
                réservation pour confirmer le service. Nous acceptons les cartes bancaires (Visa, Mastercard) 
                ainsi qu'Apple Pay et Google Pay.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                Pour les abonnements, le prélèvement est automatique selon la fréquence choisie (hebdomadaire, 
                bi-hebdomadaire ou mensuel).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Tarifs</h2>
              <p className="text-gray-600 leading-relaxed">
                Les tarifs sont indiqués en Francs Suisses (CHF), toutes taxes comprises. Le tarif horaire 
                de base est de 45 CHF/heure. Des réductions sont appliquées pour les abonnements :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Abonnement : -2 CHF/heure</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                La durée minimale d'intervention est de 3 heures.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Annulation et modification</h2>
              <p className="text-gray-600 leading-relaxed">
                Toute annulation doit être effectuée au moins 24 heures avant l'intervention prévue. 
                En cas d'annulation tardive (moins de 24h), 50% du montant sera facturé. 
                Les modifications de réservation sont possibles sous réserve de disponibilité.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Désabonnement</h2>
              <p className="text-gray-600 leading-relaxed">
                Les abonnements peuvent être résiliés à tout moment depuis votre tableau de bord. 
                La résiliation prend effet à la fin de la période en cours.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Responsabilité</h2>
              <p className="text-gray-600 leading-relaxed">
                justmaid s'engage à fournir des services de qualité. Tous nos intervenants sont vérifiés, 
                formés et assurés. En cas de dommage causé par un intervenant, une assurance responsabilité 
                civile professionnelle couvre les éventuels préjudices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Réclamations</h2>
              <p className="text-gray-600 leading-relaxed">
                Toute réclamation doit être adressée dans les 48 heures suivant l'intervention à 
                contact@justmaid.ch. Nous nous engageons à traiter votre demande dans les meilleurs délais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Droit applicable</h2>
              <p className="text-gray-600 leading-relaxed">
                Les présentes CGV sont soumises au droit suisse. Tout litige sera de la compétence 
                exclusive des tribunaux du canton de Genève.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                Pour toute question concernant ces conditions générales :<br />
                Email : contact@justmaid.ch<br />
                Téléphone : +41 22 792 67 23
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
