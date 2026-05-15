"use client";

import { motion } from "motion/react";
import { TrendingDown, BookX, Frown, ArrowDown } from "lucide-react";

export function PainPoints() {
  const painPoints = [
    {
      title: "The Forgetting Curve",
      description: "You study 50 kanji today, but only remember 5 by next week. Traditional studying fighting against your brain's natural decay.",
      icon: <TrendingDown className="w-8 h-8 text-destructive/80" />,
    },
    {
      title: "Contextless Memorization",
      description: "Learning words in isolation (like '意 = mind') doesn't teach you how to use them in real Japanese sentences.",
      icon: <BookX className="w-8 h-8 text-warning/80" />,
    },
    {
      title: "Cluttered & Outdated Tools",
      description: "Existing flashcard apps feel like spreadsheets from 1995. Setting up a deck takes longer than actually learning.",
      icon: <Frown className="w-8 h-8 text-muted-foreground" />,
    },
  ];

  return (
    <section className="relative w-full py-24 bg-background overflow-hidden border-t-2 border-b-2 border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black font-headline mb-6 text-foreground/90">
            Learning Japanese is hard enough.
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            If you've ever felt like your vocabulary leaks out of your brain as fast as you put it in, you're not alone.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {painPoints.map((point, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              className="p-8 border-2 border-destructive/30 bg-destructive/5 hover:border-destructive/50 transition-colors"
            >
              <div className="w-16 h-16 border-2 border-destructive/40 flex items-center justify-center mb-6 bg-background">
                {point.icon}
              </div>
              <h4 className="text-xl font-bold mb-3">{point.title}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Transition to Solution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-20 flex justify-center"
        >
          <div className="flex flex-col items-center gap-4 text-primary">
            <span className="font-bold tracking-widest uppercase text-sm">The Solution</span>
            <ArrowDown className="w-6 h-6 animate-bounce" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
