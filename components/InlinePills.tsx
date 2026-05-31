"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { InlinePhrase, PillType } from "@/lib/types";
import { PILL_COLORS } from "@/lib/types";

interface InlinePillsProps {
  text: string;
  phrases: InlinePhrase[];
  activeFilter: PillType | null;
  onPillClick?: (type: PillType) => void;
}

interface TextSegment {
  text: string;
  phrase?: InlinePhrase;
  index: number;
}

export default function InlinePills({
  text,
  phrases,
  activeFilter,
  onPillClick,
}: InlinePillsProps) {
  const segments = useMemo(() => {
    if (!phrases || phrases.length === 0) {
      return [{ text, index: 0 }] as TextSegment[];
    }

    const result: TextSegment[] = [];
    let remaining = text;
    let globalIndex = 0;

    // Sort phrases by position in text to process in order
    const sortedPhrases = [...phrases].sort((a, b) => {
      const posA = text.toLowerCase().indexOf(a.phrase.toLowerCase());
      const posB = text.toLowerCase().indexOf(b.phrase.toLowerCase());
      return posA - posB;
    });

    for (const phrase of sortedPhrases) {
      const lowerRemaining = remaining.toLowerCase();
      const lowerPhrase = phrase.phrase.toLowerCase();
      const idx = lowerRemaining.indexOf(lowerPhrase);

      if (idx === -1) continue;

      // Add text before the phrase
      if (idx > 0) {
        result.push({ text: remaining.slice(0, idx), index: globalIndex++ });
      }

      // Add the phrase with metadata
      result.push({
        text: remaining.slice(idx, idx + phrase.phrase.length),
        phrase,
        index: globalIndex++,
      });

      remaining = remaining.slice(idx + phrase.phrase.length);
    }

    // Add remaining text
    if (remaining.length > 0) {
      result.push({ text: remaining, index: globalIndex++ });
    }

    return result;
  }, [text, phrases]);

  return (
    <span>
      {segments.map((segment) => {
        if (!segment.phrase) {
          return <span key={segment.index}>{segment.text}</span>;
        }

        const colors = PILL_COLORS[segment.phrase.type];
        const isFiltered =
          activeFilter !== null && activeFilter !== segment.phrase.type;

        return (
          <motion.span
            key={segment.index}
            initial={{ opacity: 0, y: 2 }}
            animate={{
              opacity: isFiltered ? 0.2 : 1,
              y: 0,
            }}
            transition={{
              duration: 0.15,
              delay: segment.index * 0.05,
            }}
            onClick={() => onPillClick?.(segment.phrase!.type)}
            className={`
              inline-flex items-center gap-1 px-2 py-[1px] mx-[1px]
              text-[12px] font-medium rounded-full border cursor-pointer
              transition-opacity duration-150
              ${colors.bg} ${colors.border} ${colors.text}
            `}
          >
            <span
              className={`inline-block w-[5px] h-[5px] rounded-full ${colors.dot}`}
            />
            {segment.text}
          </motion.span>
        );
      })}
    </span>
  );
}
