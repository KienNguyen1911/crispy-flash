"use client";

import { LazyMotion, m } from "framer-motion";
import { domAnimation } from "framer-motion/m";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";

interface SessionCompleteProps {
  onRestart: () => void;
  onClose: () => void;
}

export const SessionComplete = ({ onRestart, onClose }: SessionCompleteProps) => (
  <LazyMotion features={domAnimation}>
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bg-background inset-0 z-50 flex flex-col items-center justify-center text-foreground"
      style={{
        backgroundImage:
          "radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="text-center"
      >
        <m.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <Check
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "hsl(var(--clr-success-a10))" }}
          />
        </m.div>
        <m.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-2xl font-bold mb-2"
        >
          Session Complete!
        </m.h2>
        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-muted-foreground mb-6"
        >
          You have reviewed all the flashcards.
        </m.p>
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex gap-4"
        >
          <Button onClick={onRestart} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </Button>
          <Button onClick={onClose}>Close</Button>
        </m.div>
      </m.div>
    </m.div>
  </LazyMotion>
);
