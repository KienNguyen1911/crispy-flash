import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GuidePage() {
  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline mb-4">🚀 How to Use LinguaFlash</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Follow these simple steps to start learning Japanese vocabulary effectively
        </p>
      </div>

      {/* How to Use Section */}
      <div className="space-y-8">
        <Card className="p-6">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-lg">Sign In</h3>
                    <p className="text-muted-foreground">Use your Google account to sign in and access your personalized learning dashboard.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-lg">Create a Project</h3>
                    <p className="text-muted-foreground">Organize your vocabulary learning by creating projects. For example: "N5 Vocabulary", "Business Japanese", or "Kanji Study".</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-lg">Add Topics</h3>
                    <p className="text-muted-foreground">Within each project, create topics to group related vocabulary. Examples: "Greetings", "Food", "Family", "Numbers".</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h3 className="font-semibold text-lg">Import Vocabulary</h3>
                    <p className="text-muted-foreground">Paste vocabulary data in a simple format. Example:<br/>
                      <code className="bg-muted px-2 py-1 rounded text-sm">日 にち / ひ Ngày, mặt trời</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">5</div>
                  <div>
                    <h3 className="font-semibold text-lg">Start Learning</h3>
                    <p className="text-muted-foreground">Begin flashcard sessions. Click cards to flip between Kanji/Hiragana and meaning. Mark words as "Remembered" or "Not Remembered".</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">6</div>
                  <div>
                    <h3 className="font-semibold text-lg">Track Progress</h3>
                    <p className="text-muted-foreground">Review your learning statistics. Focus on "Not Remembered" words in future sessions for efficient learning.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">✨ Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  📚
                </div>
                <h3 className="font-semibold">Organized Learning</h3>
                <p className="text-sm text-muted-foreground">Structure your vocabulary into projects and topics for better organization.</p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  🧠
                </div>
                <h3 className="font-semibold">Smart Flashcards</h3>
                <p className="text-sm text-muted-foreground">Interactive flashcards with progress tracking and review filtering.</p>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  📊
                </div>
                <h3 className="font-semibold">Progress Analytics</h3>
                <p className="text-sm text-muted-foreground">Track your learning progress with detailed statistics and insights.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">💡 Learning Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">📝 Import Format</h4>
                <p className="text-sm text-muted-foreground">Use this format for importing vocabulary:<br/>
                  <code className="bg-muted px-2 py-1 rounded">Kanji Hiragana/Katakana Meaning</code><br/>
                  Example: <code className="bg-muted px-2 py-1 rounded">日 にち / ひ Ngày, mặt trời</code>
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">🎯 Study Strategy</h4>
                <p className="text-sm text-muted-foreground">Start with small topics (10-20 words). Review "Not Remembered" words frequently. Use spaced repetition for better retention.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">🔄 Review Sessions</h4>
                <p className="text-sm text-muted-foreground">Regular short sessions (15-30 minutes) are more effective than long cramming sessions.</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">📈 Progress Tracking</h4>
                <p className="text-sm text-muted-foreground">Your progress is automatically saved. Focus on difficult words and celebrate small victories!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}