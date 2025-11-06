"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

type Language = "english" | "vietnamese";
type Difficulty = "easy" | "medium" | "hard";

interface GenerateStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (language: Language, difficulty: Difficulty) => void;
  isGenerating?: boolean;
}

export default function GenerateStoryDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating = false,
}: GenerateStoryDialogProps) {
  const [language, setLanguage] = useState<Language>("english");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const handleGenerate = () => {
    onGenerate(language, difficulty);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Story Settings
          </DialogTitle>
          <DialogDescription>
            Choose the language and difficulty level for your story.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Language Selection */}
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="vietnamese">Vietnamese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Selection */}
          <div className="grid gap-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={difficulty}
              onValueChange={(value) => setDifficulty(value as Difficulty)}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Easy</span>
                    <span className="text-xs text-muted-foreground">
                      Simple vocabulary and short sentences
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Medium</span>
                    <span className="text-xs text-muted-foreground">
                      Moderate complexity
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="hard">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Hard</span>
                    <span className="text-xs text-muted-foreground">
                      Complex sentences and advanced usage
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
