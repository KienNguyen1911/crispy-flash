import { motion } from "motion/react";
import { FolderPlus, PenTool, RefreshCcw } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Create a Project",
      description: "Organize your learning. Creating a project for 'JLPT N3' or 'Business vocabulary' keeps your flashcards contextual.",
      icon: <FolderPlus className="w-8 h-8 text-primary" />,
    },
    {
      step: "02",
      title: "Add Vocabulary",
      description: "Input words quickly. Our system helps structure the meanings and readings so you build cards effortlessly.",
      icon: <PenTool className="w-8 h-8 text-indigo-400" />,
    },
    {
      step: "03",
      title: "Let SRS Take Over",
      description: "Just hit review. Our Spaced Repetition System acts as your personal tutor, resurfacing words exactly when you need them.",
      icon: <RefreshCcw className="w-8 h-8 text-success" />,
    },
  ];

  return (
    <section className="relative w-full py-32 bg-card/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-6">How it works</h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            A frictionless flow from adding a new word to embedding it permanently in your long-term memory.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 relative">
          {/* Animated Connector Line for Desktop */}
          <div className="hidden md:block absolute top-[25%] left-[16%] right-[16%] h-[2px] bg-border/50 -z-10">
            <motion.div 
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
              className="h-full bg-gradient-to-r from-primary via-indigo-400 to-success"
            />
          </div>
          
          {steps.map((step, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.3 }}
              className="flex flex-col items-center text-center relative z-10 group"
            >
              <div className="relative mb-8">
                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-sm font-bold font-headline z-20 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                  {step.step}
                </div>
                
                {/* Icon Container */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-24 h-24 rounded-full bg-background border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:border-primary/50 transition-colors relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {step.icon}
                </motion.div>
              </div>

              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
