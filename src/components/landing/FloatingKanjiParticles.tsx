"use client";

import { motion } from "motion/react";

export function FloatingKanjiParticles() {
  const kanji = ["意", "学", "習", "言", "葉"];

  const getRandomPosition = (index: number) => {
    const positions = [
      { x: 20, y: -30 },
      { x: 60, y: -50 },
      { x: 100, y: -20 },
      { x: 140, y: -60 },
      { x: 80, y: 20 },
    ];
    return positions[index];
  };

  const getRandomDuration = (index: number) => {
    return 4 + index * 0.5;
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {kanji.map((char, idx) => (
        <motion.div
          key={idx}
          initial={{
            x: getRandomPosition(idx).x,
            y: getRandomPosition(idx).y,
            opacity: 0.3,
            scale: 0.8,
          }}
          animate={{
            y: [getRandomPosition(idx).y, getRandomPosition(idx).y - 80, getRandomPosition(idx).y],
            rotate: [0, 360],
            scale: [0.8, 1.1, 0.8],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: getRandomDuration(idx),
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute text-4xl font-black text-primary border-2 border-primary/60 px-3 py-2"
        >
          {char}
        </motion.div>
      ))}
    </div>
  );
}
