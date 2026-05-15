"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { FloatingKanjiParticles } from "./FloatingKanjiParticles";
import { KanjiGrid } from "./KanjiGrid";

export function Hero() {
  const { login } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <section className="relative w-full min-h-[95vh] flex items-center pt-20 pb-12 overflow-hidden bg-background">
      {/* Neobrutalism Grid Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,rgba(38,204,143,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(38,204,143,0.08)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_100%_70%_at_50%_50%,#000_60%,transparent_100%)]" />
      
      {/* Accent Blocks - Neobrutalism Style */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 right-[10%] w-32 h-32 border-4 border-primary/40 -z-10" 
      />
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        className="absolute bottom-32 left-[5%] w-40 h-40 border-4 border-primary/20 -z-10" 
      />

      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Column */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants} 
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 border-2 border-primary/60 bg-primary/5 self-center lg:self-start"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold tracking-widest uppercase">95% Retention Rate</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              variants={itemVariants} 
              className="text-5xl sm:text-6xl lg:text-7xl font-black font-headline tracking-tight leading-[1.1] mb-6"
            >
              Stop Forgetting<br className="hidden sm:block" />
              <span className="text-primary">Japanese</span>
            </motion.h1>

            {/* Subheading with Outcome */}
            <motion.p 
              variants={itemVariants} 
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mb-8 font-body"
            >
              Learn 1000+ kanji and vocabulary with AI-powered spaced repetition. Master N2 fluency in 6 months, not years.
            </motion.p>

            {/* Stats Row */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 mb-10 w-full sm:w-auto"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-2 border-white/10 bg-white/5">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Average Time</div>
                  <div className="font-bold">15 min/day</div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 border-2 border-white/10 bg-white/5">
                <div className="w-5 h-5 text-primary font-bold">✓</div>
                <div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                  <div className="font-bold">95% Retention</div>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants} 
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Button
                onClick={login}
                size="lg"
                className="w-full sm:w-auto text-base h-14 px-8 border-2 border-primary font-bold tracking-wide hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <button className="px-6 h-14 border-2 border-white/20 font-bold hover:border-primary/60 transition-colors">
                See Demo
              </button>
            </motion.div>

            {/* Trust Signal */}
            <motion.p 
              variants={itemVariants}
              className="text-sm text-muted-foreground mt-8"
            >
              ✓ No credit card required • 7-day free trial • Join 5,000+ learners
            </motion.p>
          </motion.div>

          {/* Right Column - Kanji Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative w-full flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-2xl">
              <KanjiGrid />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
