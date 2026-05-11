import { geminiModel } from "../config/googleAI.js";
import { extractJSON } from "../utils/aiParsers.js";

/**
 * PRODUCTION-READY AI UTILITIES (GEMINI 1.5 FLASH)
 */

const withTimeout = (promise, ms = 20000) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout: AI did not respond within ${ms / 1000}s`)), ms)
  );
  return Promise.race([promise, timeout]);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async (fn, retries = 2) => {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) {
        const waitSec = (i + 1) * 5; // 5s, 10s backoff
        console.warn(`⚠️ [AI SERVICE] Attempt ${i + 1} failed. Retrying in ${waitSec}s...`);
        await delay(waitSec * 1000);
      }
    }
  }
  throw lastError;
};

/**
 * GENERATE QUESTIONS (Production Prompt Engine)
 */
export const generateQuestions = async (
  role,
  techStack,
  difficulty,
  type = "technical",
  count = 5,
  language = "English"
) => {
  const isGenericSkills = !techStack || techStack === "General" || techStack.trim() === "";
  const skills = isGenericSkills 
    ? `(No specific skills provided — derive relevant tools, skills, and domain knowledge from the "${role}" role itself)` 
    : techStack;

  const prompt = `
Generate EXACTLY ${count} high-quality interview questions.

CONTEXT:
- Role: ${role}
- Skills/Tools: ${skills}
- Difficulty Level: ${difficulty} (junior / mid / senior)
- Interview Type: ${type} (technical / behavioral / mixed)
- Language: ${language}

INSTRUCTIONS:

1. Language Enforcement (STRICT):
   - Generate all questions STRICTLY in ${language}.
   - If "Hindi": Use simple, conversational Hindi (Devanagari script). Avoid complex Sanskritized words.
   - If "Hinglish": Use a natural mix of Hindi and English as spoken in daily conversation.
   - If "English": Use standard plain English.

2. Question Count:
   - Generate EXACTLY ${count} questions.

3. Skill Relevance:
   - At least 70-80% questions MUST be based on the provided skills/tools.

4. Blue-Collar Support:
   - If role is blue-collar: Ask practical, job-based, safety questions.

5. Scenario-Based Questions:
   - At least 50% questions MUST be scenario-based ("What if...", "How would you handle...").

6. Language & Simplicity (CRITICAL):
   - Use plain, simple language for voice interaction. 
   - Each question must be SHORT (max 20 words).
   - ONE SENTENCE ONLY.

7. Quality Rules:
   - No generic "Tell me about yourself".
   - No repetition.
   - No explanations.

8. Output Format:
   - Return ONLY a valid JSON array of strings.
   - No markdown.

Example Output (${language}):
["Question 1 in ${language}", "Question 2 in ${language}"]
`;

  try {
    const rawResult = await withRetry(async () => {
      const result = await withTimeout(
        geminiModel.generateContent(prompt)
      );
      const response = await result.response;
      return response.text();
    });

    const parsed = extractJSON(rawResult);


    if (!Array.isArray(parsed)) {
      throw new Error("AI returned non-array format");
    }

    return parsed.slice(0, count);

  } catch (err) {
    console.error("❌ [AI SERVICE] Question Generation Failed:", err.message);
    throw err;
  }
};

/**
 * EVALUATE INTERVIEW (Unified Structure)
 */
export const evaluateInterview = async (role, questions, answers, language = "English") => {
  const transcript = questions.map((q, i) => ({
    question: q,
    answer: answers[i] || "Candidate provided no answer."
  }));

  const prompt = `Evaluate this ${language} interview transcript for a ${role} position.
  The candidate was asked questions and responded in ${language}.
  
  Transcript: ${JSON.stringify(transcript, null, 2)}
  
  RULES:
  1. Evaluate the quality of answers based on the chosen language (${language}).
  2. Provide strengths, weaknesses, and suggestions in plain English.
  3. Return ONLY a JSON object with this exact structure:
     {
       "score": number (0-100),
       "strengths": [string],
       "weaknesses": [string],
       "suggestions": [string],
       "categoryScores": {
         "communication": { "score": number, "comment": string },
         "technicalKnowledge": { "score": number, "comment": string },
         "problemSolving": { "score": number, "comment": string },
         "culturalFit": { "score": number, "comment": string },
         "confidenceClarity": { "score": number, "comment": string }
       },
       "questionFeedback": [
         {
           "question": string,
           "rating": number (1-10),
           "comment": string
         }
       ],
       "finalAssessment": string
     }`;

  try {
    const rawResult = await withRetry(async () => {
      const result = await withTimeout(geminiModel.generateContent(prompt), 15000); // Evaluation gets slightly more time
      const response = await result.response;
      return response.text();
    });

    const evaluation = extractJSON(rawResult);

    // 🛡️ Production Validation
    const required = ["score", "strengths", "weaknesses", "suggestions", "questionFeedback"];
    for (const field of required) {
      if (!evaluation[field]) throw new Error(`Missing ${field} in AI evaluation.`);
    }
    
    return evaluation;
  } catch (err) {
    console.error("❌ [AI SERVICE] Evaluation Failed:", err.message);
    throw err;
  }
};

