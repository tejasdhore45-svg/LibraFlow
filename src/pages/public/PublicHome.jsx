import PublicNavbar from "./components/PublicNavbar";
import HeroSection from "./components/HeroSection";
import PlatformStats from "./components/PlatformStats";
import FeaturesSection from "./Components/FeaturesSection";
import HowItWorks from "./Components/HowItWorks";
import PricingSection from "./Components/PricingSection";
import CTASection from "./Components/CTASection";
import PublicFooter from "./Components/PublicFooter";

const PublicHome = () => {
  return (
    <div className="public-home">

      <PublicNavbar />

      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Platform Statistics */}
        <PlatformStats />

        {/* Features Section */}
        <FeaturesSection />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Pricing Section */}
        <PricingSection />

        {/* Call to Action Section */}
        <CTASection />

        {/* Footer Section */}
        <PublicFooter />
      </main>

    </div>
  );
};

export default PublicHome;