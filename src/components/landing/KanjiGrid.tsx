"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { X } from "lucide-react";

const kanjiData = [
  { id: 1, kanji: "意", meaning: "mind, idea", reading: "い" },
  { id: 2, kanji: "学", meaning: "study, learn", reading: "がく" },
  { id: 3, kanji: "習", meaning: "practice", reading: "しゅう" },
  { id: 4, kanji: "言", meaning: "word, say", reading: "げん" },
  { id: 5, kanji: "葉", meaning: "leaf", reading: "よう" },
  { id: 6, kanji: "日", meaning: "day, sun", reading: "にち" },
  { id: 7, kanji: "月", meaning: "month, moon", reading: "げつ" },
  { id: 8, kanji: "火", meaning: "fire", reading: "か" },
  { id: 9, kanji: "水", meaning: "water", reading: "すい" },
  { id: 10, kanji: "木", meaning: "tree", reading: "もく" },
  { id: 11, kanji: "金", meaning: "gold, money", reading: "きん" },
  { id: 12, kanji: "土", meaning: "earth", reading: "ど" },
  { id: 13, kanji: "人", meaning: "person", reading: "じん" },
  { id: 14, kanji: "大", meaning: "big", reading: "だい" },
  { id: 15, kanji: "小", meaning: "small", reading: "しょう" },
  { id: 16, kanji: "中", meaning: "middle", reading: "ちゅう" },
  { id: 17, kanji: "上", meaning: "up, above", reading: "じょう" },
  { id: 18, kanji: "下", meaning: "down, below", reading: "か" },
  { id: 19, kanji: "左", meaning: "left", reading: "さ" },
  { id: 20, kanji: "右", meaning: "right", reading: "う" },
  { id: 21, kanji: "前", meaning: "front, before", reading: "ぜん" },
  { id: 22, kanji: "後", meaning: "back, after", reading: "ご" },
  { id: 23, kanji: "内", meaning: "inside", reading: "ない" },
  { id: 24, kanji: "外", meaning: "outside", reading: "がい" },
  { id: 25, kanji: "手", meaning: "hand", reading: "て" },
];

export function KanjiGrid() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedKanji = kanjiData.find((k) => k.id === selectedId);

  return (
    <div className="relative w-full">
      {/* Grid Container */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mb-8">
        <AnimatePresence>
          {kanjiData.map((item) => (
            <motion.div
              key={item.id}
              layoutId={`kanji-${item.id}`}
              onClick={() => setSelectedId(item.id)}
              className="aspect-square border-2 border-primary/40 bg-white/5 hover:border-primary/60 cursor-pointer flex items-center justify-center transition-colors relative"
              whileHover={{ 
                scale: 1.1,
                borderColor: "rgba(38,204,143,0.8)",
                backgroundColor: "rgba(38,204,143,0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl md:text-4xl font-black text-primary">
                {item.kanji}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Expanded Card - Morph in place */}
      <AnimatePresence>
        {selectedKanji && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Card - Morph in grid position */}
            <motion.div
              layoutId={`kanji-${selectedKanji.id}`}
              className="absolute inset-0 z-50 flex items-center justify-center"
            >
              <motion.div
                className="w-full max-w-md mx-4 aspect-square border-2 border-primary/60 bg-background flex flex-col items-center justify-center relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedId(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 transition-colors z-10"
                >
                  <X className="w-5 h-5 text-primary" />
                </button>

                {/* Content */}
                <div className="text-center space-y-6">
                  {/* Large Kanji */}
                  <div className="text-9xl font-black text-primary">
                    {selectedKanji.kanji}
                  </div>

                  {/* Reading */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Reading</div>
                    <div className="text-2xl font-bold text-primary">
                      {selectedKanji.reading}
                    </div>
                  </div>

                  {/* Meaning */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Meaning</div>
                    <div className="text-lg font-semibold">
                      {selectedKanji.meaning}
                    </div>
                  </div>

                  {/* ID */}
                  <div className="text-xs text-muted-foreground border-t border-white/10 pt-4">
                    Kanji #{selectedKanji.id}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
