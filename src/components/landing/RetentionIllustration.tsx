"use client";

import { motion } from "motion/react";

export function RetentionIllustration() {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Grid Background */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(38,204,143,0.1)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#grid)" />

      {/* Bars - Traditional vs Lingofy */}
      <motion.g
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Traditional Bar */}
        <rect x="20" y="120" width="30" height="60" fill="rgba(239,68,68,0.3)" stroke="rgba(239,68,68,0.6)" strokeWidth="2"/>
        <text x="35" y="195" textAnchor="middle" className="text-xs fill-muted-foreground">40%</text>

        {/* Lingofy Bar */}
        <motion.rect 
          x="110" y="40" width="30" height="140" 
          fill="rgba(38,204,143,0.3)" 
          stroke="rgba(38,204,143,0.8)" 
          strokeWidth="2"
          initial={{ height: 0, y: 180 }}
          animate={{ height: 140, y: 40 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        <text x="125" y="195" textAnchor="middle" className="text-xs fill-primary font-bold">95%</text>
      </motion.g>

      {/* Arrow */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <path d="M 70 100 L 100 100" stroke="rgba(38,204,143,0.5)" strokeWidth="2" markerEnd="url(#arrowhead)"/>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="rgba(38,204,143,0.5)" />
          </marker>
        </defs>
      </motion.g>
    </motion.svg>
  );
}
