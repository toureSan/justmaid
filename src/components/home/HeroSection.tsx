import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  StarIcon,
  Clock01Icon,
  ShieldIcon,
  SearchIcon,
  PinLocation01Icon,
} from "@hugeicons/core-free-icons";
import * as React from "react";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

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
                4.9/5 basé sur 2 500+ avis
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                                                                 Hommes et femmes de ménage de confiance, 
                                                                 <span className="text-primary"> notés par les clients</span> 🇨🇭
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
                Réservez des professionnel du ménage qualifiée en quelques clics. 
                Service disponible dans la 24h/7.
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
                  src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face"
                  alt="Femme de ménage souriante"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face"
                  alt="Agent de propreté homme"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face"
                  alt="Intervenante ménage"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face"
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

function QuickBookingCard() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    address: "",
    homeType: "apartment",
    duration: "3",
    coords: null as { lat: number; lng: number } | null,
  });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGeolocating, setIsGeolocating] = React.useState(false);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Search for addresses using Nominatim
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&addressdetails=1&limit=5`,
        { headers: { "Accept-Language": "fr" } }
      );
      const data: SearchResult[] = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error searching address:", error);
    }
    setIsLoading(false);
  };

  // Reverse geocoding
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { "Accept-Language": "fr" } }
      );
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return null;
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(query), 300);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: SearchResult) => {
    setFormData({
      ...formData,
      address: suggestion.display_name,
      coords: { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) },
    });
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
  };

  // Handle geolocation
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocode(latitude, longitude);
        if (address) {
          setFormData({
            ...formData,
            address,
            coords: { lat: latitude, lng: longitude },
          });
          setSearchQuery(address);
        }
        setIsGeolocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Impossible d'obtenir votre position");
        setIsGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingDraft = {
      address: formData.address,
      homeType: formData.homeType,
      duration: formData.duration,
      coords: formData.coords,
      fromHome: true,
    };
    localStorage.setItem("bookingDraft", JSON.stringify(bookingDraft));
    navigate({ to: "/booking/cleaning" });
  };

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl" />
      
      <div className="relative rounded-2xl border border-border/50 bg-card p-4 shadow-2xl sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Header with image */}
          <div className="flex items-start gap-4">
            <img
              src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=80&h=80&fit=crop&crop=face"
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
            {/* Address search with geolocation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Votre adresse
              </label>
              <div className="relative">
                <div className="relative">
                  <HugeiconsIcon
                    icon={SearchIcon}
                    strokeWidth={2}
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Rechercher votre adresse..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  {isLoading ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGeolocation}
                      disabled={isGeolocating}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                      title="Me localiser"
                    >
                      {isGeolocating ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <HugeiconsIcon icon={PinLocation01Icon} strokeWidth={2} className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground mt-0.5">📍</span>
                          <span className="line-clamp-2">{suggestion.display_name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Address selected indicator */}
              {formData.address && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="h-4 w-4" />
                  <span className="line-clamp-1">{formData.address}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Durée
                </label>
                <select 
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                >
                  <option value="2">2 heures</option>
                  <option value="3">3 heures</option>
                  <option value="4">4 heures</option>
                  <option value="5">5 heures</option>
                </select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-full py-6 text-base font-semibold"
              disabled={!formData.address}
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
