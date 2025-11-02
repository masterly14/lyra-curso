import { FeaturesSection } from "@/components/landing-page/features-section"
import { HeroSection } from "@/components/landing-page/hero-section"
import { HowItWorksSection } from "@/components/landing-page/how-it-works-section"
import { PricingSection } from "@/components/landing-page/pricing-section"


const page = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
    </div>
  )
}

export default page
