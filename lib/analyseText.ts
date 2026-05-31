export function buildAuditPrompt(response: string, userPrompt: string, userContext?: string): string {
  const contextSection = userContext
    ? `\n\nAdditional context provided by the user:\n${userContext}\n\nUse this context to refine your analysis — check if the response's assumptions are valid given the user's actual situation.`
    : "";

  return `You are a senior AI output auditor specialising in critical reasoning analysis. Your job is to deeply and precisely analyse AI-generated responses, producing sharp, specific, and actionable audit findings.

Analyse the following AI-generated response and return ONLY a valid JSON object with no markdown, no backticks, no explanation.

The JSON must follow this exact structure:
{
  "confidenceScore": <number between 20 and 95>,
  "confidenceLabel": "<Low confidence | Moderate confidence | High confidence>",
  "confidenceReason": "<2 precise sentences explaining what specific evidence or lack thereof drove this score. Reference concrete parts of the response.>",
  "assumptions": [
    {
      "sentence": "<the EXACT full sentence from the response that makes an assumption>",
      "reason": "<Be specific: name what was assumed, who it was assumed about, and why the reader should verify it. Do NOT use generic phrases like 'this is an assumption'. Example: 'Assumes the reader works in a corporate environment with formal promotion tracks, but many tech companies use flat hierarchies or project-based advancement.'>"
    }
  ],
  "uncertainClaims": [
    {
      "sentence": "<the EXACT full sentence containing uncertain language>",
      "reason": "<Identify the SPECIFIC hedging word (e.g. 'typically', 'often', 'may'), explain what concrete data or statistic could replace it, and why the vagueness matters for decision-making. Example: 'The word \"often\" hides the actual frequency — is it 30% or 90% of cases? This matters because the reader may base a career decision on this claim.'>"
    }
  ],
  "gaps": [
    {
      "sentence": "<the EXACT full sentence that lacks specificity or evidence>",
      "reason": "<State precisely what information is missing and what the reader should look up. Example: 'No specific metrics or KPIs are mentioned — the reader should ask: which outcomes are measured, what thresholds define success, and what timeframe is expected?'>"
    }
  ],
  "alternatives": [
    {
      "sentence": "<the EXACT full sentence using absolute or one-sided framing>",
      "label": "<short reframe label that names the alternative angle, e.g. 'For non-corporate roles' or 'In startup environments'>",
      "reason": "<Provide the specific counterpoint or opposing perspective with enough detail to be useful. Example: 'In startups, visibility through shipping products often matters more than cross-functional stakeholder management, which is more relevant in large enterprises.'>"
    }
  ],
  "inlinePhrases": [
    {
      "phrase": "<exact 3-6 word phrase copied verbatim from the response to highlight>",
      "type": "<assumption | uncertain | gap | alternative>"
    }
  ]
}

SCORING RULES (follow exactly):
- Start at 85
- Each uncertain claim found: -4
- Each assumption: -3
- Each gap: -3
- Each alternative/absolute claim: -2
- Each specific number, percentage, or cited source in the response text: +5
- Clamp final score between 20 and 95

EXTRACTION RULES (follow exactly):
- Always extract the FULL EXACT sentence as it appears in the response — never truncate or paraphrase
- Each "reason" field MUST be specific, detailed, and actionable — generic explanations like "this is an assumption" or "this lacks detail" are NOT acceptable
- Every reason must explain WHY it matters to the reader and WHAT they should do about it
- inlinePhrases must be exact 3-6 word substrings that appear verbatim in the response
- Maximum 6 items per category
- If a category has no items, return an empty array []
- Prefer quality over quantity — only flag items with genuinely useful audit insights

The AI response to analyse is:
${response}

The original user prompt was:
${userPrompt}${contextSection}`;
}
