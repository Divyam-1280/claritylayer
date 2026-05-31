"use client";

import { useState, useMemo } from "react";
import { Copy, Check, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import InlinePills from "./InlinePills";
import type {
  InlinePhrase,
  PillType,
} from "@/lib/types";
import { PILL_COLORS } from "@/lib/types";

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

  // We only want to apply InlinePills to text content, so we create a custom renderer
  // that wraps text nodes with InlinePills when phrases are present.
  const renderTextWithPills = (text: string) => {
    if (inlinePhrases.length === 0) return text;
    return (
      <InlinePills
        text={text}
        phrases={inlinePhrases}
        activeFilter={activeFilter}
        onPillClick={handlePillClick}
      />
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header label */}
      <div className="mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
          Gemini&apos;s response
        </span>
      </div>

      {/* Response text with proper markdown rendering and inline pills */}
      <div className="flex-1 overflow-y-auto mb-6 pr-1">
        <div className="prose-container prose prose-sm max-w-none prose-p:leading-[1.75] prose-p:text-[15px] prose-p:text-[#18181B] prose-li:text-[15px] prose-li:text-[#18181B] prose-strong:text-[#18181B] prose-strong:font-semibold prose-headings:text-[#18181B] prose-a:text-[#4338CA] prose-a:no-underline hover:prose-a:underline">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Override paragraph to support inline pills
              p({ children }) {
                return (
                  <p className="mb-4 last:mb-0">
                    {/* ReactMarkdown passes children as array of strings/elements. We need to handle strings. */}
                    {Array.isArray(children)
                      ? children.map((child, i) =>
                          typeof child === "string" ? (
                            <span key={i}>{renderTextWithPills(child)}</span>
                          ) : (
                            child
                          )
                        )
                      : typeof children === "string"
                      ? renderTextWithPills(children)
                      : children}
                  </p>
                );
              },
              // Override list items similarly
              li({ children }) {
                return (
                  <li>
                    {Array.isArray(children)
                      ? children.map((child, i) =>
                          typeof child === "string" ? (
                            <span key={i}>{renderTextWithPills(child)}</span>
                          ) : (
                            child
                          )
                        )
                      : typeof children === "string"
                      ? renderTextWithPills(children)
                      : children}
                  </li>
                );
              },
              // Code blocks
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline ? (
                  <pre className="bg-[#F7F6F3] rounded-[8px] p-4 text-[13px] font-mono text-[#18181B] overflow-x-auto mb-4 border border-[#E4E2DC]/50">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-[#F7F6F3] px-1.5 py-0.5 rounded-[4px] text-[13px] font-mono" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {response}
          </ReactMarkdown>
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
