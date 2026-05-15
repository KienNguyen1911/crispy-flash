"use client";

import { motion } from "motion/react";

export function LearningTimelineIllustration() {
  const milestones = [
    { month: "Month 1", kanji: "100", label: "Hiragana" },
    { month: "Month 2", kanji: "300", label: "Katakana" },
    { month: "Month 3", kanji: "500", label: "N3 Prep" },
    { month: "Month 6", kanji: "1000+", label: "N2 Ready" },
  ];

  return (
    <motion.svg
      viewBox="0 0 400 150"
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Timeline Line */}
      <line x1="20" y1="75" x2="380" y2="75" stroke="rgba(38,204,143,0.3)" strokeWidth="2"/>

      {/* Milestones */}
      {milestones.map((milestone, idx) => (
        <motion.g
          key={idx}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 + idx * 0.15 }}
        >
          {/* Circle */}
          <circle 
            cx={50 + idx * 110} 
            cy="75" 
            r="12" 
            fill={idx === 3 ? "rgba(38,204,143,0.8)" : "rgba(38,204,143,0.3)"}
            stroke="rgba(38,204,143,0.8)"
            strokeWidth="2"
          />

          {/* Label */}
          <text 
            x={50 + idx * 110} 
            y="105" 
            textAnchor="middle" 
            className="text-xs fill-muted-foreground font-semibold"
          >
            {milestone.month}
          </text>

          {/* Kanji Count */}
          <text 
            x={50 + idx * 110} 
            y="35" 
            textAnchor="middle" 
            className="text-sm fill-primary font-bold"
          >
            {milestone.kanji}
          </text>

          {/* Sublabel */}
          <text 
            x={50 + idx * 110} 
            y="125" 
            textAnchor="middle" 
            className="text-xs fill-muted-foreground"
          >
            {milestone.label}
          </text>
        </motion.g>
      ))}
    </motion.svg>
  );
}
