import { Brain, Layers, BookOpen, Zap } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Spaced Repetition System",
      description: "Our intelligent algorithm predicts when you're about to forget a word and schedules it for review at the perfect moment.",
      icon: <Brain className="w-6 h-6 text-primary" />,
    },
    {
      title: "Project Organization",
      description: "Don't just learn random words. Group your vocabulary into projects and topics, making context-based learning effortless.",
      icon: <Layers className="w-6 h-6 text-primary" />,
    },
    {
      title: "Smart Fetching",
      description: "Paste a word and let us fetch the readings, meanings, and examples for you. Spend less time building cards, more time learning.",
      icon: <Zap className="w-6 h-6 text-primary" />,
    },
    {
      title: "Clean & Distraction-Free",
      description: "A gorgeous, dark-themed UI that is easy on the eyes. We removed the clutter so you can focus 100% on mastery.",
      icon: <BookOpen className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <section className="relative w-full py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-3xl">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Features</h2>
          <h3 className="text-3xl md:text-5xl font-bold font-headline mb-4">Everything you need to reach fluency</h3>
          <p className="text-muted-foreground text-lg">
            We built Lingofy because traditional flashcard apps felt outdated and clunky. Here is how we do it better.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="p-8 rounded-3xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-background flex items-center justify-center mb-6 shadow-sm border border-border group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
