import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";

const testimonials = [
  {
    id: 1,
    name: "Marie L.",
    location: "Genève",
    rating: 5,
    text: "Service impeccable ! J'ai réservé le matin et l'intervenante était là l'après-midi même. Mon appartement n'a jamais été aussi propre.",
    date: "Il y a 2 jours",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    size: "normal",
  },
  {
    id: 2,
    name: "Thomas B.",
    location: "Lausanne",
    rating: 5,
    text: "Je suis très satisfait de la qualité du ménage. L'application est simple à utiliser et le personnel est très professionnel. Je recommande sans hésitation ! C'est vraiment un service qui change la vie quand on travaille beaucoup.",
    date: "Il y a 1 semaine",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    size: "large",
  },
  {
    id: 3,
    name: "Sophie M.",
    location: "Zurich",
    rating: 5,
    text: "Enfin un service fiable !",
    date: "Il y a 2 semaines",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    size: "small",
  },
  {
    id: 4,
    name: "Pierre D.",
    location: "Berne",
    rating: 5,
    text: "Très pratique pour les personnes occupées comme moi. Je peux réserver en 2 minutes et tout est géré. Top !",
    date: "Il y a 3 jours",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    size: "normal",
  },
  {
    id: 5,
    name: "Julie R.",
    location: "Neuchâtel",
    rating: 5,
    text: "Ma maison est toujours impeccable depuis que j'utilise justmaid. L'équipe est ponctuelle, professionnelle et très agréable. Les produits utilisés sont écologiques et sentent bon. Je ne peux plus m'en passer, c'est devenu indispensable dans mon quotidien !",
    date: "Il y a 5 jours",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    size: "large",
  },
  {
    id: 6,
    name: "Marc V.",
    location: "Fribourg",
    rating: 5,
    text: "Service client au top !",
    date: "Il y a 1 semaine",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    size: "small",
  },
  {
    id: 7,
    name: "Léa P.",
    location: "Montreux",
    rating: 5,
    text: "J'adore pouvoir choisir la même intervenante. Elle connaît ma maison par cœur maintenant ! Un vrai plus pour la qualité du service.",
    date: "Il y a 4 jours",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    size: "normal",
  },
  {
    id: 8,
    name: "Nicolas G.",
    location: "Sion",
    rating: 5,
    text: "Parfait pour mon Airbnb !",
    date: "Il y a 6 jours",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    size: "small",
  },
  {
    id: 9,
    name: "Emma C.",
    location: "Bâle",
    rating: 5,
    text: "Les produits écologiques utilisés sont un vrai plus. Ma famille et moi sommes très satisfaits du résultat. L'intervenante prend vraiment soin de notre maison comme si c'était la sienne. Nous avons essayé plusieurs services avant et justmaid est de loin le meilleur !",
    date: "Il y a 2 semaines",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
    size: "large",
  },
  {
    id: 10,
    name: "Antoine F.",
    location: "Lugano",
    rating: 5,
    text: "Rapide, efficace, professionnel. Que demander de plus ? Je recommande à 100%.",
    date: "Il y a 3 jours",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face",
    size: "normal",
  },
  {
    id: 11,
    name: "Clara B.",
    location: "Winterthur",
    rating: 5,
    text: "Génial ! 🌟",
    date: "Il y a 1 jour",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
    size: "tiny",
  },
  {
    id: 12,
    name: "David M.",
    location: "Lucerne",
    rating: 5,
    text: "En tant que chef d'entreprise, je n'ai pas le temps de m'occuper du ménage. justmaid m'a changé la vie. La réservation est ultra simple, les intervenants sont ponctuels et le résultat est toujours impeccable. Je l'utilise aussi pour mes bureaux maintenant.",
    date: "Il y a 1 semaine",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
    size: "large",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-10 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ils nous font confiance 💬
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Découvrez les avis de nos clients satisfaits
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <HugeiconsIcon
                  key={i}
                  icon={StarIcon}
                  strokeWidth={2}
                  className="h-5 w-5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="font-semibold text-foreground">4.9/5</span>
            <span className="text-muted-foreground">basé sur 2 500+ avis</span>
          </div>
        </div>

        {/* Testimonials Masonry Grid */}
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="animate-fade-in-up mb-5 break-inside-avoid"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div 
                className={`relative rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:-translate-y-1 ${
                  testimonial.size === "tiny" ? "p-4" : 
                  testimonial.size === "small" ? "p-5" : 
                  testimonial.size === "large" ? "p-8" : "p-6"
                }`}
              >
                {/* Quote icon */}
                <div className={`absolute right-4 top-4 font-serif text-gray-200 ${
                  testimonial.size === "tiny" || testimonial.size === "small" ? "text-2xl" : "text-4xl"
                }`}>
                  "
                </div>

                {/* Rating */}
                <div className="mb-3 flex gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <HugeiconsIcon
                      key={i}
                      icon={StarIcon}
                      strokeWidth={2}
                      className={`fill-amber-400 text-amber-400 ${
                        testimonial.size === "tiny" ? "h-3 w-3" :
                        testimonial.size === "small" ? "h-4 w-4" : "h-5 w-5"
                      }`}
                    />
                  ))}
                </div>

                {/* Text */}
                <p className={`text-gray-700 leading-relaxed ${
                  testimonial.size === "tiny" ? "text-sm mb-3" :
                  testimonial.size === "small" ? "text-sm mb-4" :
                  testimonial.size === "large" ? "text-base mb-6" : "mb-5"
                }`}>
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className={`rounded-full object-cover ${
                      testimonial.size === "tiny" ? "h-8 w-8" :
                      testimonial.size === "small" ? "h-10 w-10" : "h-12 w-12"
                    }`}
                  />
                  <div>
                    <p className={`font-semibold text-gray-900 ${
                      testimonial.size === "tiny" || testimonial.size === "small" ? "text-sm" : ""
                    }`}>
                      {testimonial.name}
                    </p>
                    <p className={`text-gray-500 ${
                      testimonial.size === "tiny" ? "text-xs" : "text-sm"
                    }`}>
                      {testimonial.location} • {testimonial.date}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
