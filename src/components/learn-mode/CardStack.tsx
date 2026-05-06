"use client";

import { LazyMotion, m } from "framer-motion";
import { domAnimation } from "framer-motion/m";
import { Vocabulary } from "@prisma/client";
import { LearnModeCard } from "./LearnModeCard";

interface CardDisplayState {
  isFlipped: boolean;
  showWordFirst: boolean;
  showPronunciation: boolean;
}

interface CardProps {
  vocab: Vocabulary;
  displayState: CardDisplayState;
  onPlayAudio: (text: string) => void;
}

const Card = ({ vocab, displayState, onPlayAudio }: CardProps) => (
  <LearnModeCard
    vocab={vocab}
    isFlipped={displayState.isFlipped}
    showWordFirst={displayState.showWordFirst}
    showPronunciation={displayState.showPronunciation}
    onPlayAudio={onPlayAudio}
  />
);

interface CardStackProps {
  currentVocab: Vocabulary;
  currentIndex: number;
  totalCards: number;
  displayState: CardDisplayState & { isFlipping: boolean };
  swipeDirection: "left" | "right" | null;
  previousIndex: number | null;
  vocabularies: Vocabulary[];
  onCardClick: () => void;
  onPlayAudio: (text: string) => void;
}

export const CardStack = ({
  currentVocab,
  currentIndex,
  totalCards,
  displayState,
  swipeDirection,
  previousIndex,
  vocabularies,
  onCardClick,
  onPlayAudio,
}: CardStackProps) => {

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center text-foreground"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-md px-4"
          style={{ perspective: 1000 }}
        >
          <div className="flex justify-center mb-4">
            <p className="text-sm md:text-base text-muted-foreground">
              {currentIndex + 1} / {totalCards}
            </p>
          </div>

          <div className="relative aspect-[3/3] w-full">
            {/* Background cards (stack effect) */}
            {[2, 1].map((offset) => {
              const cardIndex = currentIndex + offset;
              if (cardIndex >= totalCards) return null;

              const adjustedOffset = swipeDirection ? offset - 1 : offset;

              return (
                <m.div
                  key={cardIndex}
                  className="absolute w-full h-full bg-card border border-border rounded-lg"
                  animate={{
                    top: `${adjustedOffset * 20}px`,
                    scale: 1 - adjustedOffset * 0.06,
                    opacity: adjustedOffset <= 1 ? 1 - adjustedOffset * 0.25 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    left: 0,
                    zIndex: -offset,
                    pointerEvents: "none",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  }}
                />
              );
            })}

            {/* Previous card (swiping out) */}
            {previousIndex !== null && (
              <m.div
                key={`prev-${previousIndex}`}
                className="absolute w-full h-full cursor-pointer"
                style={{ transformStyle: "preserve-3d", zIndex: 11 }}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{
                  x: swipeDirection === "left" ? -1000 : 1000,
                  y: 100,
                  rotate: swipeDirection === "left" ? -15 : 15,
                  opacity: 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  vocab={vocabularies[previousIndex]}
                  displayState={displayState}
                  onPlayAudio={onPlayAudio}
                />
              </m.div>
            )}

            {/* Current card */}
            <m.div
              key={currentIndex}
              className="absolute w-full h-full cursor-pointer"
              style={{ transformStyle: "preserve-3d", zIndex: 10 }}
              initial={
                swipeDirection
                  ? { scale: 0.97, opacity: 0.7, top: 8 }
                  : { scale: 1, opacity: 1 }
              }
              animate={{
                rotateY: displayState.isFlipped ? 180 : 0,
                scale: displayState.isFlipping ? 1.08 : 1,
                opacity: 1,
                top: 0,
              }}
              transition={{
                duration: swipeDirection ? 0.3 : 0.4,
                scale: {
                  duration: 0.15,
                  ease: "easeOut",
                },
                rotateY: {
                  duration: 0.4,
                  ease: "easeInOut",
                },
              }}
              onClick={onCardClick}
            >
              <Card
                vocab={currentVocab}
                displayState={displayState}
                onPlayAudio={onPlayAudio}
              />
            </m.div>
          </div>
        </m.div>
      </m.div>
    </LazyMotion>
  );
};
