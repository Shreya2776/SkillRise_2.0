import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function safeGenerate(prompt, retryCount = 0) {
  const modelName = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    const message = err?.message || String(err);

    if (message.includes("not found") && modelName !== "gemini-2.5-flash") {
      console.warn(
        `[Resume Skill Extractor] Model ${modelName} unavailable, retrying with gemini-2.5-flash`,
      );
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      return fallbackResult.response.text();
    }

    if ((message.includes("429") || message.includes("503") || message.includes("Service Unavailable") || message.includes("overloaded")) && retryCount < 3) {
      const delay = (retryCount + 1) * 3000;
      console.warn(`[Resume Skill Extractor] Transient error (429/503). Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return safeGenerate(prompt, retryCount + 1);
    }
    throw err;
  }
}

export async function extractSkills(resumeText) {
  const prompt = `
Extract technical skills from this resume.

Resume:
${resumeText}

Return JSON only:
{"skills":[]}
`;

  const text = await safeGenerate(prompt);

  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    return [];
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return parsed.skills || [];
}
