export function HowItWorks() {
  const steps = [
    {
      id: "create",
      step: "01",
      title: "Create a Project",
      description: "Organize your learning. Creating a project for 'JLPT N3' or 'Business vocabulary' keeps your flashcards contextual.",
    },
    {
      id: "add",
      step: "02",
      title: "Add Vocabulary",
      description: "Input words quickly. Our system helps structure the meanings and readings so you build cards effortlessly.",
    },
    {
      id: "srs",
      step: "03",
      title: "Let SRS Take Over",
      description: "Just hit review. Our Spaced Repetition System acts as your personal tutor, resurfacing words exactly when you need them.",
    },
  ];

  return (
    <section className="relative w-full py-24 bg-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4">How it works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A frictionless flow from adding a new word to embedding it permanently in your long-term memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-[20%] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-border to-transparent -z-10"></div>
          
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xl font-bold font-headline shadow-[0_0_20px_rgba(38,204,143,0.2)] mb-6">
                {step.step}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
