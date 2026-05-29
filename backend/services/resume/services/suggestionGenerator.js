// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from "dotenv";

// dotenv.config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const DEFAULT_RESUME_SUGGESTIONS = `Your resume analysis completed, but the AI suggestion engine is unavailable.

// Recommended best practices:
// - Use a clean, ATS-friendly structure with clearly labeled sections.
// - Add measurable achievements and strong action verbs for each role.
// - Include technical skills and keywords that match your target job.
// - Keep formatting simple: avoid images, tables, and headers or footers.
// - Use bullet points for responsibilities and accomplishments.`;

// async function safeGenerateSuggestions(prompt, retryCount = 0) {
//   try {
//     const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
//     const model = genAI.getGenerativeModel({ model: modelName });
//     const result = await model.generateContent(prompt);
//     return result.response.text();
//   } catch (error) {
//     const message = error?.message || String(error);
//     if ((message.includes("429") || message.includes("503") || message.includes("Service Unavailable") || message.includes("overloaded")) && retryCount < 3) {
//       const delay = (retryCount + 1) * 3000;
//       console.warn(`[Resume Suggestion] Transient error (429/503). Retrying in ${delay}ms...`);
//       await new Promise((resolve) => setTimeout(resolve, delay));
//       return safeGenerateSuggestions(prompt, retryCount + 1);
//     }
//     throw error;
//   }
// }

// export async function generateSuggestions(resume, job) {
//   const prompt = `
// Analyze the resume and suggest improvements to increase ATS score.

// Resume:
// ${resume}
// `;

//   try {
//     return await safeGenerateSuggestions(prompt);
//   } catch (error) {
//     console.error("[Resume Suggestion] Gemini generation failed:", error?.message || error);
//     return DEFAULT_RESUME_SUGGESTIONS;
//   }
// }

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const DEFAULT_RESUME_SUGGESTIONS = `Your resume analysis completed, but the AI suggestion engine is unavailable.

Recommended best practices:
- Use a clean, ATS-friendly structure with clearly labeled sections.
- Add measurable achievements and strong action verbs for each role.
- Include technical skills and keywords that match your target job.
- Keep formatting simple: avoid images, tables, and headers or footers.
- Use bullet points for responsibilities and accomplishments.`;

async function safeGenerateSuggestions(prompt, retryCount = 0) {
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    const message = error?.message || String(error);

    if (message.includes("not found") && modelName !== "gemini-2.5-flash") {
      console.warn(
        `[Resume Suggestion] Model ${modelName} unavailable, retrying with gemini-2.5-flash`
      );
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      return fallbackResult.response.text();
    }

    if (
      (message.includes("429") ||
        message.includes("503") ||
        message.includes("Service Unavailable") ||
        message.includes("overloaded")) &&
      retryCount < 3
    ) {
      const delay = (retryCount + 1) * 3000;
      console.warn(`[Resume Suggestion] Transient error. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return safeGenerateSuggestions(prompt, retryCount + 1);
    }

    throw error;
  }
}

export async function generateSuggestions(resume, jobDescription, skills, jobTitle) {
  const prompt = `
You are an ATS resume analyst.
Target job title: ${jobTitle}
Target job description:
${jobDescription}

Extracted skills:
${skills.length > 0 ? skills.join(", ") : "None"}

Candidate resume:
${resume}

Provide:
1. ATS-specific improvements
2. keyword gaps and missing skills
3. formatting and structure suggestions
4. a short summary of ATS readiness

Keep your response concise and practical.
`;

  try {
    return await safeGenerateSuggestions(prompt);
  } catch (error) {
    console.error("[Resume Suggestion] Gemini generation failed:", error?.message || error);
    return DEFAULT_RESUME_SUGGESTIONS;
  }
}