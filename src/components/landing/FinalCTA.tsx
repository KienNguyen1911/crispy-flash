"use client";

import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  const { login } = useAuth();

  return (
    <section className="relative w-full py-32 bg-background border-t-2 border-primary/20 overflow-hidden">
      {/* Neobrutalism Accents */}
      <div className="absolute top-0 left-0 w-80 h-80 border-4 border-primary/20 -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 border-4 border-primary/10 -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-black font-headline mb-6 leading-tight">
            Ready to Stop<br />Forgetting Japanese?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join 5,000+ learners who've reached fluency. Start your free trial today—no credit card required.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Button
              onClick={login}
              size="lg"
              className="text-base h-16 px-10 border-2 border-primary font-bold tracking-wide hover:scale-105 transition-all"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <button className="px-8 h-16 border-2 border-white/20 font-bold hover:border-primary/60 transition-colors">
              Schedule Demo
            </button>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            ✓ 7-day free trial • ✓ No credit card • ✓ Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
