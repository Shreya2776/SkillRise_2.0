// Skill Matcher Tool
// PRIMARY: Groq (llama-3.3-70b) — fast structured schema output, high throughput
// NO GEMINI — structured JSON is Groq's strength; save Gemini quota for resume parsing
// CACHE: 20-minute TTL — same skills won't re-hit LLM for 20 minuteshe same skill set rarely change

const { Pinecone } = require('@pinecone-database/pinecone');
const { pipeline } = require('@xenova/transformers');
const { createStructuredLLM } = require('../utils/llmFactory.cjs');
const { z } = require('zod');
const cache = require('../utils/responseCache.cjs');

const EMBEDDING_MODEL = 'Xenova/bge-small-en-v1.5';
let generatorPromise = null;
const SIMILARITY_THRESHOLD = 0.35;

const gapAnalysisSchema = z.object({
  targetRole: z.string().describe("The most suitable job title based on the user's skills"),
  matchedSkills: z.array(z.string()).describe("Skills the user already has that match the target role"),
  skillGaps: z.array(z.string()).describe("Required skills the user is missing (Skill Gap)"),
  learningRoadmap: z.array(
    z.object({
      step: z.number(),
      topic: z.string(),
      description: z.string(),
      suggestedProject: z.string()
    })
  ).describe("Structured step-by-step roadmap to bridge skill gaps"),
});

async function getEmbedding(text) {
  try {
    if (!generatorPromise) {
      generatorPromise = pipeline('feature-extraction', EMBEDDING_MODEL, { quantized: true });
    }
    const extractor = await generatorPromise;
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (err) {
    console.error("[SkillMatcher] Embedding error:", err.message);
    return [];
  }
}

async function querySimilarJobs(embedding, topK = 3) {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) throw new Error("PINECONE_API_KEY is not set");

  const pinecone = new Pinecone({ apiKey });
  const index = pinecone.index('job-skills');
  const queryResponse = await index.query({ topK, vector: embedding, includeMetadata: true });

  return (queryResponse.matches || [])
    .filter(m => m.score >= SIMILARITY_THRESHOLD)
    .map(match => ({
      jobTitle: match.metadata?.jobTitle || 'Unknown Role',
      requiredSkills: match.metadata?.requiredSkills || 'General Skills',
      similarityScore: match.score,
    }));
}

/**
 * Call LLM for skill gap analysis using round-robin Gemini + Grok fallback.
 */
async function callLLMForGapAnalysis(prompt) {
  const structured = createStructuredLLM(gapAnalysisSchema, {
    temperature: 0.2,
    caller: "skillMatcher",
    name: "matchSkills",
  });
  return await structured.invoke(prompt);
}

const matchSkills = async (userSkills, externalContext = null) => {
  try {
    const skillsText = Array.isArray(userSkills) ? userSkills.join(', ') : userSkills;
    if (!skillsText?.trim()) {
      return { status: "error", message: "No user skills provided", data: [] };
    }

    // ─── Cache check ──────────────────────────────────────────────────────────
    const cacheKey = cache.hash(`skillmatch:${skillsText}`);
    if (cache.has(cacheKey)) {
      console.log("[SkillMatcher] Returning cached skill analysis.");
      return cache.get(cacheKey);
    }

    console.log(`[SkillMatcher] Analyzing skills: ${skillsText}`);

    let jobContextStr = "No similar database entries found. Use general industry knowledge.";
    let source = "llm_generative";

    // ─── Step 0: Use external context from RetrieverNode if provided ─────────
    if (externalContext && Array.isArray(externalContext) && externalContext.length > 0) {
      console.log(`[SkillMatcher] Using ${externalContext.length} results from RetrieverNode (skipping Pinecone).`);
      jobContextStr = `JOB/SKILL CONTEXT FROM CENTRALIZED RETRIEVER:\n${externalContext.map(item => item.content || item.name || JSON.stringify(item)).join('\n')}`;
      source = "retriever_node";
    }

    // ─── Step 1: Pinecone Similarity (skipped if external context was used) ───
    if (source !== "retriever_node") {
    try {
      const embedding = await getEmbedding(skillsText);
      if (embedding.length > 0) {
        const similarJobs = await querySimilarJobs(embedding, 3);
        if (similarJobs.length > 0) {
          jobContextStr = `SIMILAR JOB ROLES (semantic search):\n${JSON.stringify(similarJobs, null, 2)}`;
          source = "pinecone_similarity";
          console.log(`[SkillMatcher] Pinecone: ${similarJobs.length} matches above threshold.`);
        }
      }
    } catch (pineconeErr) {
      console.warn(`[SkillMatcher] Pinecone failed: ${pineconeErr.message}`);
    }
    }

    // ─── Step 2: LLM Gap Analysis ─────────────────────────────────────────────
    const systemPrompts = require('../prompts/systemPrompts.cjs');
    const prompt = `
      ${systemPrompts.SYSTEM_GUARDRAILS}
      ${systemPrompts.SKILL_AGENT_PROMPT}
      
      User's Current Skills: ${skillsText}
      
      Context (Similar Job Roles): ${jobContextStr}
      
      RULES:
      - Determine the most suitable Target Role.
      - Identify skill gaps (what the role requires but the user lacks).
      - Generate a practical 4-6 step learning roadmap.
      - Use Pinecone context if available, otherwise use LLM knowledge.
    `;

    let gapAnalysis;
    try {
      gapAnalysis = await callLLMForGapAnalysis(prompt);
    } catch (llmErr) {
      console.error("[SkillMatcher] Both LLMs failed:", llmErr.message);
      return { status: "error", message: "Failed to generate skill gap analysis", data: [] };
    }

    const result = {
      status: "success",
      source,
      reasoning: "Skill gap analysis via Groq (primary) + Pinecone semantic search.",
      data: { analysis: gapAnalysis }
    };

    // Cache the result (20-minute TTL)
    cache.set(cacheKey, result, cache.TTL.SKILL_ANALYSIS);

    console.log(`[SkillMatcher] Done. Source: ${source}`);
    return result;

  } catch (error) {
    console.error("[SkillMatcher] Fatal error:", error);
    return { status: "error", message: error.message, data: [] };
  }
};

module.exports = { matchSkills };
