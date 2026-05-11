// ═══════════════════════════════════════════════════════════════════════════════
// LLM Factory — Round-Robin Load Balancer with Grok Fallback
// ═══════════════════════════════════════════════════════════════════════════════
// Distributes LLM calls evenly across 3 Gemini API keys using round-robin.
// Automatically falls back to Grok if Gemini fails (rate limit, quota, etc).
//
// Usage:
//   const { createLLM, createStructuredLLM } = require("../utils/llmFactory");
//   const llm = createLLM();                         // round-robin Gemini + Grok fallback
//   const structured = createStructuredLLM(schema);  // same but with structured output
//
// ═══════════════════════════════════════════════════════════════════════════════

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatOpenAI } = require("@langchain/openai");

// ─── Gemini Key Pool ─────────────────────────────────────────────────────────
const geminiKeys = [
  process.env.GOOGLE_API_KEY_1,
  process.env.GOOGLE_API_KEY_2,
  process.env.GOOGLE_API_KEY_3,
].filter(Boolean);

if (geminiKeys.length === 0) {
  console.error("[LLMFactory] ⚠️  No GOOGLE_API_KEY_1/2/3 found in .env! LLM calls will fail.");
}

let currentKeyIndex = 0;

/**
 * Returns the next Gemini API key using round-robin rotation.
 * Thread-safe for Node.js single-threaded event loop.
 */
function getNextGeminiKey() {
  if (geminiKeys.length === 0) {
    throw new Error("[LLMFactory] No Gemini API keys configured. Add GOOGLE_API_KEY_1/2/3 to .env");
  }
  const key = geminiKeys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % geminiKeys.length;
  return key;
}

/**
 * Returns which key index was just used (for logging).
 */
function getCurrentKeyLabel() {
  // currentKeyIndex was already incremented, so the "last used" is one behind
  const usedIndex = (currentKeyIndex - 1 + geminiKeys.length) % geminiKeys.length;
  return `GOOGLE_API_KEY_${usedIndex + 1}`;
}

// ─── Factory Functions ───────────────────────────────────────────────────────

/**
 * Creates a load-balanced Gemini LLM with automatic Grok fallback.
 * 
 * @param {Object} options - Override defaults
 * @param {number} [options.temperature=0.2] - LLM temperature
 * @param {number} [options.maxRetries=1] - Gemini-level retries before fallback
 * @param {string} [options.caller="unknown"] - Name of the calling agent (for logging)
 * @returns {Object} LangChain LLM instance with .withFallbacks() attached
 */
function createLLM(options = {}) {
  const {
    temperature = 0.2,
    maxRetries = 1,
    caller = "unknown",
  } = options;

  const apiKey = getNextGeminiKey();
  const keyLabel = getCurrentKeyLabel();

  console.log(`[LLMFactory] ${caller} → ${keyLabel} (temp: ${temperature})`);

  const geminiLlm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey,
    temperature,
    maxRetries,
  });

  // Grok fallback (only created if key exists)
  if (process.env.GROK_API_KEY) {
    const grokFallback = new ChatOpenAI({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROK_API_KEY,
      configuration: { baseURL: "https://api.groq.com/openai/v1" },
      temperature,
      maxRetries: 2,
    });

    return geminiLlm.withFallbacks({ fallbacks: [grokFallback] });
  }

  return geminiLlm;
}

/**
 * Creates a load-balanced Gemini LLM with structured output (Zod schema)
 * and automatic Grok fallback.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema for structured output
 * @param {Object} options - Override defaults
 * @param {number} [options.temperature=0.2] - LLM temperature
 * @param {string} [options.caller="unknown"] - Name of the calling agent (for logging)
 * @param {string} [options.name="structured_output"] - Function name for structured output
 * @returns {Object} LangChain LLM instance with structured output + fallbacks
 */
function createStructuredLLM(schema, options = {}) {
  const {
    temperature = 0.2,
    maxRetries = 1,
    caller = "unknown",
    name = "structured_output",
  } = options;

  const apiKey = getNextGeminiKey();
  const keyLabel = getCurrentKeyLabel();

  console.log(`[LLMFactory] ${caller} (structured) → ${keyLabel}`);

  const geminiLlm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey,
    temperature,
    maxRetries,
  });

  const structuredGemini = geminiLlm.withStructuredOutput(schema, { name });

  // Grok fallback with structured output
  if (process.env.GROK_API_KEY) {
    const grokFallback = new ChatOpenAI({
      model: "llama-3.3-70b-versatile",
      apiKey: process.env.GROK_API_KEY,
      configuration: { baseURL: "https://api.groq.com/openai/v1" },
      temperature,
      maxRetries: 2,
    });

    const structuredGrok = grokFallback.withStructuredOutput(schema, {
      method: "functionCalling",
      name,
    });

    return structuredGemini.withFallbacks({ fallbacks: [structuredGrok] });
  }

  return structuredGemini;
}

/**
 * Returns info about the current key pool (useful for debugging/health checks).
 */
function getPoolStatus() {
  return {
    totalKeys: geminiKeys.length,
    nextKeyIndex: currentKeyIndex,
    hasGrokFallback: !!process.env.GROK_API_KEY,
  };
}

module.exports = { createLLM, createStructuredLLM, getPoolStatus };
