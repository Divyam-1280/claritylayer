"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Diamond,
  HelpCircle,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react";
import type { PillType } from "@/lib/types";

interface AccordionItem {
  sentence: string;
  reason: string;
  label?: string;
}

interface AccordionSectionProps {
  title: string;
  type: PillType;
  items: AccordionItem[];
  defaultOpen?: boolean;
}

const SECTION_CONFIG: Record<
  PillType,
  {
    icon: React.ElementType;
    color: string;
    pillBg: string;
    pillText: string;
    reasonIcon: React.ElementType;
  }
> = {
  assumption: {
    icon: Diamond,
    color: "#4338CA",
    pillBg: "bg-[#4338CA]",
    pillText: "text-white",
    reasonIcon: Diamond,
  },
  uncertain: {
    icon: HelpCircle,
    color: "#D97706",
    pillBg: "bg-[#D97706]",
    pillText: "text-white",
    reasonIcon: HelpCircle,
  },
  gap: {
    icon: AlertTriangle,
    color: "#DC2626",
    pillBg: "bg-[#DC2626]",
    pillText: "text-white",
    reasonIcon: AlertTriangle,
  },
  alternative: {
    icon: ArrowLeftRight,
    color: "#16A34A",
    pillBg: "bg-[#16A34A]",
    pillText: "text-white",
    reasonIcon: ArrowLeftRight,
  },
};

export default function AccordionSection({
  title,
  type,
  items,
  defaultOpen = false,
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = SECTION_CONFIG[type];
  const Icon = config.icon;
  const ReasonIcon = config.reasonIcon;

  return (
    <div className="border-b border-[#E4E2DC]">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-3 hover:bg-[#EFEDE8] transition-colors duration-150 rounded-md"
      >
        <div className="flex items-center gap-2.5">
          <Icon
            className="h-4 w-4 shrink-0"
            style={{ color: config.color }}
          />
          <span className="text-[15px] font-medium text-[#18181B]">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`
              inline-flex items-center justify-center h-5 min-w-[20px] px-1.5
              text-[11px] font-semibold rounded-full
              ${config.pillBg} ${config.pillText}
            `}
          >
            {items.length}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-[#6B7280]" />
          </motion.div>
        </div>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-3 flex flex-col gap-3">
              {items.length === 0 ? (
                <p className="text-[13px] text-[#9CA3AF] italic px-2 py-2">
                  No items found in this category.
                </p>
              ) : (
                items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[12px] p-3.5 border border-[#E4E2DC]/60"
                  >
                    <p className="text-[14px] text-[#18181B] leading-relaxed mb-1.5">
                      {item.sentence}
                    </p>
                    <div className="flex items-start gap-1.5">
                      <ReasonIcon
                        className="h-3.5 w-3.5 mt-0.5 shrink-0"
                        style={{ color: config.color, opacity: 0.6 }}
                      />
                      <p className="text-[13px] italic text-[#6B7280] leading-relaxed">
                        {item.reason}
                        {item.label && (
                          <span
                            className="ml-1.5 not-italic text-[12px] font-medium px-2 py-0.5 rounded-full"
                            style={{
                              color: config.color,
                              backgroundColor: `${config.color}15`,
                            }}
                          >
                            {item.label}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
