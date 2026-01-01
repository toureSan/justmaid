import { useEffect, useState, useCallback } from "react";

const conversation = [
  {
    type: "user",
    message: "Bonjour ! J'aurais besoin d'un ménage complet pour mon appartement de 3 pièces à Genève. C'est possible demain ?",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    type: "assistant",
    message: "Bien sûr ! J'ai trouvé 3 intervenantes disponibles demain à Genève. Marie peut venir à 9h ou 14h. Elle a une note de 4.9/5 et est spécialisée dans les appartements. Souhaitez-vous que je réserve ?",
  },
  {
    type: "user",
    message: "Parfait ! Je prends le créneau de 9h avec Marie 👍",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    type: "assistant", 
    message: "C'est noté ! ✅ Votre réservation est confirmée pour demain à 9h. Marie arrivera avec tout le matériel nécessaire. Vous recevrez un SMS de rappel 1h avant. Bonne journée !",
  },
];

export function ChatSection() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [displayedTexts, setDisplayedTexts] = useState<string[]>(["", "", "", ""]);
  const [isTyping, setIsTyping] = useState(false);
  const [key, setKey] = useState(0);

  const resetAnimation = useCallback(() => {
    setVisibleMessages(0);
    setDisplayedTexts(["", "", "", ""]);
    setIsTyping(false);
    setKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (visibleMessages < conversation.length) {
      // Délais plus longs entre les messages
      const delay = visibleMessages === 0 ? 1500 : 2500;
      
      const timer = setTimeout(() => {
        const currentIndex = visibleMessages;
        setVisibleMessages(currentIndex + 1);
        
        if (conversation[currentIndex].type === "assistant") {
          setIsTyping(true);
          const fullText = conversation[currentIndex].message;
          let charIndex = 0;
          // Vitesse de frappe plus lente (40ms au lieu de 20ms)
          const typingInterval = setInterval(() => {
            if (charIndex <= fullText.length) {
              setDisplayedTexts(prev => {
                const newTexts = [...prev];
                newTexts[currentIndex] = fullText.slice(0, charIndex);
                return newTexts;
              });
              charIndex++;
            } else {
              clearInterval(typingInterval);
              setIsTyping(false);
            }
          }, 40);
          return () => clearInterval(typingInterval);
        } else {
          setDisplayedTexts(prev => {
            const newTexts = [...prev];
            newTexts[currentIndex] = conversation[currentIndex].message;
            return newTexts;
          });
        }
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // 10 secondes pour lire avant de recommencer
      const resetTimer = setTimeout(() => {
        resetAnimation();
      }, 10000);
      return () => clearTimeout(resetTimer);
    }
  }, [visibleMessages, resetAnimation]);

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-justmaid-turquoise/10 text-justmaid-turquoise text-sm font-medium mb-4">
            💬 Conversation en direct
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-bricolage-grotesque">
            Réservez aussi simplement qu'un message
          </h2>
        </div>

        {/* Chat Demo */}
        <div className="relative" key={key}>
          <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl border border-gray-200">
            <div className="space-y-5">
              {/* Message 1 - User */}
              {visibleMessages >= 1 && (
                <div className="flex justify-end gap-3 animate-slide-in-right">
                  <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-sm">
                    <p className="text-white text-sm sm:text-base leading-relaxed">
                      {displayedTexts[0]}
                    </p>
                  </div>
                  <img
                    src={conversation[0].avatar}
                    alt="Client"
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-gray-100"
                  />
                </div>
              )}

              {/* Message 2 - Assistant */}
              {visibleMessages >= 2 && (
                <div className="flex gap-3 animate-slide-in-left">
                  <div className="w-9 h-9 rounded-full bg-justmaid-turquoise flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white font-bold">J</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                      {displayedTexts[1]}
                      {isTyping && visibleMessages === 2 && (
                        <span className="inline-block w-0.5 h-4 bg-justmaid-turquoise ml-1 animate-pulse" />
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Message 3 - User */}
              {visibleMessages >= 3 && (
                <div className="flex justify-end gap-3 animate-slide-in-right">
                  <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] shadow-sm">
                    <p className="text-white text-sm sm:text-base leading-relaxed">
                      {displayedTexts[2]}
                    </p>
                  </div>
                  <img
                    src={conversation[2].avatar}
                    alt="Client"
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-gray-100"
                  />
                </div>
              )}

              {/* Message 4 - Assistant */}
              {visibleMessages >= 4 && (
                <div className="flex gap-3 animate-slide-in-left">
                  <div className="w-9 h-9 rounded-full bg-justmaid-turquoise flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white font-bold">J</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                      {displayedTexts[3]}
                      {isTyping && visibleMessages === 4 && (
                        <span className="inline-block w-0.5 h-4 bg-justmaid-turquoise ml-1 animate-pulse" />
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {(visibleMessages === 1 || visibleMessages === 3) && (
                <div className="flex gap-3 animate-slide-in-left">
                  <div className="w-9 h-9 rounded-full bg-justmaid-turquoise flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white font-bold">J</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s ease-out forwards;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.4s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
