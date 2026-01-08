import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    id: 1,
    name: "Marie L.",
    rating: 5,
    text: "Service impeccable ! La réservation était simple et l'intervenante très professionnelle. Mon appartement n'a jamais été aussi propre.",
    date: "Il y a 2 jours",
    size: "normal",
  },
  {
    id: 2,
    name: "Thomas B.",
    rating: 5,
    text: "Je suis très satisfait de la qualité du ménage. Le site est simple à utiliser et le personnel est très professionnel. Je recommande sans hésitation ! C'est vraiment un service qui change la vie quand on travaille beaucoup.",
    date: "Il y a 1 semaine",
    size: "large",
  },
  {
    id: 3,
    name: "Sophie M.",
    rating: 4,
    text: "Bon service, je recommande !",
    date: "Il y a 2 semaines",
    size: "small",
  },
  {
    id: 4,
    name: "Pierre D.",
    rating: 5,
    text: "Très pratique pour les personnes occupées comme moi. La réservation prend 2 minutes et tout est géré. Top !",
    date: "Il y a 3 jours",
    size: "normal",
  },
  {
    id: 5,
    name: "Julie R.",
    rating: 5,
    text: "Ma maison est toujours impeccable depuis que j'utilise Justmaid. L'intervenante est ponctuelle, professionnelle et très agréable. Je ne peux plus m'en passer, c'est devenu indispensable dans mon quotidien !",
    date: "Il y a 5 jours",
    size: "large",
  },
  {
    id: 6,
    name: "Marc V.",
    rating: 4,
    text: "Équipe réactive et pro !",
    date: "Il y a 1 semaine",
    size: "small",
  },
  {
    id: 7,
    name: "Léa P.",
    rating: 5,
    text: "L'intervenante a fait un travail remarquable. Cuisine, salle de bain, tout était nickel. Je referai appel à Justmaid sans hésiter.",
    date: "Il y a 4 jours",
    size: "normal",
  },
  {
    id: 8,
    name: "Nicolas G.",
    rating: 4,
    text: "Idéal pour mon logement !",
    date: "Il y a 6 jours",
    size: "small",
  },
  {
    id: 9,
    name: "Emma C.",
    rating: 5,
    text: "L'intervenante prend vraiment soin de notre maison. Ma famille et moi sommes très satisfaits du résultat. Nous avons essayé plusieurs services avant et Justmaid est de loin le meilleur !",
    date: "Il y a 2 semaines",
    size: "large",
  },
  {
    id: 10,
    name: "Antoine F.",
    rating: 5,
    text: "Rapide, efficace, professionnel. Que demander de plus ? Je recommande à 100%.",
    date: "Il y a 3 jours",
    size: "normal",
  },
  {
    id: 11,
    name: "Clara B.",
    rating: 5,
    text: "Super service ! 👍",
    date: "Il y a 1 jour",
    size: "tiny",
  },
  {
    id: 12,
    name: "David M.",
    rating: 4,
    text: "Je n'ai pas le temps de m'occuper du ménage avec mon travail. Justmaid m'a simplifié la vie. La réservation est ultra simple, l'intervenante était ponctuelle et le résultat était impeccable.",
    date: "Il y a 1 semaine",
    size: "large",
  },
];

export function TestimonialsSection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>();
  
  return (
    <section className="bg-gray-50 py-10 sm:py-16 lg:py-24">
      <div ref={sectionRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mx-auto max-w-2xl text-center scroll-animate scroll-fade-up ${isVisible ? 'animate-in' : ''}`}>
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
            <span className="text-muted-foreground">basé sur 200+ avis</span>
          </div>
        </div>

        {/* Testimonials Masonry Grid */}
        <div className={`mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4 scroll-animate scroll-fade-up scroll-delay-2 ${isVisible ? 'animate-in' : ''}`}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="mb-5 break-inside-avoid"
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
                  <div className={`flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold ${
                    testimonial.size === "tiny" ? "h-8 w-8 text-xs" :
                    testimonial.size === "small" ? "h-10 w-10 text-sm" : "h-12 w-12"
                  }`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-semibold text-gray-900 ${
                      testimonial.size === "tiny" || testimonial.size === "small" ? "text-sm" : ""
                    }`}>
                      {testimonial.name}
                    </p>
                    <p className={`text-gray-500 ${
                      testimonial.size === "tiny" ? "text-xs" : "text-sm"
                    }`}>
                      {testimonial.date}
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
