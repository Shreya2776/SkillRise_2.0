import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.warn("⚠️ GOOGLE_GENERATIVE_AI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "dummy_key");

/**
 * PRODUCTION MODEL: gemini-2.5-flash
 * Strict JSON Response Mode Enabled
 */
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json"
  }
});

export { genAI, geminiModel };
