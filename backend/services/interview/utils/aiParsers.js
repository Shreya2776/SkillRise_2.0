/**
 * Robust JSON extraction utility for AI models.
 * Handles markdown code blocks (```json ... ```) and extra surrounding text.
 */
const extractJSON = (text) => {
  try {
    if (!text) throw new Error("Received empty text from AI model.");

    // 1. Strip Markdown Code Blocks if present
    let cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // 2. Locate the first { or [ and last } or ]
    const firstBrace = cleanText.indexOf("{");
    const firstBracket = cleanText.indexOf("[");
    
    // Determine start point (whichever comes first)
    let start = -1;
    if (firstBrace !== -1 && firstBracket !== -1) start = Math.min(firstBrace, firstBracket);
    else if (firstBrace !== -1) start = firstBrace;
    else if (firstBracket !== -1) start = firstBracket;

    if (start === -1) throw new Error("No valid JSON structure ({ or [) found in response.");

    const lastBrace = cleanText.lastIndexOf("}");
    const lastBracket = cleanText.lastIndexOf("]");
    const end = Math.max(lastBrace, lastBracket);

    if (end === -1) throw new Error("JSON structure was opened but never closed.");

    const jsonString = cleanText.substring(start, end + 1);
    
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("❌ [AI PARSER ERROR] Failed to parse JSON:", err.message);
    console.error("📄 [RAW RESPONSE PRINT]:\n", text);
    throw new Error(`AI generated invalid structural data: ${err.message}`);
  }
};

export { extractJSON };
