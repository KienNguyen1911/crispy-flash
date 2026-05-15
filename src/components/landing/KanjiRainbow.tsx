"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen } from "lucide-react";

const KANJI_DATA = [
  { id: 1, char: "語", meaning: "word, language", reading: "go", example: "日本語 (Japanese)" },
  { id: 2, char: "学", meaning: "study, learning", reading: "gaku", example: "学生 (Student)" },
  { id: 3, char: "生", meaning: "life, birth", reading: "sei", example: "先生 (Teacher)" },
  { id: 4, char: "話", meaning: "talk, speak", reading: "wa", example: "会話 (Conversation)" },
  { id: 5, char: "読", meaning: "read", reading: "doku", example: "読書 (Reading)" },
];

export function KanjiRainbow() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const radius = 280; // Distance from center of CometCard
  const centerAngle = -Math.PI / 2; // -90 degrees (top)
  const angleSpread = Math.PI / 1.5; // Spread angle

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
      {KANJI_DATA.map((kanji, index) => {
        const angle = centerAngle - angleSpread / 2 + (angleSpread / (KANJI_DATA.length - 1)) * index;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isHovered = hoveredId === kanji.id;

        return (
          <div
            key={kanji.id}
            className="absolute pointer-events-auto"
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onMouseEnter={() => setHoveredId(kanji.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <motion.div
              layout
              className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                isHovered ? "z-50" : "z-10"
              }`}
            >
              <AnimatePresence mode="wait">
                {!isHovered ? (
                  <motion.div
                    key="small"
                    layoutId={`card-${kanji.id}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className="w-16 h-16 rounded-2xl bg-card/80 backdrop-blur-md border border-white/10 hover:border-primary/50 shadow-lg flex items-center justify-center"
                  >
                    <motion.span layoutId={`text-${kanji.id}`} className="text-3xl font-bold font-headline text-foreground/80">
                      {kanji.char}
                    </motion.span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="large"
                    layoutId={`card-${kanji.id}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-card/95 backdrop-blur-xl border border-primary/30 rounded-2xl shadow-[0_0_40px_rgba(38,204,143,0.3)] p-5 overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <motion.span layoutId={`text-${kanji.id}`} className="text-5xl font-bold font-headline text-primary drop-shadow-md">
                        {kanji.char}
                      </motion.span>
                      <span className="text-xs font-semibold text-primary-foreground bg-primary/80 px-2 py-1 rounded-md border border-white/10 shadow-sm">{kanji.reading}</span>
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-3"
                    >
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Meaning</p>
                        <p className="text-sm font-medium text-foreground">{kanji.meaning}</p>
                      </div>
                      <div className="h-px w-full bg-border/50" />
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-primary" /> Example
                        </p>
                        <p className="text-sm font-medium text-foreground">{kanji.example}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
