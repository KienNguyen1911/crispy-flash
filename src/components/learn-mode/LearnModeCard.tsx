"use client";

import { Vocabulary } from "@prisma/client";
import { m } from "framer-motion";
import { Volume2 } from "lucide-react";

interface LearnModeCardProps {
  vocab: Vocabulary;
  isFlipped: boolean;
  showWordFirst: boolean;
  showPronunciation: boolean;
  onPlayAudio: (text: string) => void;
}

export function LearnModeCard({
  vocab,
  isFlipped,
  showWordFirst,
  showPronunciation,
  onPlayAudio
}: LearnModeCardProps) {
  const frontContent = showWordFirst ? vocab.word : vocab.meaning;
  const backContent = showWordFirst ? vocab.meaning : vocab.word;

  return (
    <m.div
      className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-lg p-8 flex flex-col justify-center items-center cursor-pointer select-none"
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden",
      }}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          {isFlipped ? "Answer" : "Question"}
        </p>
        <h2 className="text-4xl font-bold text-primary mb-6 break-words">
          {isFlipped ? backContent : frontContent}
        </h2>

        {!isFlipped && showPronunciation && vocab.pronunciation && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <p className="text-lg text-muted-foreground italic">
              {vocab.pronunciation}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio(vocab.pronunciation || "");
              }}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Volume2 className="w-5 h-5 text-primary" />
            </button>
          </div>
        )}

        {vocab.part_of_speech && (
          <p className="text-xs text-muted-foreground mt-4 bg-muted px-3 py-1 rounded-full inline-block">
            {vocab.part_of_speech}
          </p>
        )}
      </div>
    </m.div>
  );
}
