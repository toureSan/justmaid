import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mentions-legales")({
  component: MentionsLegalesPage,
});

function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions Légales</h1>
          <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : Janvier 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Éditeur du site</h2>
              <div className="text-gray-600 leading-relaxed space-y-2">
                <p><strong>Raison sociale :</strong> justmaid Sàrl</p>
                <p><strong>Forme juridique :</strong> Société à responsabilité limitée</p>
                <p><strong>Siège social :</strong> Genève, Suisse</p>
                <p><strong>Email :</strong> contact@justmaid.ch</p>
                <p><strong>Téléphone :</strong> +41 22 792 67 23</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Directeur de la publication</h2>
              <p className="text-gray-600 leading-relaxed">
                Le directeur de la publication est le représentant légal de justmaid Sàrl.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Hébergement</h2>
              <div className="text-gray-600 leading-relaxed space-y-2">
                <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                <p><strong>Site web :</strong> vercel.com</p>
              </div>
              <div className="text-gray-600 leading-relaxed space-y-2 mt-4">
                <p><strong>Base de données :</strong> Supabase Inc.</p>
                <p><strong>Site web :</strong> supabase.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Propriété intellectuelle</h2>
              <p className="text-gray-600 leading-relaxed">
                L'ensemble du contenu du site justmaid.ch (textes, images, graphismes, logo, icônes, 
                sons, logiciels) est la propriété exclusive de justmaid Sàrl ou de ses partenaires. 
                Toute reproduction, représentation, modification, publication, transmission ou 
                dénaturation du site ou de son contenu, par quelque procédé que ce soit, est interdite 
                sans l'autorisation préalable écrite de justmaid.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Marques</h2>
              <p className="text-gray-600 leading-relaxed">
                "justmaid" et le logo justmaid sont des marques déposées. Toute utilisation non 
                autorisée de ces marques est interdite et constitue une contrefaçon.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitation de responsabilité</h2>
              <p className="text-gray-600 leading-relaxed">
                justmaid s'efforce d'assurer l'exactitude et la mise à jour des informations 
                diffusées sur ce site. Toutefois, justmaid ne peut garantir l'exactitude, la 
                précision ou l'exhaustivité des informations mises à disposition sur ce site.
              </p>
              <p className="text-gray-600 leading-relaxed mt-2">
                justmaid décline toute responsabilité pour toute imprécision, inexactitude ou 
                omission portant sur des informations disponibles sur ce site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Liens hypertextes</h2>
              <p className="text-gray-600 leading-relaxed">
                Le site justmaid.ch peut contenir des liens hypertextes vers d'autres sites. 
                justmaid n'exerce aucun contrôle sur ces sites et décline toute responsabilité 
                quant à leur contenu ou aux services qu'ils proposent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Droit applicable</h2>
              <p className="text-gray-600 leading-relaxed">
                Les présentes mentions légales sont soumises au droit suisse. En cas de litige, 
                les tribunaux du canton de Genève seront seuls compétents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact</h2>
              <p className="text-gray-600 leading-relaxed">
                Pour toute question concernant ces mentions légales :<br />
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
