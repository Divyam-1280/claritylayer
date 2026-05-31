export function buildAuditPrompt(response: string, userPrompt: string, userContext?: string): string {
  const contextSection = userContext
    ? `\n\nAdditional context provided by the user:\n${userContext}\n\nUse this context to refine your analysis — check if the response's assumptions are valid given the user's actual situation.`
    : "";

  return `You are an AI output auditor. Analyse the following AI-generated response and return ONLY a valid JSON object with no markdown, no backticks, no explanation.

The JSON must follow this exact structure:
{
  "confidenceScore": <number between 20 and 95>,
  "confidenceLabel": "<Low confidence | Moderate confidence | High confidence>",
  "confidenceReason": "<2 sentence explanation of why this score>",
  "assumptions": [
    {
      "sentence": "<full sentence from the response that makes an assumption>",
      "reason": "<why this is an assumption>"
    }
  ],
  "uncertainClaims": [
    {
      "sentence": "<full sentence containing uncertain language>",
      "reason": "<which word made it uncertain and why it matters>"
    }
  ],
  "gaps": [
    {
      "sentence": "<full sentence that lacks specificity or evidence>",
      "reason": "<what specific information is missing>"
    }
  ],
  "alternatives": [
    {
      "sentence": "<full sentence using absolute or one-sided framing>",
      "label": "<short reframe label e.g. 'If you are a beginner'>",
      "reason": "<alternative perspective on this claim>"
    }
  ],
  "inlinePhrases": [
    {
      "phrase": "<exact short phrase from the response to highlight>",
      "type": "<assumption | uncertain | gap | alternative>"
    }
  ]
}

Rules for scoring:
- Start at 85
- Each uncertain claim found: -4
- Each assumption: -3
- Each gap: -3
- Each alternative/absolute claim: -2
- Each specific number or percentage in text: +5
- Clamp final score between 20 and 95

Rules for extraction:
- Always extract the FULL sentence, never just a word
- Under each item, the reason must explain specifically why it was flagged
- inlinePhrases should be short 3-6 word phrases within those sentences for inline highlighting
- Maximum items per category: 6
- If a category has no items, return an empty array

The AI response to analyse is:
${response}

The original user prompt was:
${userPrompt}${contextSection}`;
}
