import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  UserMultiple02Icon,
  Building02Icon,
  Briefcase01Icon,
  FavouriteIcon,
} from "@hugeicons/core-free-icons";
import * as React from "react";

interface AudienceItem {
  id: string;
  icon: typeof UserMultiple02Icon;
  label: string;
  title: string;
  description: string;
  image: string;
  color: string;
  bgColor: string;
}

const audiences: AudienceItem[] = [
  {
    id: "families",
    icon: UserMultiple02Icon,
    label: "Familles",
    title: "PARFAIT POUR",
    description: "Passez du temps avec vos proches, pas avec le ménage, et nous prendrons soin de votre maison comme de la nôtre.",
    image: "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=800&h=600&fit=crop",
    color: "text-primary",
    bgColor: "bg-amber-50",
  },
  {
    id: "businesses",
    icon: Building02Icon,
    label: "Entreprises",
    title: "PARFAIT POUR",
    description: "Offrez un environnement de travail impeccable à vos équipes. Bureaux propres, productivité accrue.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
    color: "text-gray-600",
    bgColor: "bg-white",
  },
  {
    id: "professionals",
    icon: Briefcase01Icon,
    label: "Professionnels",
    title: "PARFAIT POUR",
    description: "Vous êtes débordé ? Laissez-nous gérer le ménage pendant que vous vous concentrez sur votre carrière.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=600&fit=crop",
    color: "text-gray-600",
    bgColor: "bg-white",
  },
  {
    id: "you",
    icon: FavouriteIcon,
    label: "Vous",
    title: "PARFAIT POUR",
    description: "Prenez du temps pour vous. Un intérieur propre contribue à votre bien-être et votre sérénité.",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&h=600&fit=crop",
    color: "text-gray-600",
    bgColor: "bg-white",
  },
];

export function AudienceSection() {
  const [activeId, setActiveId] = React.useState("families");
  
  const activeAudience = audiences.find(a => a.id === activeId) || audiences[0];

  return (
    <section className="py-10 sm:py-16 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl max-w-4xl mx-auto mb-12 lg:mb-16">
          Profitez d'une vie sans corvée. Concentrez-vous sur ce que vous aimez. 💖
        </h2>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left - Accordion */}
          <div className="space-y-3">
            {audiences.map((audience) => (
              <div
                key={audience.id}
                className={`rounded-2xl transition-all duration-300 ${
                  activeId === audience.id 
                    ? "bg-amber-50 p-6" 
                    : "bg-white border border-gray-100 p-4 hover:border-gray-200 cursor-pointer"
                }`}
                onClick={() => setActiveId(audience.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    activeId === audience.id ? "bg-primary/10" : "bg-gray-100"
                  }`}>
                    <HugeiconsIcon 
                      icon={audience.icon} 
                      strokeWidth={1.5} 
                      className={`h-5 w-5 ${activeId === audience.id ? "text-primary" : "text-gray-500"}`} 
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {audience.title}
                    </p>
                    <p className={`font-semibold ${activeId === audience.id ? "text-primary" : "text-gray-900"}`}>
                      {audience.label}
                    </p>
                  </div>
                </div>

                {/* Expanded content */}
                {activeId === audience.id && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                      {audience.description}
                    </p>
                    <Link to="/booking/cleaning">
                      <Button className="rounded-full px-6">
                        Réserver
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right - Image */}
          <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden">
            {audiences.map((audience) => (
              <div
                key={audience.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  activeId === audience.id ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={audience.image}
                  alt={audience.label}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

