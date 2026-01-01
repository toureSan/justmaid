import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchIcon, PinLocation01Icon } from "@hugeicons/core-free-icons";

interface AddressSearchProps {
  value: string;
  onChange: (address: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

// Lazy-loaded Map component (client-only)
const MapComponent = React.lazy(() => import("./MapComponent"));

export function AddressSearch({ value, onChange, placeholder = "Entrez votre adresse..." }: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState(value);
  const [suggestions, setSuggestions] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isGeolocating, setIsGeolocating] = React.useState(false);
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [isClient, setIsClient] = React.useState(false);
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Check if we're on client
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Search for addresses using Nominatim (OpenStreetMap)
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=fr&addressdetails=1&limit=5`,
        {
          headers: {
            "Accept-Language": "fr",
          },
        }
      );
      const data: SearchResult[] = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error searching address:", error);
      setSuggestions([]);
    }
    setIsLoading(false);
  };

  // Reverse geocoding
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "fr",
          },
        }
      );
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return null;
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(query);
    }, 300);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: SearchResult) => {
    const address = suggestion.display_name;
    const newCoords = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    
    setSearchQuery(address);
    setCoords(newCoords);
    setSuggestions([]);
    onChange(address, newCoords);
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
        const newCoords = { lat: latitude, lng: longitude };
        setCoords(newCoords);

        // Reverse geocode to get address
        const address = await reverseGeocode(latitude, longitude);
        if (address) {
          setSearchQuery(address);
          onChange(address, newCoords);
        }
        setIsGeolocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Impossible d'obtenir votre position. Veuillez vérifier vos paramètres de localisation.");
        setIsGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    const newCoords = { lat, lng };
    setCoords(newCoords);

    const address = await reverseGeocode(lat, lng);
    if (address) {
      setSearchQuery(address);
      onChange(address, newCoords);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={2}
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/20"
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

      {/* Map - only render on client when coords available */}
      {isClient && coords && (
        <React.Suspense 
          fallback={
            <div className="flex h-[250px] items-center justify-center rounded-xl border border-border bg-muted/50">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">Chargement de la carte...</span>
              </div>
            </div>
          }
        >
          <MapComponent 
            key="address-map"
            coords={coords} 
            onMapClick={handleMapClick}
          />
        </React.Suspense>
      )}
    </div>
  );
}
