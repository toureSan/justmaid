"use client";

import * as React from "react";

interface MapComponentProps {
  coords: { lat: number; lng: number };
  onMapClick: (lat: number, lng: number) => void;
}

export default function MapComponent({ coords, onMapClick }: MapComponentProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerInstanceRef = React.useRef<any>(null);
  const leafletRef = React.useRef<any>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const isInitializedRef = React.useRef(false);

  // Initialize map
  React.useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (isInitializedRef.current || !mapContainerRef.current) return;

      try {
        const L = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        
        if (!isMounted || !mapContainerRef.current) return;

        leafletRef.current = L;

        // Fix for default marker icon
        const defaultIcon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Create map
        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lng],
          zoom: 16,
          scrollWheelZoom: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const marker = L.marker([coords.lat, coords.lng], { icon: defaultIcon }).addTo(map);

        mapInstanceRef.current = map;
        markerInstanceRef.current = marker;
        isInitializedRef.current = true;

        // Handle map click
        map.on("click", (e: any) => {
          if (isMounted) {
            onMapClick(e.latlng.lat, e.latlng.lng);
          }
        });

        if (isMounted) {
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initMap();

    // Cleanup
    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []); // Only run once on mount

  // Update marker position when coords change
  React.useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current && isLoaded) {
      try {
        mapInstanceRef.current.setView([coords.lat, coords.lng], 16);
        markerInstanceRef.current.setLatLng([coords.lat, coords.lng]);
      } catch (e) {
        // Ignore update errors
      }
    }
  }, [coords.lat, coords.lng, isLoaded]);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div 
        ref={mapContainerRef}
        className="h-[250px] w-full"
        style={{ minHeight: "250px" }}
      />
      {!isLoaded && (
        <div className="flex h-[250px] items-center justify-center bg-muted/50">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Chargement...</span>
          </div>
        </div>
      )}
      <div className="bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
        💡 Cliquez sur la carte pour ajuster la position
      </div>
    </div>
  );
}
