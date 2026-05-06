"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";
import StoryDisplay from "@/components/StoryDisplay";
import type { AIGeneratedContent } from "@/lib/types";

interface StoryDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  generatedContent: AIGeneratedContent | null;
  vocabulary: any[];
}

export const StoryDrawer = ({
  isOpen,
  onOpenChange,
  generatedContent,
  vocabulary,
}: StoryDrawerProps) => (
  <Sheet open={isOpen} onOpenChange={onOpenChange}>
    <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generated Stories
        </SheetTitle>
        <SheetDescription>
          Multiple short stories using your vocabulary words
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6">
        {generatedContent ? (
          <StoryDisplay
            stories={generatedContent.stories}
            vocabularyList={vocabulary}
          />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>No content generated yet</p>
          </div>
        )}
      </div>
    </SheetContent>
  </Sheet>
);
