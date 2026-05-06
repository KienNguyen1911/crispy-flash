"use client";

import { Button } from "@/components/ui/button";
import { m } from "framer-motion";
import { X, Redo2, Check } from "lucide-react";

interface LearnModePublicControlsProps {
  currentIndex: number;
  totalCards: number;
  showWordFirst: boolean;
  showPronunciation: boolean;
  rememberedCount: number;
  notRememberedCount: number;
  onRemembered: () => void;
  onNotRemembered: () => void;
  onPrev: () => void;
  onToggleShowMode: () => void;
  onTogglePronunciation: () => void;
}

export function LearnModePublicControls({
  currentIndex,
  totalCards,
  showWordFirst,
  showPronunciation,
  rememberedCount,
  notRememberedCount,
  onRemembered,
  onNotRemembered,
  onPrev,
  onToggleShowMode,
  onTogglePronunciation
}: LearnModePublicControlsProps) {
  return (
    <>
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="flex justify-center items-center gap-4 mt-6"
      >
        <Button
          onClick={onToggleShowMode}
          variant={showWordFirst ? "warning" : "outline"}
          size="sm"
        >
          {showWordFirst ? "Meaning First" : "Word First"}
        </Button>
        <Button
          onClick={onTogglePronunciation}
          variant={showPronunciation ? "warning" : "outline"}
          size="sm"
        >
          {showPronunciation ? "Hide" : "Show"} Pronunciation
        </Button>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="mt-20 flex justify-center items-center gap-6"
      >
        <Button
          onClick={onNotRemembered}
          variant="destructive"
          size="icon"
          className="w-20 h-20 rounded-full transition-transform hover:scale-110"
        >
          <X style={{ width: "2rem", height: "2rem" }} />
        </Button>
        <Button
          onClick={onPrev}
          disabled={currentIndex === 0}
          variant="outline"
          size="icon"
          className="w-16 h-16 rounded-full transition-transform hover:scale-110 bg-primary"
        >
          <Redo2 style={{ width: "1.5rem", height: "1.5rem" }} />
        </Button>
        <Button
          onClick={onRemembered}
          variant="success"
          size="icon"
          className="w-20 h-20 rounded-full transition-transform hover:scale-110"
        >
          <Check style={{ width: "2rem", height: "2rem" }} />
        </Button>
      </m.div>

      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="mt-4 flex justify-center text-sm text-muted-foreground gap-4"
      >
        <span>{currentIndex + 1} / {totalCards}</span>
        <span>✓ {rememberedCount}</span>
        <span>✗ {notRememberedCount}</span>
      </m.div>
    </>
  );
}
