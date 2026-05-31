import { NextRequest, NextResponse } from "next/server";
import { generateContent } from "@/lib/gemini";
import { buildAuditPrompt } from "@/lib/analyseText";
import { FALLBACK_AUDIT, type AuditData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { response, userPrompt, userContext } = await request.json();

    if (!response || !userPrompt) {
      return NextResponse.json(
        { error: "Both response and userPrompt are required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const prompt = buildAuditPrompt(response, userPrompt, userContext);
    const text = await generateContent(prompt);

    // Try to parse the JSON response
    try {
      // Remove any potential markdown code fences
      const cleaned = text
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      const auditData: AuditData = JSON.parse(cleaned);

      // Validate required fields
      if (typeof auditData.confidenceScore !== "number") {
        throw new Error("Invalid confidenceScore");
      }

      // Clamp confidence score
      auditData.confidenceScore = Math.max(
        20,
        Math.min(95, auditData.confidenceScore)
      );

      // Ensure all arrays exist
      auditData.assumptions = auditData.assumptions || [];
      auditData.uncertainClaims = auditData.uncertainClaims || [];
      auditData.gaps = auditData.gaps || [];
      auditData.alternatives = auditData.alternatives || [];
      auditData.inlinePhrases = auditData.inlinePhrases || [];

      return NextResponse.json(auditData);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Raw text:", text);
      return NextResponse.json(FALLBACK_AUDIT);
    }
  } catch (error) {
    console.error("Analyse API error:", error);
    return NextResponse.json(
      { error: "Analysis could not be completed. Try again." },
      { status: 502 }
    );
  }
}
