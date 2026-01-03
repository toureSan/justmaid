import * as React from "react";

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export function LoadingScreen({ 
  message = "Chargement en cours...", 
  subMessage 
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        {/* Logo animé */}
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-justmaid-turquoise text-white animate-pulse">
            <span className="text-4xl font-bold font-bricolage-grotesque">J</span>
          </div>
          {/* Cercle de chargement autour du logo */}
          <div className="absolute -inset-2">
            <svg className="h-24 w-24 animate-spin" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#2FCCC0"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="70 200"
                className="opacity-30"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#2FCCC0"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="70 200"
                style={{
                  transformOrigin: "center",
                  animation: "spin 1.5s linear infinite",
                }}
              />
            </svg>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-900">{message}</p>
          {subMessage && (
            <p className="text-sm text-gray-500">{subMessage}</p>
          )}
        </div>

        {/* Dots animés */}
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-justmaid-turquoise animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-2.5 w-2.5 rounded-full bg-justmaid-turquoise animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-2.5 w-2.5 rounded-full bg-justmaid-turquoise animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// Overlay de chargement pour les actions (moins intrusif)
export function LoadingOverlay({ 
  message = "Traitement en cours..." 
}: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-justmaid-turquoise border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}

// Hook et Context pour gérer le loading global
interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  subMessage?: string;
  showLoading: (message?: string, subMessage?: string) => void;
  hideLoading: () => void;
  showOverlay: (message?: string) => void;
  hideOverlay: () => void;
  isOverlayVisible: boolean;
  overlayMessage: string;
}

const LoadingContext = React.createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState("Chargement en cours...");
  const [subMessage, setSubMessage] = React.useState<string | undefined>();
  const [isOverlayVisible, setIsOverlayVisible] = React.useState(false);
  const [overlayMessage, setOverlayMessage] = React.useState("Traitement en cours...");

  const showLoading = React.useCallback((message?: string, sub?: string) => {
    setLoadingMessage(message || "Chargement en cours...");
    setSubMessage(sub);
    setIsLoading(true);
  }, []);

  const hideLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const showOverlay = React.useCallback((message?: string) => {
    setOverlayMessage(message || "Traitement en cours...");
    setIsOverlayVisible(true);
  }, []);

  const hideOverlay = React.useCallback(() => {
    setIsOverlayVisible(false);
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        subMessage,
        showLoading,
        hideLoading,
        showOverlay,
        hideOverlay,
        isOverlayVisible,
        overlayMessage,
      }}
    >
      {children}
      {isLoading && <LoadingScreen message={loadingMessage} subMessage={subMessage} />}
      {isOverlayVisible && <LoadingOverlay message={overlayMessage} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
