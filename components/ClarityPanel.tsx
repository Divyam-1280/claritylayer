"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";
import ConfidenceBar from "./ConfidenceBar";
import AccordionSection from "./AccordionSection";
import type { AuditData, PillType } from "@/lib/types";
import { PILL_COLORS } from "@/lib/types";

interface ClarityPanelProps {
  auditData: AuditData;
  isReanalysing: boolean;
  wasRefined: boolean;
  diffSummary?: string;
}

export default function ClarityPanel({
  auditData,
  isReanalysing,
  wasRefined,
  diffSummary,
}: ClarityPanelProps) {
  const allEmpty =
    auditData.assumptions.length === 0 &&
    auditData.uncertainClaims.length === 0 &&
    auditData.gaps.length === 0 &&
    auditData.alternatives.length === 0;

  return (
    <div className="h-full flex flex-col relative">
      {/* Re-analysing overlay */}
      <AnimatePresence>
        {isReanalysing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#F7F6F3]/90 z-10 flex items-center justify-center rounded-xl"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#4338CA]" />
              <span className="text-[14px] text-[#6B7280] font-medium">
                Re-analysing with your context...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-4">
        <h2 className="text-[18px] font-medium text-[#18181B]">
          Clarity Audit
        </h2>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">
          Analysed just now · Powered by Gemini
        </p>
      </div>

      {/* Refined banner */}
      <AnimatePresence>
        {wasRefined && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="bg-[#ECFDF5] rounded-[12px] px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-[#065F46]" />
                <span className="text-[13px] font-medium text-[#065F46]">
                  Contextualised — based on your input
                </span>
              </div>
              {diffSummary && (
                <p className="text-[12px] text-[#065F46]/80 ml-6">
                  {diffSummary}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Confidence Card */}
        <div className="mb-5">
          <ConfidenceBar
            score={auditData.confidenceScore}
            label={auditData.confidenceLabel}
            reason={auditData.confidenceReason}
          />
        </div>

        {/* Empty state */}
        {allEmpty ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#ECFDF5] flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-[#16A34A]" />
            </div>
            <p className="text-[14px] text-[#6B7280] max-w-[300px] leading-relaxed">
              This response looks clean — no major assumptions, gaps, or
              uncertain claims detected.
            </p>
          </div>
        ) : (
          <>
            {/* Accordion sections */}
            <div className="mb-5">
              <AccordionSection
                title="Assumptions"
                type="assumption"
                items={auditData.assumptions}
                defaultOpen={true}
              />
              <AccordionSection
                title="Uncertain Claims"
                type="uncertain"
                items={auditData.uncertainClaims}
                defaultOpen={false}
              />
              <AccordionSection
                title="What's Missing"
                type="gap"
                items={auditData.gaps}
                defaultOpen={false}
              />
              <AccordionSection
                title="Alternative Perspectives"
                type="alternative"
                items={auditData.alternatives.map((a) => ({
                  sentence: a.sentence,
                  reason: a.reason,
                  label: a.label,
                }))}
                defaultOpen={false}
              />
            </div>
          </>
        )}

        {/* Color legend */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#E4E2DC]">
          {(
            Object.entries(PILL_COLORS) as [
              PillType,
              (typeof PILL_COLORS)[PillType]
            ][]
          ).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${colors.dot}`}
              />
              <span className="text-[12px] text-[#9CA3AF] capitalize">
                {type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
