"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";

export function SocialProof() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Passed N2 in 6 months",
      content: "I went from 0 to 1000 kanji in 6 months. The spaced repetition actually works.",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Learning Japanese for 2 years",
      content: "Finally, a flashcard app that doesn't feel like a chore. 15 minutes a day and I'm making real progress.",
      rating: 5,
    },
    {
      name: "Yuki Tanaka",
      role: "Japanese teacher",
      content: "I recommend this to all my students. The retention rates are incredible.",
      rating: 5,
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
            Trusted by 5,000+ Learners
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands who've reached fluency with our system
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="p-8 border-2 border-white/10 bg-white/5 hover:border-primary/40 transition-colors"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div>
                <p className="font-bold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 flex flex-wrap justify-center gap-8 text-center"
        >
          <div className="px-6 py-4 border-2 border-white/10">
            <div className="text-2xl font-black text-primary">5,000+</div>
            <div className="text-sm text-muted-foreground">Active Learners</div>
          </div>
          <div className="px-6 py-4 border-2 border-white/10">
            <div className="text-2xl font-black text-primary">4.9★</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="px-6 py-4 border-2 border-white/10">
            <div className="text-2xl font-black text-primary">2M+</div>
            <div className="text-sm text-muted-foreground">Words Learned</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
