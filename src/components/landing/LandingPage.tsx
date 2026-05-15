import { Hero } from "./Hero";
import { Results } from "./Results";
import { PainPoints } from "./PainPoints";
import { Features } from "./Features";
import { SocialProof } from "./SocialProof";
import { Comparison } from "./Comparison";
import { FAQ } from "./FAQ";
import { FinalCTA } from "./FinalCTA";
import { Footer } from "./Footer";
import { ResizableNavbar } from "@/components/ui/resizable-navbar";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground w-full overflow-x-hidden">
      <ResizableNavbar />
      <Hero />
      <Results />
      <PainPoints />
      <Features />
      <SocialProof />
      <Comparison />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
