import { Navbar } from "@/components/layout/Navbar";
import { LandingPage } from "@/components/sections/LandingPage";
import { ParticleBackground } from "@/components/ui/ParticleBackground";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "var(--bg-1)" }}>
      <ParticleBackground />
      <div className="relative z-10">
        <Navbar />
        <LandingPage />
      </div>
    </div>
  );
}