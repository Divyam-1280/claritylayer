export interface Assumption {
  sentence: string;
  reason: string;
}

export interface UncertainClaim {
  sentence: string;
  reason: string;
}

export interface Gap {
  sentence: string;
  reason: string;
}

export interface Alternative {
  sentence: string;
  label: string;
  reason: string;
}

export interface InlinePhrase {
  phrase: string;
  type: "assumption" | "uncertain" | "gap" | "alternative";
}

export interface AuditData {
  confidenceScore: number;
  confidenceLabel: string;
  confidenceReason: string;
  assumptions: Assumption[];
  uncertainClaims: UncertainClaim[];
  gaps: Gap[];
  alternatives: Alternative[];
  inlinePhrases: InlinePhrase[];
}

export interface GeminiResponse {
  response: string;
}

export interface AnalyseRequest {
  response: string;
  userPrompt: string;
  userContext?: string;
}

export interface RefineFormData {
  purpose: string;
  corrections: string;
  rating: string;
  priorities: string[];
  rerunQuery: boolean;
}

export type PillType = "assumption" | "uncertain" | "gap" | "alternative";

export type MatchFeedback =
  | "Fits perfectly"
  | "Partially"
  | "Needs revision"
  | "Off target";

export const FEEDBACK_GUIDANCE: Record<MatchFeedback, string> = {
  "Fits perfectly":
    "Great. Consider verifying key claims before acting.",
  Partially:
    "Smart. Use the audit panel to identify what to revise.",
  "Needs revision":
    "Check the gaps and alternatives panels for what's missing.",
  "Off target":
    "Try reprompting with more context using the refine button.",
};

export const PILL_COLORS: Record<
  PillType,
  { bg: string; border: string; text: string; dot: string }
> = {
  assumption: {
    bg: "bg-[#EEF2FF]",
    border: "border-[#C7D2FE]",
    text: "text-[#4338CA]",
    dot: "bg-[#4338CA]",
  },
  uncertain: {
    bg: "bg-[#FFFBEB]",
    border: "border-[#FDE68A]",
    text: "text-[#92400E]",
    dot: "bg-[#92400E]",
  },
  gap: {
    bg: "bg-[#FEF2F2]",
    border: "border-[#FECACA]",
    text: "text-[#991B1B]",
    dot: "bg-[#991B1B]",
  },
  alternative: {
    bg: "bg-[#ECFDF5]",
    border: "border-[#A7F3D0]",
    text: "text-[#065F46]",
    dot: "bg-[#065F46]",
  },
};

export const FALLBACK_AUDIT: AuditData = {
  confidenceScore: 50,
  confidenceLabel: "Moderate confidence",
  confidenceReason: "Analysis could not be completed fully. Results may be limited.",
  assumptions: [],
  uncertainClaims: [],
  gaps: [],
  alternatives: [],
  inlinePhrases: [],
};
