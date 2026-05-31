"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

interface RefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    purpose: string;
    corrections: string;
    rating: string;
    priorities: string[];
    rerunQuery: boolean;
  }) => void;
}

const RATINGS = ["Not useful", "Somewhat", "Mostly useful", "Very useful"];
const PRIORITIES = [
  "Accuracy",
  "Completeness",
  "Tone",
  "Specificity",
  "Brevity",
  "Evidence",
  "Examples",
  "Nuance",
];

export default function RefineModal({
  isOpen,
  onClose,
  onSubmit,
}: RefineModalProps) {
  const [purpose, setPurpose] = useState("");
  const [corrections, setCorrections] = useState("");
  const [rating, setRating] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [rerunQuery, setRerunQuery] = useState(false);

  const togglePriority = (p: string) => {
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = () => {
    onSubmit({ purpose, corrections, rating, priorities, rerunQuery });
    // Reset form
    setPurpose("");
    setCorrections("");
    setRating("");
    setPriorities([]);
    setRerunQuery(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="
              relative bg-white rounded-[16px] w-full max-w-[600px] mx-4
              p-6 shadow-xl max-h-[90vh] overflow-y-auto
              max-md:rounded-t-[20px] max-md:rounded-b-none
              max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0
              max-md:mx-0 max-md:max-h-[85vh]
            "
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#F3F4F6] transition-colors"
            >
              <X className="h-5 w-5 text-[#6B7280]" />
            </button>

            {/* Title */}
            <h2 className="text-[18px] font-medium text-[#18181B] mb-1">
              Refine with your context
            </h2>
            <p className="text-[13px] text-[#6B7280] mb-4">
              Help ClarityLayer re-evaluate this output based on your actual
              situation
            </p>

            <div className="h-px bg-[#E4E2DC] mb-5" />

            {/* Field 1 */}
            <div className="mb-5">
              <label className="block text-[13px] font-medium text-[#18181B] mb-2">
                What is this output for?
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. I'm a senior engineer applying for a Staff PM role at a Series B healthtech startup"
                className="w-full h-[100px] p-3 text-[14px] text-[#18181B] bg-white border border-[#E4E2DC] rounded-[10px] resize-none placeholder:text-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Field 2 */}
            <div className="mb-5">
              <label className="block text-[13px] font-medium text-[#18181B] mb-2">
                What did Gemini get wrong or assume incorrectly?
              </label>
              <textarea
                value={corrections}
                onChange={(e) => setCorrections(e.target.value)}
                placeholder="e.g. It assumed I have no technical background, but I have 6 years of engineering experience"
                className="w-full h-[100px] p-3 text-[14px] text-[#18181B] bg-white border border-[#E4E2DC] rounded-[10px] resize-none placeholder:text-[#9CA3AF] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* Field 3 — Rating */}
            <div className="mb-5">
              <label className="block text-[13px] font-medium text-[#18181B] mb-2">
                Rate this response before refinement
              </label>
              <div className="flex flex-wrap gap-2">
                {RATINGS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRating(r)}
                    className={`
                      px-4 py-2 text-[13px] font-medium rounded-full
                      border transition-all duration-150
                      ${
                        rating === r
                          ? "bg-[#18181B] text-white border-[#18181B]"
                          : "bg-white text-[#18181B] border-[#E4E2DC] hover:border-[#D4D4D8]"
                      }
                    `}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4 — Priorities */}
            <div className="mb-5">
              <label className="block text-[13px] font-medium text-[#18181B] mb-2">
                What matters most to you?
              </label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePriority(p)}
                    className={`
                      px-4 py-2 text-[13px] font-medium rounded-full
                      border transition-all duration-150
                      ${
                        priorities.includes(p)
                          ? "bg-[#4338CA] text-white border-[#4338CA]"
                          : "bg-white text-[#18181B] border-[#E4E2DC] hover:border-[#D4D4D8]"
                      }
                    `}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 5 — Checkbox */}
            <div className="mb-6">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <button
                  onClick={() => setRerunQuery(!rerunQuery)}
                  className={`
                    flex items-center justify-center w-5 h-5 rounded-md border-2
                    transition-all duration-150
                    ${
                      rerunQuery
                        ? "bg-[#4338CA] border-[#4338CA]"
                        : "bg-white border-[#D4D4D8] group-hover:border-[#A1A1AA]"
                    }
                  `}
                >
                  {rerunQuery && <Check className="h-3 w-3 text-white" />}
                </button>
                <span className="text-[13px] text-[#18181B]">
                  Use my context to re-run the Gemini query
                </span>
              </label>
            </div>

            {/* Bottom buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-[14px] font-medium text-[#18181B] bg-white border border-[#E4E2DC] rounded-[12px] hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 text-[14px] font-medium text-white bg-[#18181B] rounded-[12px] hover:bg-[#27272A] transition-colors flex items-center gap-2"
              >
                Re-analyse with my context
                <span>→</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
