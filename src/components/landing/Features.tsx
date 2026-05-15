import { Brain, Layers, Zap, BookOpen } from "lucide-react";
import { motion } from "motion/react";

export function Features() {
  const features = [
    {
      title: "Spaced Repetition System",
      description: "Our intelligent algorithm predicts when you're about to forget a word and schedules it for review at the perfect moment. Maximize retention with minimal effort.",
      icon: <Brain className="w-8 h-8 text-primary" />,
      className: "md:col-span-2",
      delay: 0.1,
    },
    {
      title: "Project Organization",
      description: "Group your vocabulary into projects and topics. Learn in context.",
      icon: <Layers className="w-8 h-8 text-indigo-400" />,
      className: "md:col-span-1",
      delay: 0.2,
    },
    {
      title: "Smart Fetching",
      description: "Paste a word and let us fetch the readings, meanings, and examples automatically.",
      icon: <Zap className="w-8 h-8 text-warning" />,
      className: "md:col-span-1",
      delay: 0.3,
    },
    {
      title: "Distraction-Free Mastery",
      description: "A gorgeous, dark-themed UI that is easy on the eyes. We removed the clutter so you can focus 100% on achieving fluency.",
      icon: <BookOpen className="w-8 h-8 text-success" />,
      className: "md:col-span-2",
      delay: 0.4,
    },
  ];

  return (
    <section className="relative w-full py-32 bg-background overflow-hidden">
      {/* Neobrutalism Accents */}
      <div className="absolute top-0 right-0 w-80 h-80 border-4 border-primary/10 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 border-4 border-primary/10 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-20 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 border-2 border-primary/60 bg-primary/5">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold tracking-widest uppercase">Features</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-black font-headline mb-6 leading-tight">
            Everything you need to reach fluency
          </h3>
          <p className="text-muted-foreground text-lg md:text-xl">
            We built Lingofy because traditional flashcard apps felt outdated and clunky. Here is how we do it better.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`p-8 md:p-10 border-2 border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10 transition-all ${feature.className}`}
            >
              <div className="w-16 h-16 border-2 border-primary/60 flex items-center justify-center mb-8 bg-background group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {feature.icon}
              </div>
              <h4 className="text-2xl font-bold mb-4 text-foreground/90">{feature.title}</h4>
              <p className="text-muted-foreground leading-relaxed text-base">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
