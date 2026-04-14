import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Sparkles, Library, Brain, BarChart3, Lightbulb, FileText, Target, RefreshCcw, TrendingUp } from 'lucide-react';

export function GuideContent() {
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 flex-1">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold font-headline mb-4 flex items-center justify-center gap-3">
          <Rocket className="w-10 h-10 lg:w-12 lg:h-12 text-primary" />
          How to Use Lingofy
        </h1>
        <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
          Follow these simple steps to start learning Japanese vocabulary effectively
        </p>
      </div>

      {/* How to Use Section */}
      <div className="space-y-8">
        <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-sm border-white/5 shadow-glass-card">
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-lg border border-primary/30 shadow-[0_0_15px_rgba(38,204,143,0.2)]">1</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Sign In</h3>
                    <p className="text-muted-foreground leading-relaxed">Use your Google account to sign in and access your personalized learning dashboard.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-lg border border-primary/30 shadow-[0_0_15px_rgba(38,204,143,0.2)]">2</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Create a Project</h3>
                    <p className="text-muted-foreground leading-relaxed">Organize your vocabulary learning by creating projects. For example: "N5 Vocabulary", "Business Japanese", or "Word Study".</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-lg border border-primary/30 shadow-[0_0_15px_rgba(38,204,143,0.2)]">3</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Add Topics</h3>
                    <p className="text-muted-foreground leading-relaxed">Within each project, create topics to group related vocabulary. Examples: "Greetings", "Food", "Family", "Numbers".</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-lg border border-primary/30 shadow-[0_0_15px_rgba(38,204,143,0.2)]">4</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Import Vocabulary</h3>
                    <p className="text-muted-foreground leading-relaxed">Paste vocabulary data in a simple format. Example:<br/>
                      <code className="bg-primary/10 border border-primary/20 mt-2 px-3 py-1.5 rounded-md text-sm md:text-base inline-block">日,にち,ひ,Ngày, mặt trời</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-lg border border-primary/30 shadow-[0_0_15px_rgba(38,204,143,0.2)]">5</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Start Learning</h3>
                    <p className="text-muted-foreground leading-relaxed">Begin flashcard sessions. Click cards to flip between Word/Pronunciation and meaning. Mark words as "Remembered" or "Not Remembered".</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-lg border border-primary/30 shadow-[0_0_15px_rgba(38,204,143,0.2)]">6</div>
                  <div>
                    <h3 className="font-bold text-xl mb-1">Track Progress</h3>
                    <p className="text-muted-foreground leading-relaxed">Review your learning statistics. Focus on "Not Remembered" words in future sessions for efficient learning.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-sm border-white/5">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl lg:text-3xl font-headline flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-3 p-6 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-sm border border-primary/20">
                  <Library className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg">Organized Learning</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Structure your vocabulary into projects and topics for better organization.</p>
              </div>

              <div className="text-center space-y-3 p-6 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-sm border border-primary/20">
                  <Brain className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg">Smart Flashcards</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Interactive flashcards with progress tracking and review filtering.</p>
              </div>

              <div className="text-center space-y-3 p-6 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-sm border border-primary/20">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg">Progress Analytics</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Track your learning progress with detailed statistics and insights.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-sm border-white/5">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl lg:text-3xl font-headline flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-primary" />
              Learning Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-0 pb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3 bg-secondary/10 p-5 rounded-xl">
                <h4 className="font-bold text-lg flex items-center gap-2 text-primary">
                  <FileText className="w-5 h-5" /> Import Format
                </h4>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Use this format for importing vocabulary:<br/>
                  <code className="bg-background border border-border px-2 py-1 rounded mt-2 inline-block">Word,Pronunciation,Meaning</code><br/>
                  Example: <code className="bg-background border border-border px-2 py-1 rounded mt-1 inline-block">日,にち,ひ,Ngày, mặt trời</code>
                </p>
              </div>

              <div className="space-y-3 bg-secondary/10 p-5 rounded-xl">
                <h4 className="font-bold text-lg flex items-center gap-2 text-primary">
                  <Target className="w-5 h-5" /> Study Strategy
                </h4>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Start with small topics (10-20 words). Review "Not Remembered" words frequently. Use spaced repetition for better retention.</p>
              </div>

              <div className="space-y-3 bg-secondary/10 p-5 rounded-xl">
                <h4 className="font-bold text-lg flex items-center gap-2 text-primary">
                  <RefreshCcw className="w-5 h-5" /> Review Sessions
                </h4>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Regular short sessions (15-30 minutes) are more effective than long cramming sessions.</p>
              </div>

              <div className="space-y-3 bg-secondary/10 p-5 rounded-xl">
                <h4 className="font-bold text-lg flex items-center gap-2 text-primary">
                  <TrendingUp className="w-5 h-5" /> Progress Tracking
                </h4>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Your progress is automatically saved. Focus on difficult words and celebrate small victories!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
