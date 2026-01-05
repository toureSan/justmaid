import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-muted/30">
      {/* Main Footer Content */}
      <div className="border-t border-border/40">
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
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-base">📍</span>
                <span>Rte de Mon-Idée<br />1226 Thônex, Suisse</span>
              </div>
              <a href="tel:+41227926723" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-base">📞</span>
                <span>022 792 67 23</span>
              </a>
              
              {/* Social Media */}
              <div className="flex items-center gap-3 pt-2">
                <a 
                  href="https://facebook.com/justmaid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com/justmaid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://linkedin.com/company/justmaid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-[#0077B5] hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="https://tiktok.com/@justmaid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted hover:bg-black hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
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
                    to="/a-propos"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    À propos
                  </Link>
                </li>
                <li>
                  <Link
                    to="/devenir-intervenant"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Devenir intervenant
                  </Link>
                </li>
                <li>
                  <Link
                    to="/aide"
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
                    to="/cgv"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Conditions générales
                  </Link>
                </li>
                <li>
                  <Link
                    to="/confidentialite"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link
                    to="/mentions-legales"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Payment Section */}
      <div className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Reviews */}
            <div className="text-center md:text-left">
              <p className="text-sm text-white/80 mb-4">Donnez votre avis</p>
              <div className="flex items-center justify-center md:justify-start gap-8">
                {/* Google */}
                <a 
                  href="https://g.page/r/justmaid/review" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <svg className="h-8" viewBox="0 0 272 92" fill="white">
                    <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                    <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/>
                    <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/>
                    <path d="M225 3v65h-9.5V3h9.5z"/>
                    <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/>
                    <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="text-center md:text-right">
              <p className="text-sm text-white/80 mb-4">Moyens de paiement</p>
              <div className="flex items-center justify-center md:justify-end gap-3">
                {/* Visa */}
                <div className="flex h-10 w-14 items-center justify-center rounded-md bg-white p-1.5">
                  <svg viewBox="0 0 48 48" className="h-full w-full">
                    <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
                    <path fill="#FFF" d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.674 1.991.674l.466-2.309c0 0-1.358-.515-2.691-.515-3.019 0-4.576 1.444-4.576 3.272 0 3.306 3.979 2.853 3.979 4.551 0 .291-.231.964-1.888.964-1.662 0-2.759-.609-2.759-.609l-.495 2.216c0 0 1.063.606 3.117.606 2.059 0 4.915-1.54 4.915-3.752C30.354 23.586 26.369 23.394 26.369 22.206z"/>
                    <path fill="#FFC107" d="M12.212,24.945l-0.966-4.748c0,0-0.437-1.029-1.573-1.029c-1.136,0-4.44,0-4.44,0S10.894,20.84,12.212,24.945z"/>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="flex h-10 w-14 items-center justify-center rounded-md bg-white p-1.5">
                  <svg viewBox="0 0 48 48" className="h-full w-full">
                    <path fill="#3F51B5" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
                    <path fill="#FFC107" d="M30 14A10 10 0 1 0 30 34A10 10 0 1 0 30 14Z"/>
                    <path fill="#FF3D00" d="M22.014,30c-0.464-0.617-0.863-1.284-1.176-2h6.325c0.278-0.636,0.496-1.304,0.637-2h-7.598c-0.131-0.654-0.209-1.324-0.209-2s0.078-1.346,0.209-2h7.598c-0.14-0.696-0.359-1.364-0.637-2h-6.325c0.313-0.716,0.713-1.383,1.176-2h3.971c-0.529-0.793-1.162-1.513-1.874-2h-0.223c-0.502,0-0.977,0.096-1.42,0.262C21.192,16.096,20,18.097,20,20.381v0.002h0c0,0.004,0,0.007,0,0.011v7.213c0,0.004,0,0.007,0,0.011h0v0.002c0,2.284,1.192,4.284,2.869,5.119C23.312,32.904,23.787,33,24.288,33h0.223c0.712-0.487,1.346-1.207,1.874-2H22.014z"/>
                    <path fill="#FF3D00" d="M18 14A10 10 0 1 0 18 34A10 10 0 1 0 18 14Z"/>
                  </svg>
                </div>
                {/* American Express */}
                <div className="flex h-10 w-14 items-center justify-center rounded-md bg-[#016FD0] p-1.5">
                  <span className="text-[8px] font-bold text-white leading-none text-center">AMERICAN<br/>EXPRESS</span>
                </div>
                {/* TWINT - Bientôt disponible */}
                <div className="relative">
                  <div className="flex h-10 w-14 items-center justify-center rounded-md bg-black p-1.5 opacity-50">
                    <svg viewBox="0 0 80 32" className="h-full w-full" fill="white">
                      <path d="M13.5 8.5h-3v15h3v-15zM25.8 8.5l-3.8 10.5-3.8-10.5h-3.3l5.3 15h3.6l5.3-15h-3.3zM32.5 8.5h3v15h-3v-15zM51.8 8.5h-3v8.3l-6.3-8.3h-2.7v15h3v-8.7l6.5 8.7h2.5v-15zM66.5 8.5h-10v3h3.5v12h3v-12h3.5v-3z"/>
                    </svg>
                  </div>
                  <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[6px] font-bold px-1 py-0.5 rounded">
                    Bientôt
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-primary/90 text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-white/80">
              © {new Date().getFullYear()} justmaid. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">
                Fait avec ❤️ en Suisse 🇨🇭
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
