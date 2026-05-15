"use client";

import { motion } from "motion/react";
import { TrendingUp, Clock, Target } from "lucide-react";
import { RetentionIllustration } from "./RetentionIllustration";
import { LearningTimelineIllustration } from "./LearningTimelineIllustration";

export function Results() {
  const results = [
    {
      metric: "95%",
      label: "Retention Rate",
      description: "vs 40% with traditional methods",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      metric: "6 months",
      label: "To N2 Fluency",
      description: "Master 1000+ kanji and vocabulary",
      icon: <Target className="w-6 h-6" />,
    },
    {
      metric: "15 min",
      label: "Daily Commitment",
      description: "6 days per week for optimal results",
      icon: <Clock className="w-6 h-6" />,
    },
  ];

  return (
    <section className="relative w-full py-24 bg-background border-t-2 border-b-2 border-primary/20 overflow-hidden">
      {/* Neobrutalism Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 border-4 border-primary/10 -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 border-4 border-primary/10 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black font-headline mb-6">
            Real Results. Real Data.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our users don't just learn faster—they remember longer. Here's what the data shows.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {results.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="p-8 border-2 border-primary/40 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 border-2 border-primary/60 flex items-center justify-center text-primary">
                  {item.icon}
                </div>
              </div>
              <div className="text-5xl font-black text-primary mb-2">
                {item.metric}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.label}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Illustrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Retention Comparison */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 border-2 border-white/10 bg-white/5"
          >
            <h3 className="text-xl font-bold mb-6">Retention Comparison</h3>
            <div className="h-64">
              <RetentionIllustration />
            </div>
          </motion.div>

          {/* Learning Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 border-2 border-white/10 bg-white/5"
          >
            <h3 className="text-xl font-bold mb-6">Your Learning Journey</h3>
            <div className="h-64">
              <LearningTimelineIllustration />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
