"use client";

import { motion } from "motion/react";
import { Check, X } from "lucide-react";

export function Comparison() {
  const features = [
    "Spaced Repetition",
    "AI Auto-Fetch",
    "Beautiful UI",
    "Offline Mode",
    "Community",
    "Affordable",
  ];

  const competitors = [
    {
      name: "Lingofy",
      price: "Free + $5/mo",
      features: [true, true, true, true, true, true],
    },
    {
      name: "Anki",
      price: "Free",
      features: [true, false, false, true, false, true],
    },
    {
      name: "WaniKani",
      price: "$9/mo",
      features: [true, false, true, false, true, false],
    },
    {
      name: "Quizlet",
      price: "Free + $12/mo",
      features: [false, false, true, false, true, false],
    },
  ];

  return (
    <section className="relative w-full py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black font-headline mb-4">
            How We Compare
          </h2>
          <p className="text-muted-foreground text-lg">
            The best of Anki, WaniKani, and Quizlet—without the compromises
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="overflow-x-auto"
        >
          <table className="w-full border-2 border-white/10">
            <thead>
              <tr className="border-b-2 border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left font-bold">Feature</th>
                {competitors.map((comp) => (
                  <th key={comp.name} className="px-6 py-4 text-center font-bold border-l-2 border-white/10">
                    <div>{comp.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">{comp.price}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={idx} className="border-b-2 border-white/10 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-semibold">{feature}</td>
                  {competitors.map((comp) => (
                    <td key={comp.name} className="px-6 py-4 text-center border-l-2 border-white/10">
                      {comp.features[idx] ? (
                        <Check className="w-5 h-5 text-primary mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 p-8 border-2 border-primary/40 bg-primary/5 text-center"
        >
          <p className="text-lg font-semibold mb-4">
            ✓ Start free. Upgrade anytime. Cancel anytime.
          </p>
          <p className="text-muted-foreground">
            No credit card required. 7-day free trial of premium features.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
