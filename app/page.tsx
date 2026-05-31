"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Info,
  AlertCircle,
  RefreshCw,
  ChevronUp,
  X,
  Search,
  Zap,
  Shield,
  Layers,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ResponsePanel from "@/components/ResponsePanel";
import ClarityPanel from "@/components/ClarityPanel";
import type { AuditData } from "@/lib/types";
import { FALLBACK_AUDIT } from "@/lib/types";

const SUGGESTED_PROMPTS = [
  "Help me write a cover letter for a PM role",
  "Explain how transformer models work",
  "What are the best practices for React performance?",
  "Summarise the key risks of this investment strategy",
];

type AppState = "idle" | "loading" | "ready" | "error";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isReanalysing] = useState(false);
  const [wasRefined] = useState(false);
  const [diffSummary] = useState("");
  const [showMobileAudit, setShowMobileAudit] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [prefillValue, setPrefillValue] = useState<string | undefined>(
    undefined
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async (prompt: string) => {
    setQuery(prompt);
    setAppState("loading");
    setErrorMessage("");
    setShowMobileAudit(false);
    // Reset prefill so it doesn't re-trigger
    setPrefillValue(undefined);

    try {
      // First call: get Gemini response
      const geminiRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!geminiRes.ok) {
        throw new Error("Gemini could not be reached. Try again.");
      }

      const geminiData = await geminiRes.json();
      setResponse(geminiData.response);

      // Second call: analyse the response
      const analyseRes = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: geminiData.response,
          userPrompt: prompt,
        }),
      });

      if (!analyseRes.ok) {
        // Response received but analysis failed
        setAuditData(FALLBACK_AUDIT);
      } else {
        const analysisData = await analyseRes.json();
        if (analysisData.error) {
          setAuditData(FALLBACK_AUDIT);
        } else {
          setAuditData(analysisData);
        }
      }

      setAppState("ready");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Gemini could not be reached. Try again."
      );
      setAppState("error");
    }
  }, []);

  const handleNewQuestion = useCallback(() => {
    setAppState("idle");
    setQuery("");
    setResponse("");
    setAuditData(null);
    setErrorMessage("");
    setShowMobileAudit(false);
    setPrefillValue("");
    setTimeout(() => {
      setPrefillValue(undefined);
      searchInputRef.current?.focus();
    }, 100);
  }, []);

  const handleSuggestedPrompt = useCallback(
    (prompt: string) => {
      handleSubmit(prompt);
    },
    [handleSubmit]
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ─── NAVBAR ─── */}
      <nav className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-[#E4E2DC] bg-white z-20">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg bg-[#4338CA] flex items-center justify-center">
            <span className="text-white text-[15px] font-semibold">C</span>
          </div>
          <span className="text-[17px] font-semibold text-[#18181B]">
            ClarityLayer
          </span>
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F7F6F3] text-[12px] text-[#9CA3AF]">
            Powered by Gemini
            <Sparkles className="h-3 w-3 text-[#4338CA]" />
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-[#9CA3AF]">v0.1.0</span>
          <button
            onClick={() => setShowHowItWorks(true)}
            className="text-[13px] text-[#6B7280] hover:text-[#18181B] transition-colors flex items-center gap-1"
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">How it works</span>
          </button>
        </div>
      </nav>

      {/* ─── HOW IT WORKS MODAL ─── */}
      <AnimatePresence>
        {showHowItWorks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setShowHowItWorks(false)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-[16px] w-full max-w-[520px] mx-4 p-7 shadow-xl"
            >
              <button
                onClick={() => setShowHowItWorks(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-[#F3F4F6] transition-colors"
              >
                <X className="h-5 w-5 text-[#6B7280]" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#4338CA] flex items-center justify-center">
                  <span className="text-white text-[18px] font-semibold">
                    C
                  </span>
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#18181B]">
                    How ClarityLayer Works
                  </h2>
                  <p className="text-[12px] text-[#9CA3AF]">
                    3-step AI audit process
                  </p>
                </div>
              </div>

              <div className="h-px bg-[#E4E2DC] mb-5" />

              <div className="space-y-5">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-[#EEF2FF] flex items-center justify-center">
                    <Search className="h-5 w-5 text-[#4338CA]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#18181B] mb-1">
                      1. You ask a question
                    </h3>
                    <p className="text-[13px] text-[#6B7280] leading-relaxed">
                      Type any question or prompt. ClarityLayer sends it to
                      Google&apos;s Gemini AI and retrieves a full response.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-[#FFFBEB] flex items-center justify-center">
                    <Zap className="h-5 w-5 text-[#D97706]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#18181B] mb-1">
                      2. AI audits the AI
                    </h3>
                    <p className="text-[13px] text-[#6B7280] leading-relaxed">
                      A second Gemini call analyses the response for
                      assumptions, uncertain language, missing information, and
                      one-sided framing — producing a structured audit report.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-[#ECFDF5] flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[#16A34A]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#18181B] mb-1">
                      3. You evaluate with clarity
                    </h3>
                    <p className="text-[13px] text-[#6B7280] leading-relaxed">
                      The audit panel shows a confidence score, flagged
                      sentences with detailed reasons, and highlights key
                      phrases directly in the response text — so you know
                      exactly what to trust, question, or verify.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#E4E2DC] mt-5 mb-4" />

              <div className="flex items-start gap-3 bg-[#F7F6F3] rounded-[12px] p-4">
                <Layers className="h-4 w-4 text-[#9CA3AF] mt-0.5 shrink-0" />
                <p className="text-[12px] text-[#6B7280] leading-relaxed">
                  <span className="font-medium text-[#18181B]">
                    Why does this matter?
                  </span>{" "}
                  AI responses can sound confident even when they&apos;re making
                  assumptions or lacking evidence. ClarityLayer helps you
                  see past the surface and make better decisions with
                  AI-generated content.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Error Banner */}
        <AnimatePresence>
          {appState === "error" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mx-4 mt-3 px-4 py-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[12px] flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[#DC2626]" />
                <span className="text-[13px] text-[#991B1B]">
                  {errorMessage}
                </span>
              </div>
              <button
                onClick={() => query && handleSubmit(query)}
                className="flex items-center gap-1.5 text-[13px] text-[#991B1B] font-medium hover:text-[#DC2626]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── IDLE STATE (Homepage) ─── */}
        <AnimatePresence mode="wait">
          {appState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center px-4"
            >
              {/* Hero */}
              <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#4338CA] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
                  <span className="text-white text-[28px] font-semibold">
                    C
                  </span>
                </div>
                <h1 className="text-[28px] sm:text-[36px] font-semibold text-[#18181B] mb-3 tracking-tight">
                  ClarityLayer
                </h1>
                <p className="text-[15px] text-[#6B7280] max-w-[480px]">
                  Ask anything. ClarityLayer will audit the response.
                </p>
              </div>

              {/* Search bar */}
              <div className="w-full max-w-[720px] mb-6">
                <SearchBar
                  onSubmit={handleSubmit}
                  isLoading={false}
                  hasResponse={false}
                  inputRef={searchInputRef}
                  prefillValue={prefillValue}
                />
              </div>

              {/* Suggested prompts */}
              <div className="flex flex-wrap justify-center gap-2 max-w-[720px]">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="
                      px-4 py-2.5 text-[13px] text-[#6B7280]
                      bg-[#F7F6F3] rounded-full border border-[#E4E2DC]
                      hover:bg-[#EFEDE8] hover:text-[#18181B]
                      hover:scale-[1.02] transition-all duration-150
                    "
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── LOADING / READY STATE ─── */}
        {(appState === "loading" || appState === "ready") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Search bar (top position) */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="px-4 py-3 border-b border-[#E4E2DC] bg-white shrink-0"
            >
              <SearchBar
                onSubmit={handleSubmit}
                isLoading={appState === "loading"}
                hasResponse={true}
                inputRef={searchInputRef}
                prefillValue={prefillValue}
              />
            </motion.div>

            {/* Two-panel layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Panel — Response */}
              <div className="w-full md:w-1/2 lg:w-1/2 md:border-r border-[#E4E2DC] bg-white overflow-y-auto">
                <div className="p-5 md:p-7">
                  {appState === "loading" ? (
                    <SkeletonResponse />
                  ) : (
                    <ResponsePanel
                      response={response}
                      inlinePhrases={auditData?.inlinePhrases || []}
                      onNewQuestion={handleNewQuestion}
                    />
                  )}
                </div>
              </div>

              {/* Mobile audit toggle */}
              <div className="md:hidden sticky bottom-0 z-10">
                {appState === "ready" && !showMobileAudit && (
                  <button
                    onClick={() => setShowMobileAudit(true)}
                    className="w-full py-3 bg-[#18181B] text-white text-[14px] font-medium flex items-center justify-center gap-2"
                  >
                    <ChevronUp className="h-4 w-4" />
                    View Clarity Audit
                  </button>
                )}
              </div>

              {/* Right Panel — Clarity Audit */}
              <div
                className={`
                  w-full md:w-1/2 lg:w-1/2 bg-[#F7F6F3] overflow-y-auto
                  ${!showMobileAudit ? "hidden md:block" : "block"}
                `}
              >
                <div className="p-5 md:p-7">
                  {appState === "loading" ? (
                    <SkeletonAudit />
                  ) : auditData ? (
                    <ClarityPanel
                      auditData={auditData}
                      isReanalysing={isReanalysing}
                      wasRefined={wasRefined}
                      diffSummary={diffSummary}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

/* ─── Skeleton Components ─── */

function SkeletonResponse() {
  return (
    <div className="animate-pulse">
      <div className="h-3 w-32 bg-[#E4E2DC] rounded mb-6" />
      <div className="space-y-3">
        <div className="h-4 w-full bg-[#E4E2DC] rounded" />
        <div className="h-4 w-[92%] bg-[#E4E2DC] rounded" />
        <div className="h-4 w-[85%] bg-[#E4E2DC] rounded" />
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full bg-[#E4E2DC] rounded" />
        <div className="h-4 w-[88%] bg-[#E4E2DC] rounded" />
        <div className="h-4 w-[76%] bg-[#E4E2DC] rounded" />
      </div>
    </div>
  );
}

function SkeletonAudit() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-28 bg-[#E4E2DC] rounded mb-2" />
      <div className="h-3 w-44 bg-[#E4E2DC] rounded mb-6" />

      {/* Confidence skeleton */}
      <div className="bg-white rounded-[12px] p-5 border border-[#E4E2DC] mb-6">
        <div className="flex items-baseline gap-3 mb-3">
          <div className="h-16 w-20 bg-[#E4E2DC] rounded" />
          <div className="h-4 w-32 bg-[#E4E2DC] rounded" />
        </div>
        <div className="h-2 w-full bg-[#E4E2DC] rounded-full mb-3" />
        <div className="h-3 w-3/4 bg-[#E4E2DC] rounded" />
      </div>

      {/* Accordion skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3 border-b border-[#E4E2DC]"
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-[#E4E2DC] rounded" />
            <div className="h-4 w-28 bg-[#E4E2DC] rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-[#E4E2DC] rounded-full" />
            <div className="h-4 w-4 bg-[#E4E2DC] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
