import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function safeGenerate(prompt, retryCount = 0) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    if (err.message.includes("429") && retryCount < 3) {
      console.warn(`Quota hit. Retrying...`);
      await new Promise(r => setTimeout(r, 40000));
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