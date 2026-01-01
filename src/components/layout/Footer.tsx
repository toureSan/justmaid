import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: '#2FCCC0' }}>
                <span className="text-lg font-bold text-white">J</span>
              </div>
              <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>justmaid</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Votre partenaire de confiance pour le ménage à domicile et le pressing. 
              Service disponible aujourd'hui.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/booking/cleaning"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Ménage à domicile
                </Link>
              </li>
              <li>
                <Link
                  to="/booking/laundry"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Pressing & Blanchisserie
                </Link>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Repassage
                </span>
              </li>
            </ul>
          </div>

          {/* Entreprise */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Entreprise</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Devenir intervenant
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Légal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} justmaid. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Fait avec ❤️ en Suisse
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

