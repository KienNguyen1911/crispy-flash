"use client";

import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "How long until I see results?",
      a: "Most users see improvement in 2-3 weeks. With consistent 15-minute daily sessions, you'll notice significant vocabulary retention within a month.",
    },
    {
      q: "Will I actually remember what I learn?",
      a: "Yes. Our spaced repetition algorithm is based on decades of cognitive science research. Users achieve 95% retention vs 40% with traditional methods.",
    },
    {
      q: "How much time do I need to commit?",
      a: "Just 15 minutes per day, 6 days a week. That's it. Consistency matters more than duration.",
    },
    {
      q: "Is this better than Anki or WaniKani?",
      a: "We combine the best of both: Anki's flexibility with WaniKani's beautiful design. Plus, our AI auto-fetches readings and examples—no manual setup.",
    },
    {
      q: "What if I forget to study?",
      a: "Our smart reminders keep you on track. Plus, the algorithm adapts if you miss days—no guilt, just progress.",
    },
    {
      q: "Can I use this offline?",
      a: "Yes. Download your decks and study anywhere. Sync automatically when you're back online.",
    },
  ];

  return (
    <section className="relative w-full py-24 bg-background border-t-2 border-primary/20 overflow-hidden">
      {/* Neobrutalism Accent */}
      <div className="absolute bottom-0 right-0 w-64 h-64 border-4 border-primary/10 -z-10" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black font-headline mb-4">
            Common Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know before getting started
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="border-2 border-white/10 hover:border-primary/40 transition-colors"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-bold text-left">{faq.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-primary transition-transform duration-300 ${
                    openIdx === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              {openIdx === idx && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-4 border-t-2 border-white/5 bg-white/5"
                >
                  <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
