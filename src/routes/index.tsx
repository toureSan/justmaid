import { createFileRoute } from "@tanstack/react-router";
import {
  HeroSection,
  ServicesSection,
  FeaturesSection,
  AudienceSection,
  MissionSection,
  BookingCTASection,
  TestimonialsSection,
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
      <CTASection />
    </>
  );
}
