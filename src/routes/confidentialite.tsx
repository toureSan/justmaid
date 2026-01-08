import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/confidentialite")({
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>
          <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : Janvier 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Justmaid s'engage à protéger la vie privée de ses utilisateurs. Cette politique de 
                confidentialité explique comment nous collectons, utilisons et protégeons vos données 
                personnelles conformément à la Loi fédérale sur la protection des données (LPD) et 
                au Règlement Général sur la Protection des Données (RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Données collectées</h2>
              <p className="text-gray-600 leading-relaxed">
                Nous collectons les données suivantes :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li><strong>Données d'identification :</strong> nom, prénom, email, téléphone</li>
                <li><strong>Données d'adresse :</strong> adresse postale pour les interventions</li>
                <li><strong>Données de paiement :</strong> traitées de manière sécurisée via Stripe</li>
                <li><strong>Données de navigation :</strong> cookies, adresse IP, type de navigateur</li>
                <li><strong>Historique des services :</strong> réservations, préférences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Finalités du traitement</h2>
              <p className="text-gray-600 leading-relaxed">
                Vos données sont utilisées pour :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Fournir et gérer nos services de ménage</li>
                <li>Traiter vos paiements de manière sécurisée</li>
                <li>Vous contacter concernant vos réservations</li>
                <li>Améliorer nos services et votre expérience utilisateur</li>
                <li>Vous envoyer des communications marketing (avec votre consentement)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Base légale</h2>
              <p className="text-gray-600 leading-relaxed">
                Le traitement de vos données repose sur :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>L'exécution du contrat de service</li>
                <li>Votre consentement (pour le marketing)</li>
                <li>Nos intérêts légitimes (amélioration des services)</li>
                <li>Nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Partage des données</h2>
              <p className="text-gray-600 leading-relaxed">
                Vos données peuvent être partagées avec :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Nos intervenants (nom, adresse, instructions)</li>
                <li>Stripe (traitement des paiements)</li>
                <li>Supabase (hébergement sécurisé des données)</li>
                <li>Nos prestataires techniques (hébergement, emails)</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                Nous ne vendons jamais vos données personnelles à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Durée de conservation</h2>
              <p className="text-gray-600 leading-relaxed">
                Vos données sont conservées pendant la durée de votre relation avec Justmaid, puis :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Données de compte : 3 ans après la dernière activité</li>
                <li>Données de facturation : 10 ans (obligation légale)</li>
                <li>Données de navigation : 13 mois maximum</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Vos droits</h2>
              <p className="text-gray-600 leading-relaxed">
                Conformément à la LPD et au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li><strong>Accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong>Opposition :</strong> vous opposer au traitement marketing</li>
                <li><strong>Limitation :</strong> limiter le traitement de vos données</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-2">
                Pour exercer ces droits, contactez-nous à contact@Justmaid.ch
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Sécurité</h2>
              <p className="text-gray-600 leading-relaxed">
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Chiffrement SSL/TLS pour toutes les communications</li>
                <li>Authentification sécurisée</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Hébergement sur des serveurs sécurisés en Europe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                Notre site utilise des cookies pour améliorer votre expérience. Vous pouvez gérer 
                vos préférences de cookies dans les paramètres de votre navigateur. Les cookies 
                essentiels au fonctionnement du site ne peuvent pas être désactivés.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                Pour toute question concernant cette politique :<br />
                Email : contact@Justmaid.ch<br />
                Téléphone : +41 22 792 67 23<br /><br />
                Vous pouvez également déposer une plainte auprès du Préposé fédéral à la 
                protection des données et à la transparence (PFPDT).
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
