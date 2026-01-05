import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  StarIcon,
  Clock01Icon,
  ShieldIcon,
} from "@hugeicons/core-free-icons";
import * as React from "react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-4 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-4 top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    strokeWidth={2}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-secondary-foreground">
                4.9/5 basé sur 200+ avis
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Offrez-vous la sérénité d'un intérieur <span className="text-primary">toujours <span className="whitespace-nowrap">propre et accueillant</span></span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
                Réservez des professionnels du ménage qualifiés en quelques clics. 
                Service disponible 6j/7.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={2}
                  className="h-5 w-5 text-primary"
                />
                <span>Personnel vérifié</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  strokeWidth={2}
                  className="h-5 w-5 text-primary"
                />
                <span>Disponible aujourd'hui</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon
                  icon={ShieldIcon}
                  strokeWidth={2}
                  className="h-5 w-5 text-primary"
                />
                <span>Service assuré</span>
              </div>
            </div>

            {/* Team avatars */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img
                  src="/femme-2-menage.png"
                  alt="Femme de ménage souriante"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="/homme-menage.png"
                  alt="Agent de propreté homme"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="/femme-menage.png"
                  alt="Intervenante ménage"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="/menage-equipe6.png"
                  alt="Agent d'entretien"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">+500</span> intervenants qualifiés 👨‍🔧👩‍🔧
              </p>
            </div>
          </div>

          {/* Right: Quick Booking Card */}
          <div className="animate-fade-in-up delay-200">
            <QuickBookingCard />
          </div>
        </div>
      </div>
    </section>
  );
}

// Villes disponibles par code postal
const AVAILABLE_CITIES: Record<string, { name: string; canton: string; available: boolean }[]> = {
  "1200": [{ name: "Genève", canton: "GE", available: true }],
  "1201": [{ name: "Genève", canton: "GE", available: true }],
  "1202": [{ name: "Genève", canton: "GE", available: true }],
  "1203": [{ name: "Genève", canton: "GE", available: true }],
  "1204": [{ name: "Genève", canton: "GE", available: true }],
  "1205": [{ name: "Genève", canton: "GE", available: true }],
  "1206": [{ name: "Genève", canton: "GE", available: true }],
  "1207": [{ name: "Genève", canton: "GE", available: true }],
  "1208": [{ name: "Genève", canton: "GE", available: true }],
  "1209": [{ name: "Genève", canton: "GE", available: true }],
  "1212": [{ name: "Grand-Lancy", canton: "GE", available: true }],
  "1213": [{ name: "Petit-Lancy", canton: "GE", available: true }],
  "1214": [{ name: "Vernier", canton: "GE", available: true }],
  "1215": [{ name: "Genève Aéroport", canton: "GE", available: true }],
  "1216": [{ name: "Cointrin", canton: "GE", available: true }],
  "1217": [{ name: "Meyrin", canton: "GE", available: true }],
  "1218": [{ name: "Le Grand-Saconnex", canton: "GE", available: true }],
  "1219": [{ name: "Châtelaine", canton: "GE", available: true }],
  "1220": [{ name: "Les Avanchets", canton: "GE", available: true }],
  "1222": [{ name: "Vésenaz", canton: "GE", available: true }],
  "1223": [{ name: "Cologny", canton: "GE", available: true }],
  "1224": [{ name: "Chêne-Bougeries", canton: "GE", available: true }],
  "1225": [{ name: "Chêne-Bourg", canton: "GE", available: true }],
  "1226": [{ name: "Thônex", canton: "GE", available: true }],
  "1227": [{ name: "Carouge", canton: "GE", available: true }],
  "1228": [{ name: "Plan-les-Ouates", canton: "GE", available: true }],
  "1231": [{ name: "Conches", canton: "GE", available: true }],
  "1232": [{ name: "Confignon", canton: "GE", available: true }],
  "1233": [{ name: "Bernex", canton: "GE", available: true }],
  "1234": [{ name: "Vessy", canton: "GE", available: true }],
  "1236": [{ name: "Cartigny", canton: "GE", available: true }],
  "1237": [{ name: "Avully", canton: "GE", available: true }],
  "1239": [{ name: "Collex-Bossy", canton: "GE", available: true }],
  "1241": [{ name: "Puplinge", canton: "GE", available: true }],
  "1242": [{ name: "Satigny", canton: "GE", available: true }],
  "1243": [{ name: "Presinge", canton: "GE", available: true }],
  "1244": [{ name: "Choulex", canton: "GE", available: true }],
  "1245": [{ name: "Collonge-Bellerive", canton: "GE", available: true }],
  "1246": [{ name: "Corsier", canton: "GE", available: true }],
  "1247": [{ name: "Anières", canton: "GE", available: true }],
  "1248": [{ name: "Hermance", canton: "GE", available: true }],
  "1260": [{ name: "Nyon", canton: "VD", available: true }],
  "1261": [{ name: "Longirod", canton: "VD", available: true }],
  "1262": [{ name: "Eysins", canton: "VD", available: true }],
  "1263": [{ name: "Crassier", canton: "VD", available: true }],
  "1264": [{ name: "St-Cergue", canton: "VD", available: true }],
  "1266": [{ name: "Duillier", canton: "VD", available: true }],
  "1267": [{ name: "Coinsins", canton: "VD", available: true }],
  "1268": [{ name: "Begnins", canton: "VD", available: true }],
  "1269": [{ name: "Bassins", canton: "VD", available: true }],
  "1270": [{ name: "Trélex", canton: "VD", available: true }],
  "1271": [{ name: "Givrins", canton: "VD", available: true }],
  "1272": [{ name: "Genolier", canton: "VD", available: true }],
  "1273": [{ name: "Arzier-Le Muids", canton: "VD", available: true }],
  "1274": [{ name: "Grens", canton: "VD", available: true }],
  "1275": [{ name: "Chéserex", canton: "VD", available: true }],
  "1276": [{ name: "Gingins", canton: "VD", available: true }],
  "1277": [{ name: "Borex", canton: "VD", available: true }],
  "1278": [{ name: "La Rippe", canton: "VD", available: true }],
  "1279": [{ name: "Chavannes-de-Bogis", canton: "VD", available: true }],
  "1290": [{ name: "Versoix", canton: "GE", available: true }],
  // Villes bientôt disponibles
  "1000": [{ name: "Lausanne", canton: "VD", available: false }],
  "1003": [{ name: "Lausanne", canton: "VD", available: false }],
  "1004": [{ name: "Lausanne", canton: "VD", available: false }],
  "1005": [{ name: "Lausanne", canton: "VD", available: false }],
  "1006": [{ name: "Lausanne", canton: "VD", available: false }],
  "1007": [{ name: "Lausanne", canton: "VD", available: false }],
  "1010": [{ name: "Lausanne", canton: "VD", available: false }],
  "1012": [{ name: "Lausanne", canton: "VD", available: false }],
  "1018": [{ name: "Lausanne", canton: "VD", available: false }],
  "1820": [{ name: "Montreux", canton: "VD", available: false }],
  "1800": [{ name: "Vevey", canton: "VD", available: false }],
  "2000": [{ name: "Neuchâtel", canton: "NE", available: false }],
  "1950": [{ name: "Sion", canton: "VS", available: false }],
};

