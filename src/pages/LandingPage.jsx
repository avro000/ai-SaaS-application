import Navigation from "../components/Landing/Navigation";
import HeroSection from "../components/Landing/HeroSection";
import FeaturesSection from "../components/Landing/FeaturesSection";
import HowItWorksSection from "../components/Landing/HowItWorksSection";
import InfrastructureSection from "../components/Landing/InfrastructureSection";
import MetricsSection from "../components/Landing/MetricsSection";
import IntegrationsSection from "../components/Landing/IntegrationsSection";
import SecuritySection from "../components/Landing/SecuritySection";
import FaqSection from "../components/Landing/FaqSection";
import TestimonialsSection from "../components/Landing/TestimonialsSection";
import PricingSection from "../components/Landing/PricingSection";
import CtaSection from "../components/Landing/CtaSection";
import FooterSection from "../components/Landing/FooterSection";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <InfrastructureSection />
      <MetricsSection />
      <IntegrationsSection />
      <SecuritySection />
      <FaqSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
