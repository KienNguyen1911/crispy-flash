"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, BookOpenCheck, Share2 } from "lucide-react";

interface TopicActionsProps {
  hasVocabulary: boolean;
  isGenerating: boolean;
  contentGenerationStatus?: string;
  onLearn: () => void;
  onShare: () => void;
  onGenerateContent: () => void;
}

export const TopicActions = ({
  hasVocabulary,
  isGenerating,
  contentGenerationStatus,
  onLearn,
  onShare,
  onGenerateContent,
}: TopicActionsProps) => (
  <div className="mt-4 flex flex-wrap justify-end gap-2">
    <Button
      onClick={onLearn}
      disabled={!hasVocabulary}
      className="gap-2"
    >
      <BookOpenCheck className="h-4 w-4" />
      Learn
    </Button>
    <Button
      onClick={onShare}
      variant="outline"
      className="gap-2"
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
    <Button
      onClick={onGenerateContent}
      disabled={
        !hasVocabulary ||
        contentGenerationStatus === "GENERATING" ||
        isGenerating
      }
      className="gap-2"
      variant={
        contentGenerationStatus === "COMPLETED"
          ? "outline"
          : "default"
      }
    >
      {isGenerating || contentGenerationStatus === "GENERATING" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : contentGenerationStatus === "COMPLETED" ? (
        <>
          <Sparkles className="h-4 w-4" />
          View Story
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Generate Story
        </>
      )}
    </Button>
  </div>
);
