import { createFileRoute } from "@tanstack/react-router";
import {
  HeroSection,
  ServicesSection,
  FeaturesSection,
  AudienceSection,
  MissionSection,
  BookingCTASection,
  TestimonialsSection,
  CitiesSection,
  CTASection,
} from "@/components/home";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: "justmaid - Femme & Homme de ménage à Genève & Nyon | Réservez en 2 minutes",
      },
      {
        name: "description",
        content: "Réservez une aide ménagère qualifiée à Genève et Nyon. Service disponible dès demain, professionnels vérifiés et assurés. Note moyenne 4.9/5. Tarif transparent dès 45 CHF/h.",
      },
      {
        property: "og:title",
        content: "justmaid - Femme & Homme de ménage à Genève & Nyon | Réservez en 2 minutes",
      },
      {
        property: "og:description",
        content: "Réservez une aide ménagère qualifiée à Genève et Nyon. Service disponible dès demain, professionnels vérifiés et assurés.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://justmaid.ch",
      },
    ],
  }),
});

function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturesSection />
      <AudienceSection />
      <MissionSection />
      <BookingCTASection />
      <TestimonialsSection />
      <CitiesSection />
      <CTASection />
    </>
  );
}
