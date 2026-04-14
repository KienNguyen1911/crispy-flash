import { Hero } from "./Hero";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { Showcase } from "./Showcase";
import { Footer } from "./Footer";
import { ResizableNavbar } from "@/components/ui/resizable-navbar";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground w-full overflow-x-hidden">
      <ResizableNavbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Showcase />
      <Footer />
    </div>
  );
}
