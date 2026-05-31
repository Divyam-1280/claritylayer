"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Info, AlertCircle, RefreshCw, ChevronUp } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ResponsePanel from "@/components/ResponsePanel";
import ClarityPanel from "@/components/ClarityPanel";
import type { AuditData, RefineFormData } from "@/lib/types";
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
  const [isReanalysing, setIsReanalysing] = useState(false);
  const [wasRefined, setWasRefined] = useState(false);
  const [diffSummary, setDiffSummary] = useState("");
  const [showMobileAudit, setShowMobileAudit] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(async (prompt: string) => {
    setQuery(prompt);
    setAppState("loading");
    setErrorMessage("");
    setWasRefined(false);
    setDiffSummary("");
    setShowMobileAudit(false);

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

  const handleRefine = useCallback(
    async (data: RefineFormData) => {
      setIsReanalysing(true);
      const previousAudit = auditData;

      try {
        const userContext = [
          data.purpose && `Purpose: ${data.purpose}`,
          data.corrections && `Corrections: ${data.corrections}`,
          data.rating && `User rating: ${data.rating}`,
          data.priorities.length > 0 &&
            `Priorities: ${data.priorities.join(", ")}`,
        ]
          .filter(Boolean)
          .join("\n");

        if (data.rerunQuery) {
          // Re-run full query with context
          const enrichedPrompt = `${userContext}\n\nOriginal question: ${query}`;

          const geminiRes = await fetch("/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: enrichedPrompt }),
          });

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            setResponse(geminiData.response);

            const analyseRes = await fetch("/api/analyse", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                response: geminiData.response,
                userPrompt: query,
                userContext,
              }),
            });

            if (analyseRes.ok) {
              const newAudit = await analyseRes.json();
              if (!newAudit.error) {
                setAuditData(newAudit);
                generateDiffSummary(previousAudit, newAudit);
              }
            }
          }
        } else {
          // Just re-analyse with context
          const analyseRes = await fetch("/api/analyse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              response,
              userPrompt: query,
              userContext,
            }),
          });

          if (analyseRes.ok) {
            const newAudit = await analyseRes.json();
            if (!newAudit.error) {
              setAuditData(newAudit);
              generateDiffSummary(previousAudit, newAudit);
            }
          }
        }

        setWasRefined(true);
      } catch (err) {
        console.error("Refine error:", err);
      } finally {
        setIsReanalysing(false);
      }
    },
    [query, response, auditData]
  );

  const generateDiffSummary = (
    prev: AuditData | null,
    next: AuditData
  ) => {
    if (!prev) return;

    const parts: string[] = [];
    const assumptionDiff =
      prev.assumptions.length - next.assumptions.length;
    if (assumptionDiff > 0)
      parts.push(`${assumptionDiff} assumption${assumptionDiff > 1 ? "s" : ""} resolved`);
    if (assumptionDiff < 0)
      parts.push(`${Math.abs(assumptionDiff)} new assumption${Math.abs(assumptionDiff) > 1 ? "s" : ""}`);

    const scoreDiff = next.confidenceScore - prev.confidenceScore;
    if (scoreDiff !== 0)
      parts.push(`confidence ${scoreDiff > 0 ? "+" : ""}${scoreDiff}`);

    const gapDiff = next.gaps.length - prev.gaps.length;
    if (gapDiff > 0)
      parts.push(`${gapDiff} new gap${gapDiff > 1 ? "s" : ""} identified`);
    if (gapDiff < 0)
      parts.push(`${Math.abs(gapDiff)} gap${Math.abs(gapDiff) > 1 ? "s" : ""} resolved`);

    setDiffSummary(parts.join(" · ") || "Analysis updated with your context");
  };

  const handleNewQuestion = useCallback(() => {
    setAppState("idle");
    setQuery("");
    setResponse("");
    setAuditData(null);
    setErrorMessage("");
    setWasRefined(false);
    setDiffSummary("");
    setShowMobileAudit(false);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  }, []);

  const handleFollowUp = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = "Based on the above, ";
      searchInputRef.current.focus();
      // Trigger React's onChange
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(searchInputRef.current, "Based on the above, ");
        searchInputRef.current.dispatchEvent(
          new Event("input", { bubbles: true })
        );
      }
    }
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
          <button className="text-[13px] text-[#6B7280] hover:text-[#18181B] transition-colors flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">How it works</span>
          </button>
        </div>
      </nav>

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
                      onRefine={handleRefine}
                      onFollowUp={handleFollowUp}
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