function QuickBookingCard() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    address: "",
    homeType: "apartment",
    duration: "3",
    coords: null as { lat: number; lng: number } | null,
    postalCode: "",
    city: "",
  });
  const [matchedCities, setMatchedCities] = React.useState<{ name: string; canton: string; available: boolean }[]>([]);

  // Rechercher les villes par code postal
  React.useEffect(() => {
    if (formData.postalCode.length === 4) {
      const cities = AVAILABLE_CITIES[formData.postalCode];
      if (cities) {
        setMatchedCities(cities);
        // Si une seule ville, la sélectionner automatiquement
        if (cities.length === 1) {
          setFormData(prev => ({ ...prev, city: cities[0].name }));
        }
      } else {
        setMatchedCities([]);
        setFormData(prev => ({ ...prev, city: "" }));
      }
    } else {
      setMatchedCities([]);
      setFormData(prev => ({ ...prev, city: "" }));
    }
  }, [formData.postalCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier que la ville est disponible
    const selectedCity = matchedCities.find(c => c.name === formData.city);
    if (!selectedCity?.available) {
      return;
    }
    
    const bookingDraft = {
      address: `${formData.city}, Suisse`,
      homeType: formData.homeType,
      duration: formData.duration,
      coords: formData.coords,
      postalCode: formData.postalCode,
      city: formData.city,
      fromHome: true,
    };
    localStorage.setItem("bookingDraft", JSON.stringify(bookingDraft));
    navigate({ to: "/booking/cleaning" });
  };
  
  // Vérifier si on peut soumettre le formulaire
  const canSubmit = formData.postalCode.length === 4 && 
    formData.city && 
    matchedCities.some(c => c.name === formData.city && c.available);

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl" />
      
      <div className="relative rounded-2xl border border-border/50 bg-card p-4 shadow-2xl sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Header with image */}
          <div className="flex items-start gap-4">
            <img
              src="/femme-2-menage.png"
              alt="Femme de ménage disponible"
              className="h-14 w-14 rounded-full object-cover ring-2 ring-primary"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                Réservez votre ménage
              </h2>
              <p className="text-sm text-muted-foreground">
                Intervenants disponibles aujourd'hui
              </p>
            </div>
          </div>

          {/* Service tabs */}
          <div className="flex gap-2">
            <button type="button" className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-xs sm:text-sm font-medium text-primary-foreground transition-all sm:px-4 sm:py-3">
              🧹 Ménage
            </button>
            <button type="button" className="relative flex-1 rounded-lg bg-muted px-3 py-2.5 text-xs sm:text-sm font-medium text-muted-foreground transition-all hover:bg-muted/80 sm:px-4 sm:py-3">
              👔 Pressing
              <Badge
                variant="secondary"
                className="absolute -right-1 -top-1 border border-primary/20 bg-secondary text-[10px] sm:text-xs sm:-right-2 sm:-top-2"
              >
                Bientôt
              </Badge>
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {/* Postal code search */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Code postal
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🇨🇭</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="1200"
                  value={formData.postalCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setFormData({ ...formData, postalCode: value });
                  }}
                  className="w-full rounded-lg border border-input bg-background py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              
              {/* City selection based on postal code */}
              {matchedCities.length > 0 && (
                <div className="space-y-2">
                  {matchedCities.map((city, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData({ ...formData, city: city.name })}
                      className={`flex w-full items-center justify-between rounded-lg border-2 p-3 transition-all ${
                        formData.city === city.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>🏠</span>
                        <span className="font-medium">{city.name}</span>
                        <span className="text-xs text-muted-foreground">({city.canton})</span>
                      </div>
                      {city.available ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                          Disponible
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          ⏳ Bientôt
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Not available message */}
              {formData.postalCode.length === 4 && matchedCities.length === 0 && (
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                  <p className="font-medium">🔔 Zone non couverte</p>
                  <p className="text-xs mt-1">Nous arrivons bientôt ! Laissez votre email pour être notifié.</p>
                </div>
              )}

              {/* Available zones hint */}
              {formData.postalCode.length < 4 && (
                <p className="text-xs text-muted-foreground">
                  📍 Disponible à <strong>Genève</strong> et <strong>Nyon</strong> • Bientôt d'autres villes
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Type de logement
              </label>
              <select 
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none"
                value={formData.homeType}
                onChange={(e) => setFormData({ ...formData, homeType: e.target.value })}
              >
                <option value="apartment">Appartement</option>
                <option value="house">Maison</option>
                <option value="studio">Studio</option>
              </select>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-full py-6 text-base font-semibold"
              disabled={!canSubmit}
            >
              Continuer la réservation →
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 border-t border-border/50 pt-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <HugeiconsIcon icon={ShieldIcon} strokeWidth={2} className="h-4 w-4" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-4 w-4" />
              <span>Annulation gratuite</span>
            </div>
          </div>

          {/* Social proof */}
          <div className="rounded-xl bg-gradient-to-r from-justmaid-turquoise/10 to-primary/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatars */}
                <div className="flex -space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=40&h=40&fit=crop&crop=face"
                    alt="Client"
                    className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=40&h=40&fit=crop&crop=face"
                    alt="Client"
                    className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=40&h=40&fit=crop&crop=face"
                    alt="Client"
                    className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                  />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-justmaid-turquoise text-xs font-bold text-white shadow-sm">
                    +200
                  </div>
                </div>
                {/* Text */}
                <div>
                  <p className="text-sm font-semibold text-foreground">Clients satisfaits</p>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">★★★★★</span>
                    <span className="text-xs text-muted-foreground">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Cities */}
            <div className="flex flex-wrap items-center gap-2 pt-3 mt-2 border-t border-gray-300">
              <span className="text-sm text-muted-foreground">📍 Disponible à</span>
              <span className="bg-white px-2 py-0.5 rounded-full text-sm font-semibold text-foreground shadow-sm">Genève</span>
              <span className="bg-white px-2 py-0.5 rounded-full text-sm font-semibold text-foreground shadow-sm">Nyon</span>
              <span className="text-sm text-justmaid-turquoise font-medium">+ bientôt d'autres villes</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
