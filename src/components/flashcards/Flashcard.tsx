'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Vocabulary } from '@/lib/types';
import { Card, CardContent } from '../ui/card';

interface FlashcardProps {
  vocabulary: Vocabulary;
}

export default function Flashcard({ vocabulary }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => setIsFlipped(!isFlipped);

  if (!vocabulary) {
    return null;
  }

  return (
    <div className="w-full h-80 perspective-1000">
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        onClick={flipCard}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full backface-hidden">
          <Card className="w-full h-full flex items-center justify-center cursor-pointer">
            <CardContent className="p-6 text-center">
              <p className="text-6xl font-headline mb-4">{vocabulary.kanji}</p>
              <p className="text-2xl text-muted-foreground">{vocabulary.kana}</p>
            </CardContent>
          </Card>
        </div>

        {/* Back of the card */}
        <div className="absolute w-full h-full backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
            <Card className="w-full h-full flex items-center justify-center cursor-pointer">
            <CardContent className="p-6 text-center">
              <p className="text-4xl font-headline mb-4">{vocabulary.meaning}</p>
              {vocabulary.usageExample && (
                <p className="text-lg text-muted-foreground italic mt-6">{vocabulary.usageExample}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

// Add these utility classes to globals.css or a new CSS file if they don't exist
// .perspective-1000 { perspective: 1000px; }
// .backface-hidden { backface-visibility: hidden; }
// Make sure to add them without the comment wrappers.
// For this project, I will add them directly to globals.css for simplicity.
// In globals.css under @tailwind utilities:
/*
@layer utilities {
  .perspective-1000 {
    perspective: 1000px;
  }
  .backface-hidden {
    backface-visibility: hidden;
  }
}
*/
// It's better to add this via tailwind.config.ts but for simplicity I will add to globals.css
// I will add to globals.css
// No, I cannot modify globals.css this way. I will use inline styles with backfaceVisibility.
