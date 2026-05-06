"use client";

import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface VocabularyItem {
  id: string;
  word: string;
  pronunciation?: string;
  meaning: string;
  usageExample?: string;
}

interface LearnModePublicCardProps {
  vocab: VocabularyItem;
  isFlipped: boolean;
  showWordFirst: boolean;
  showPronunciation: boolean;
  onPlayAudio: (text: string) => void;
}

export function LearnModePublicCard({
  vocab,
  isFlipped,
  showWordFirst,
  showPronunciation,
  onPlayAudio
}: LearnModePublicCardProps) {
  return (
    <>
      <div
        className="absolute w-full h-full bg-card border border-border rounded-lg shadow-lg flex flex-col items-center justify-center p-6"
        style={{ backfaceVisibility: "hidden" }}
      >
        {showWordFirst ? (
          <>
            {vocab.word && (
              <h2 className="text-5xl font-bold mb-2 text-center">
                {vocab.word}
              </h2>
            )}
            {vocab.pronunciation && showPronunciation && (
              <p className="text-xl text-muted-foreground">
                {vocab.pronunciation}
              </p>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio(vocab.word || vocab.pronunciation || "");
              }}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
          </>
        ) : (
          <>
            <p className="text-2xl font-semibold text-center">
              {vocab.meaning}
            </p>
            {vocab.usageExample && (
              <p className="text-lg text-muted-foreground mt-4 text-center italic">
                {vocab.usageExample}
              </p>
            )}
          </>
        )}
      </div>

      <div
        className="absolute w-full h-full bg-card border border-border rounded-lg shadow-lg flex flex-col items-center justify-center p-6"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        {showWordFirst ? (
          <>
            <p className="text-2xl font-semibold text-center">
              {vocab.meaning}
            </p>
            {vocab.pronunciation && (
              <p className="text-lg text-muted-foreground mt-2 text-center">
                {vocab.pronunciation}
              </p>
            )}
            {vocab.usageExample && (
              <p className="text-lg text-muted-foreground mt-4 text-center italic">
                {vocab.usageExample}
              </p>
            )}
          </>
        ) : (
          <>
            {vocab.word && (
              <h2 className="text-5xl font-bold mb-2 text-center">
                {vocab.word}
              </h2>
            )}
            {vocab.pronunciation && (
              <p className="text-xl text-muted-foreground">
                {vocab.pronunciation}
              </p>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio(vocab.word || vocab.pronunciation || "");
              }}
            >
              <Volume2 className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
    </>
  );
}
