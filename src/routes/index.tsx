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
        title: "Justmaid | N°1 du ménage à Genève & Nyon | Réservez en ligne",
      },
      {
        name: "description",
        content: "Service de ménage professionnel en Suisse romande. Réservez votre aide ménagère en 2 minutes ! Personnel vérifié et assuré. Note 4.9/5. Dès 45 CHF/h. Sans engagement.",
      },
      {
        property: "og:title",
        content: "Justmaid | N°1 du ménage à Genève & Nyon",
      },
      {
        property: "og:description",
        content: "Service de ménage professionnel. Réservez en 2 minutes ! Personnel vérifié, note 4.9/5.",
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
