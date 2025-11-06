"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import type { AIGeneratedStory, Vocabulary } from "@/lib/types";

interface StoryDisplayProps {
  stories: AIGeneratedStory[];
  vocabularyList: Vocabulary[];
}

export default function StoryDisplay({
  stories,
  vocabularyList,
}: StoryDisplayProps) {
  const [showTranslation, setShowTranslation] = useState(false);

  if (!stories || stories.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No stories available
      </div>
    );
  }

  // Create a map of words to their vocabulary details for quick lookup
  const vocabularyMap = useMemo(() => {
    const map = new Map<string, Vocabulary>();
    vocabularyList.forEach((vocab) => {
      // Add both original and lowercase versions for case-insensitive matching
      map.set(vocab.word.toLowerCase(), vocab);
    });
    return map;
  }, [vocabularyList]);

  // Function to highlight vocabulary words in the story
  const highlightVocabulary = (content: string, targetWords: string[]) => {
    // Create a set of target words (lowercase) for quick lookup
    const targetWordSet = new Set(
      targetWords.map((word) => word.toLowerCase()),
    );

    // Split by word boundaries while preserving punctuation
    const regex = /(\b[\w']+\b|[^\w\s]|\s+)/g;
    const parts = content.match(regex) || [];

    return parts.map((part, index) => {
      const cleanWord = part.trim().toLowerCase();
      const isTargetWord = targetWordSet.has(cleanWord);
      const vocabDetails = vocabularyMap.get(cleanWord);

      if (isTargetWord && vocabDetails) {
        return (
          <TooltipProvider key={index}>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <span className="relative inline cursor-pointer font-semibold text-primary underline decoration-primary/30 decoration-2 underline-offset-2 transition-colors hover:text-primary/80 hover:decoration-primary/50">
                  {part}
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs space-y-2 p-3"
                sideOffset={8}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {vocabDetails.word}
                  </p>
                  {vocabDetails.pronunciation && (
                    <p className="text-xs text-muted-foreground italic">
                      /{vocabDetails.pronunciation}/
                    </p>
                  )}
                  {vocabDetails.part_of_speech && (
                    <Badge variant="outline" className="text-xs">
                      {vocabDetails.part_of_speech}
                    </Badge>
                  )}
                </div>
                <Separator />
                <p className="text-sm text-foreground">
                  {vocabDetails.meaning}
                </p>
                {vocabDetails.usageExample && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Example:
                      </p>
                      <p className="text-xs italic text-muted-foreground">
                        "{vocabDetails.usageExample}"
                      </p>
                    </div>
                  </>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {/* Language Toggle */}
      {/*<div className="flex items-center justify-between p-4 rounded-lg border-2 border-primary/20 bg-primary/5 shadow-sm">
        <div className="flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            {showTranslation ? "Showing: Translation" : "Showing: Original"}
          </span>
        </div>
        <Button
          variant="default"
          size="default"
          onClick={() => setShowTranslation(!showTranslation)}
          className="font-medium"
        >
          <Languages className="mr-2 h-4 w-4" />
          {showTranslation ? "Show Original" : "Show Translation"}
        </Button>
      </div>*/}

      {stories.map((story, storyIndex) => (
        <Card key={storyIndex} className="p-6 space-y-4">
          {/* Story Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Story {storyIndex + 1}
              </Badge>
              <h3 className="text-lg font-semibold">
                {showTranslation ? story.translatedTitle : story.title}
              </h3>
            </div>
            {!showTranslation && story.translatedTitle && (
              <p className="text-xs text-muted-foreground italic">
                Translation: {story.translatedTitle}
              </p>
            )}
          </div>

          {/* Story Content with Highlighted Words */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm leading-relaxed">
              {showTranslation
                ? story.translatedContent
                : highlightVocabulary(story.content, story.targetWords)}
            </p>
          </div>

          {/* Show translation as subtitle when viewing original */}
          {!showTranslation && story.translatedContent && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View translation
              </summary>
              <div className="mt-2 p-3 rounded-md bg-muted/30 border">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {story.translatedContent}
                </p>
              </div>
            </details>
          )}

          {/* Vocabulary Used in This Story */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Vocabulary used ({story.targetWords.length} words):
            </p>
            <div className="flex flex-wrap gap-2">
              {story.targetWords.map((word, wordIndex) => (
                <Badge
                  key={wordIndex}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {word}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      ))}

      {/* Overall Summary */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Total Stories:</span>
          <span className="text-muted-foreground">{stories.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="font-medium">Total Vocabulary Used:</span>
          <span className="text-muted-foreground">
            {new Set(stories.flatMap((s) => s.targetWords)).size} words
          </span>
        </div>
      </Card>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>
          💡 Click on any highlighted word (in original language) to see its
          meaning and pronunciation
        </p>
        <p>
          🌐 Toggle between original and translated versions using the button
          above
        </p>
      </div>
    </div>
  );
}
