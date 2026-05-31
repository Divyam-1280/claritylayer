"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ConfidenceBarProps {
  score: number;
  label: string;
  reason: string;
}

function getScoreColor(score: number) {
  if (score < 50) return { text: "text-[#DC2626]", bg: "bg-[#DC2626]" };
  if (score <= 70) return { text: "text-[#D97706]", bg: "bg-[#D97706]" };
  return { text: "text-[#16A34A]", bg: "bg-[#16A34A]" };
}

export default function ConfidenceBar({ score, label, reason }: ConfidenceBarProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const colors = getScoreColor(score);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    setAnimatedScore(0);
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [score]);

  return (
    <div className="bg-white border border-[#E4E2DC] rounded-[12px] p-5">
      {/* Score and Label */}
      <div className="flex items-baseline gap-3 mb-3">
        <span
          className={`text-[72px] leading-none font-semibold tabular-nums ${colors.text}`}
        >
          {animatedScore}
        </span>
        <span className={`text-[14px] font-medium ${colors.text}`}>
          {label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-[#E4E2DC] rounded-full overflow-hidden mb-3">
        <motion.div
          className={`h-full rounded-full ${colors.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Reason */}
      <p className="text-[13px] text-[#6B7280] leading-relaxed">{reason}</p>
    </div>
  );
}
