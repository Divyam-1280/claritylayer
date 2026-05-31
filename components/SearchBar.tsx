"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, ArrowRight } from "lucide-react";

interface SearchBarProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  hasResponse: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function SearchBar({
  onSubmit,
  isLoading,
  hasResponse,
  inputRef: externalRef,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const internalRef = useRef<HTMLInputElement>(null);
  const ref = externalRef || internalRef;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  // Allow external prefill
  useEffect(() => {
    if (ref.current) {
      const currentVal = ref.current.value;
      if (currentVal && currentVal !== query) {
        setQuery(currentVal);
      }
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[720px] mx-auto">
      <div
        className={`
          relative flex items-center w-full bg-white
          border-[1.5px] border-[#E4E2DC]
          transition-all duration-300 ease-out
          ${hasResponse ? "h-[44px] rounded-[999px]" : "h-[52px] rounded-[999px]"}
          focus-within:border-indigo-400 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]
        `}
      >
        <Search className="ml-4 mr-2 h-[18px] w-[18px] text-[#9CA3AF] shrink-0" />
        <input
          ref={ref}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            hasResponse
              ? "Ask a follow-up or try a new question..."
              : "Ask Gemini anything..."
          }
          className={`
            flex-1 bg-transparent outline-none font-[family-name:var(--font-geist-sans)]
            text-[#18181B] placeholder:text-[#9CA3AF]
            ${hasResponse ? "text-[14px]" : "text-[15px]"}
          `}
          disabled={isLoading}
        />
        <AnimatePresence>
          {(query.trim().length > 0 || isLoading) && (
            <motion.button
              type="submit"
              disabled={isLoading || !query.trim()}
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              transition={{ duration: 0.2 }}
              className={`
                flex items-center gap-2 mr-2 px-4
                ${hasResponse ? "h-[32px]" : "h-[38px]"}
                rounded-[999px] bg-[#4338CA] text-white
                text-[13px] font-medium whitespace-nowrap
                hover:bg-[#3730A3] transition-colors duration-150
                disabled:opacity-70 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Analyse</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
