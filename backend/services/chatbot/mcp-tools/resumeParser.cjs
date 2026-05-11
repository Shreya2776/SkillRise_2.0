// Resume Parser Tool
// PRIMARY: Gemini 2.5-flash — THE ONLY PLACE Gemini is used as primary
//          Superior PDF + document comprehension, complex structured extraction
//          Justified: resume is processed ONCE per file (60-min cache) = very few Gemini calls
// FALLBACK: Groq (llama-3.3-70b) — if Gemini 2.5-flash quota exhausted

const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { createStructuredLLM } = require('../utils/llmFactory.cjs');
const { z } = require("zod");
const cache = require('../utils/responseCache.cjs');

const resumeSchema = z.object({
  name: z.string().optional(),
  summary: z.string().optional(),
  contact: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
  }).optional(),
  skills: z.array(z.string()).describe("All technical and soft skills extracted from resume"),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    graduationDate: z.string().optional()
  })).optional(),
  experience: z.array(z.object({
    jobTitle: z.string(),
    company: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional()
  })).optional()
});

/**
 * Call LLM for resume extraction
 * Uses llmFactory for round-robin Gemini + automatic Grok fallback.
 * Cached per file (60 min) so real-world call rate is very low.
 */
async function callLLMForResumeParsing(prompt) {
  console.log("[ResumeParser] Calling LLM (round-robin + fallback)...");
  const structuredLlm = createStructuredLLM(resumeSchema, {
    temperature: 0,
    caller: "resumeParser",
    name: "parseResume",
  });
  return await structuredLlm.invoke(prompt);
}


const parseResume = async (filePath) => {
  try {
    if (!filePath) {
      return { status: "error", message: "No resume file path provided", data: [] };
    }

    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      return { status: "error", message: `File not found: ${absolutePath}`, data: [] };
    }

    // ─── Cache check (keyed to file path + size for uniqueness) ───────────────
    const stat = fs.statSync(absolutePath);
    const cacheKey = cache.hash(`resume:${absolutePath}:${stat.size}:${stat.mtimeMs}`);
    if (cache.has(cacheKey)) {
      console.log("[ResumeParser] Returning cached resume analysis.");
      return cache.get(cacheKey);
    }

    console.log(`[ResumeParser] Parsing resume: ${absolutePath}`);

    // ─── Extract PDF text ────────────────────────────────────────────────────
    const pdfBuffer = fs.readFileSync(absolutePath);
    let pdfText = "";
    try {
      console.log("[ResumeParser] Parsing PDF buffer...");
      const pdfData = await pdfParse(pdfBuffer);
      pdfText = pdfData.text || "";
      console.log(`[ResumeParser] Extracted ${pdfText.length} chars from PDF.`);
    } catch (pdfErr) {
      console.error("[ResumeParser] PDF parsing error:", pdfErr.message);
      return { status: "error", message: "Failed to read PDF file", data: [] };
    }

    if (!pdfText.trim()) {
      return { status: "error", message: "PDF appears to be empty or unreadable", data: [] };
    }

    const prompt = `
      You are an expert resume parser. Extract all information from the following resume text.
      Be thorough — capture ALL skills mentioned (technical tools, languages, frameworks, soft skills).
      
      Resume Content:
      ${pdfText.substring(0, 8000)}
      
      Extract: candidate name, contact info, all skills, education history, and work experience.
    `;

    let parsedResume;
    try {
      parsedResume = await callLLMForResumeParsing(prompt);
    } catch (llmErr) {
      console.error("[ResumeParser] Both LLMs failed:", llmErr.message);
      return { status: "error", message: "LLM resume parsing failed", data: [] };
    }

    console.log(`[ResumeParser] Extracted ${parsedResume.skills?.length || 0} skills.`);

    const result = {
      status: "success",
      source: "resumeParser",
      reasoning: `Extracted ${parsedResume.skills?.length || 0} skills via Gemini (primary).`,
      data: {
        userSkills: parsedResume.skills || [],
        education: parsedResume.education || [],
        experience: parsedResume.experience || [],
        resumeAnalysis: {
          name: parsedResume.name,
          summary: parsedResume.summary,
          contact: parsedResume.contact
        }
      }
    };

    // Cache result (keyed to file — won't re-parse same resume)
    cache.set(cacheKey, result, 60 * 60 * 1000); // 60 minute TTL for resume
    return result;

  } catch (error) {
    console.error("[ResumeParser] Fatal error:", error.message);
    return { status: "error", message: error.message, data: [] };
  }
};

module.exports = { parseResume };
