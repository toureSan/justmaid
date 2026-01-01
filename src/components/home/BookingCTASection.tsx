import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function BookingCTASection() {
  return (
    <section className="relative py-10 sm:py-14 lg:py-20 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-400 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
          Votre maison propre est à portée de clic.
        </h2>
        
        <div className="mt-8">
          <Link to="/booking/cleaning">
            <Button 
              size="lg"
              className="rounded-full px-10 py-7 text-lg font-semibold bg-white text-gray-900 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all"
            >
              <span className="mr-2 text-xl">❤️</span>
              Réservez votre ménage
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

