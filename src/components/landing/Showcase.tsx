export function Showcase() {
  return (
    <section className="relative w-full py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold font-headline mb-6">Designed to keep you focused</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-16">
          Learning a language is hard enough. Your tools shouldn't be. Lingofy features a clean, distraction-free interface built for deep focus.
        </p>

        {/* Abstract UI representation */}
        <div className="relative mx-auto w-full max-w-4xl aspect-[16/9] rounded-2xl bg-card border border-border/50 shadow-2xl overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
          
          <div className="relative z-10 w-3/4 max-w-lg">
            <div className="w-full bg-background rounded-xl border border-border shadow-lg p-6 animate-pulse-slow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-secondary"></div>
                <div className="space-y-2">
                  <div className="w-32 h-4 rounded bg-secondary"></div>
                  <div className="w-24 h-3 rounded bg-secondary/50"></div>
                </div>
              </div>
              <div className="space-y-3 mb-8">
                <div className="w-full h-3 rounded bg-secondary"></div>
                <div className="w-5/6 h-3 rounded bg-secondary"></div>
                <div className="w-4/6 h-3 rounded bg-secondary"></div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-10 rounded-lg bg-destructive/20 border border-destructive/30"></div>
                <div className="flex-1 h-10 rounded-lg bg-success/20 border border-success/30"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
