import { AnimatedBackground } from "@/components/meucci/animated-background";
import { HeroSection } from "@/components/meucci/hero-section";
import { VehicleShowcase } from "@/components/meucci/vehicle-showcase";
import { LeaderboardSection } from "@/components/meucci/leaderboard-section";
import { AboutSection } from "@/components/meucci/about-section";
import { ContactSection } from "@/components/meucci/contact-section";
import { Footer } from "@/components/meucci/footer";

export default function MeucciPage() {
  return (
    <main className="relative min-h-screen" style={{ background: "rgb(8, 8, 12)" }}>
      <AnimatedBackground />
      <HeroSection />
      <VehicleShowcase />
      <LeaderboardSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
