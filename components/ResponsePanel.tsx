"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ArrowRight } from "lucide-react";
import InlinePills from "./InlinePills";
import type {
  InlinePhrase,
  PillType,
  MatchFeedback,
} from "@/lib/types";
import { FEEDBACK_GUIDANCE, PILL_COLORS } from "@/lib/types";

interface ResponsePanelProps {
  response: string;
  inlinePhrases: InlinePhrase[];
  onNewQuestion: () => void;
}

export default function ResponsePanel({
  response,
  inlinePhrases,
  onNewQuestion,
}: ResponsePanelProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<MatchFeedback | null>(null);
  const [activeFilter, setActiveFilter] = useState<PillType | null>(null);

  const wordCount = useMemo(() => {
    return response.trim().split(/\s+/).filter(Boolean).length;
  }, [response]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePillClick = (type: PillType) => {
    setActiveFilter((prev) => (prev === type ? null : type));
  };

  const handleFeedback = (f: MatchFeedback) => {
    setFeedback((prev) => (prev === f ? null : f));
  };

  // Split response into paragraphs for rendering
  const paragraphs = response.split(/\n\n+/).filter(Boolean);

  return (
    <div className="h-full flex flex-col">
      {/* Header label */}
      <div className="mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Gemini&apos;s response
        </span>
      </div>

      {/* Response text with inline pills */}
      <div className="flex-1 overflow-y-auto mb-6 pr-1">
        <div className="prose-container">
          {paragraphs.map((paragraph, i) => {
            // Check if it looks like a code block
            if (paragraph.startsWith("```")) {
              const lines = paragraph.split("\n");
              const code = lines.slice(1, -1).join("\n") || lines.slice(1).join("\n");
              return (
                <pre
                  key={i}
                  className="bg-[#F7F6F3] rounded-[8px] p-4 text-[13px] font-mono text-[#18181B] overflow-x-auto mb-4 border border-[#E4E2DC]/50"
                >
                  <code>{code}</code>
                </pre>
              );
            }

            // Check if it looks like a heading (markdown style)
            const headingMatch = paragraph.match(/^(#{1,3})\s+(.+)/);
            if (headingMatch) {
              const level = headingMatch[1].length;
              const text = headingMatch[2];
              const sizes: Record<number, string> = {
                1: "text-[18px]",
                2: "text-[16px]",
                3: "text-[15px]",
              };
              return (
                <p
                  key={i}
                  className={`${sizes[level] || "text-[15px]"} font-semibold text-[#18181B] mb-3`}
                >
                  {text}
                </p>
              );
            }

            // Check if it's a list
            const listItems = paragraph.split("\n").filter((l) => /^[\-\*\d+\.]\s/.test(l.trim()));
            if (listItems.length > 1) {
              return (
                <ul key={i} className="mb-4 space-y-1.5">
                  {paragraph.split("\n").map((line, j) => {
                    const cleaned = line.replace(/^[\-\*]\s+/, "").replace(/^\d+\.\s+/, "");
                    return (
                      <li
                        key={j}
                        className="text-[15px] text-[#18181B] leading-[1.75] pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#9CA3AF]"
                      >
                        <InlinePills
                          text={cleaned}
                          phrases={inlinePhrases}
                          activeFilter={activeFilter}
                          onPillClick={handlePillClick}
                        />
                      </li>
                    );
                  })}
                </ul>
              );
            }

            // Regular paragraph
            return (
              <p
                key={i}
                className="text-[15px] text-[#18181B] leading-[1.75] mb-4 font-[family-name:var(--font-geist-sans)]"
              >
                <InlinePills
                  text={paragraph}
                  phrases={inlinePhrases}
                  activeFilter={activeFilter}
                  onPillClick={handlePillClick}
                />
              </p>
            );
          })}
        </div>
      </div>

      {/* Pill filter legend */}
      {inlinePhrases.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-5 pb-4 border-t border-[#E4E2DC] pt-4">
          {(
            Object.entries(PILL_COLORS) as [
              PillType,
              (typeof PILL_COLORS)[PillType]
            ][]
          ).map(([type, colors]) => (
            <button
              key={type}
              onClick={() => handlePillClick(type)}
              className={`
                flex items-center gap-1.5 text-[12px] transition-opacity duration-150
                ${activeFilter && activeFilter !== type ? "opacity-25" : "opacity-100"}
              `}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${colors.dot}`}
              />
              <span className="text-[#6B7280] capitalize">{type}</span>
            </button>
          ))}
        </div>
      )}

      {/* Feedback section */}
      <div className="border-t border-[#E4E2DC] pt-4 mb-5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] block mb-3">
          Does this match your situation?
        </span>
        <div className="flex flex-wrap gap-2 mb-2">
          {(Object.keys(FEEDBACK_GUIDANCE) as MatchFeedback[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFeedback(f)}
              className={`
                px-4 py-2 text-[13px] font-medium rounded-full border
                transition-all duration-150
                ${
                  feedback === f
                    ? "bg-[#4338CA] text-white border-[#4338CA]"
                    : "bg-white text-[#18181B] border-[#E4E2DC] hover:border-[#D4D4D8]"
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[13px] text-[#6B7280] mt-2"
          >
            {FEEDBACK_GUIDANCE[feedback]}
          </motion.p>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between border-t border-[#E4E2DC] pt-4">
        <span className="text-[13px] text-[#9CA3AF]">{wordCount} words</span>
        <div className="flex items-center gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#18181B] transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                <span className="text-[#16A34A]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy response</span>
              </>
            )}
          </button>
          <button
            onClick={onNewQuestion}
            className="flex items-center gap-1 text-[13px] text-[#4338CA] hover:text-[#3730A3] font-medium transition-colors"
          >
            New question
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
