"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CometCard } from "@/components/ui/comet-card";

export function Hero() {
  const { login } = useAuth();

  return (
    <section className="relative w-full min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Container: Fluid layout (w-full px-6 to xl:px-12) */}
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Column: Text & CTA */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left pt-10 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20 backdrop-blur-sm self-center lg:self-start">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium tracking-wide">The Smarter Way to Learn</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight leading-[1.15]">
              Master Vocabulary with <br className="hidden lg:block" />
              <span className="bg-gradient-to-r from-primary via-teal-400 to-primary/80 bg-clip-text text-transparent pb-1 block mt-1">
                Intelligent Flashcards
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl font-body">
              Stop forgetting. Start systematizing your learning today. Group words into projects, study by topic, and let spaced repetition handle the rest.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
              <Button
                onClick={login}
                size="lg"
                className="w-full sm:w-auto text-base h-14 px-8 rounded-full shadow-glow hover:scale-105 transition-transform duration-300"
              >
                Sign In with Google
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Column: Comet Card Mockup */}
          <div className="relative w-full max-w-md mx-auto lg:max-w-none lg:w-[110%] lg:-ml-[5%] xl:w-[120%] xl:-ml-[10%] flex justify-center lg:justify-end perspective-1000">
            <div className="relative w-full max-w-[400px] aspect-[4/5] transform lg:rotate-2 lg:hover:rotate-0 transition-transform duration-700 ease-out flex items-center justify-center">

              <CometCard className="w-full h-full">
                <div className="w-full h-full flex flex-col px-4 py-4">
                  {/* Card Header inside Comet Card */}
                  <div className="flex justify-between items-center w-full mb-8">
                    <span className="text-xs font-semibold text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">単語</span>
                    <span className="text-xs font-semibold text-primary/80 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(38,204,143,0.2)]">New</span>
                  </div>

                  {/* Card Center */}
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-8xl lg:text-[140px] font-headline font-bold text-foreground mb-6 leading-none tracking-tight drop-shadow-md">
                      意
                    </div>
                    <div className="text-2xl lg:text-3xl text-primary font-medium tracking-wide">
                      mind, meaning
                    </div>
                  </div>

                  {/* Card Footer Progress */}
                  <div className="mt-8 flex w-full gap-3">
                    <div className="h-2 flex-1 bg-destructive/30 rounded-full cursor-not-allowed" />
                    <div className="h-2 flex-1 bg-warning/30 rounded-full cursor-not-allowed" />
                    <div className="h-2 flex-1 bg-success rounded-full shadow-[0_0_15px_rgba(38,204,143,0.6)] cursor-pointer hover:bg-success/80 transition-colors" />
                  </div>
                </div>
              </CometCard>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
