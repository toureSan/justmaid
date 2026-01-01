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

export const Route = createFileRoute("/")({ component: HomePage });

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
