// Job Recommender Tool
// PRIMARY: Groq (llama-3.3-70b) — fast structured schema output
// NO GEMINI — save Gemini 2.5-flash quota for resume parsing only
// CACHE: 30-minute TTL — job recommendations for same skills are stable

const { Pinecone } = require('@pinecone-database/pinecone');
const { pipeline } = require('@xenova/transformers');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { ChatOpenAI } = require('@langchain/openai');
const { z } = require('zod');
const duckDuckGoSearch = require('./duckduckgoSearch.cjs');
const cache = require('../utils/responseCache.cjs');

const EMBEDDING_MODEL = 'Xenova/bge-small-en-v1.5';
let generatorPromise = null;
const SIMILARITY_THRESHOLD = 0.4;

const jobRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      jobTitle: z.string(),
      matchScore: z.number(),
      reasoning: z.string(),
      keySkillsMatched: z.array(z.string()),
      skillsToAcquire: z.array(z.string()).optional()
    })
  )
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
    console.error("[JobRecommender] Embedding error:", err.message);
    return [];
  }
}

async function queryPinecone(embedding, indexName, topK = 5) {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) throw new Error("PINECONE_API_KEY is not set");

  const pinecone = new Pinecone({ apiKey });
  const index = pinecone.index(indexName);
  const queryResponse = await index.query({ topK, vector: embedding, includeMetadata: true });

  return (queryResponse.matches || [])
    .filter(m => m.score >= SIMILARITY_THRESHOLD)
    .map(match => ({
      jobTitle: match.metadata?.jobTitle || 'Unknown Role',
      requiredSkills: match.metadata?.requiredSkills || 'General Skills',
      industry: match.metadata?.industry || 'Tech',
      similarityScore: match.score
    }));
}

/**
 * Call LLM with structured job recommendations
 * Groq ONLY — no Gemini (save quota for resume parsing)
 */
async function callLLM(prompt) {
  console.log("[JobRecommender] Calling Groq...");
  const groqLlm = new ChatOpenAI({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    apiKey: process.env.GROK_API_KEY,
    configuration: { baseURL: "https://api.groq.com/openai/v1" },
    maxRetries: 2  // Retry within Groq, no Gemini needed
  });
  const structured = groqLlm.withStructuredOutput(jobRecommendationSchema, { method: "functionCalling", name: "recommendJobs" });
  return await structured.invoke(prompt);
}

const recommendJobs = async (userSkills, externalContext = null) => {
  try {
    const skillsText = Array.isArray(userSkills) ? userSkills.join(', ') : userSkills;
    if (!skillsText?.trim()) {
      return { status: "error", message: "User skills missing", data: [] };
    }

    // ─── Cache check ──────────────────────────────────────────────────────────
    const cacheKey = cache.hash(`jobrec:${skillsText}`);
    if (cache.has(cacheKey)) {
      console.log("[JobRecommender] Returning cached job recommendations.");
      return cache.get(cacheKey);
    }

    console.log(`[JobRecommender] Finding jobs for skills: ${skillsText}`);

    let jobContext = "";
    let source = "llm_generative";

    // ─── Step 0: Use external context from RetrieverNode if provided ─────────
    if (externalContext && Array.isArray(externalContext) && externalContext.length > 0) {
      console.log(`[JobRecommender] Using ${externalContext.length} results from RetrieverNode (skipping Pinecone + DDG).`);
      jobContext = `JOB CONTEXT FROM CENTRALIZED RETRIEVER:\n${externalContext.map(item => item.content || item.name || JSON.stringify(item)).join('\n')}`;
      source = "retriever_node";
    }
    // ─── Step 1: Pinecone Similarity (skipped if external context was used) ───
    if (!jobContext) {
    try {
      const embedding = await getEmbedding(skillsText);
      if (embedding.length > 0) {
        const similarJobs = await queryPinecone(embedding, 'job-skills', 5);
        if (similarJobs.length > 0) {
          jobContext = `SIMILAR JOBS FROM VECTOR DB:\n${JSON.stringify(similarJobs, null, 2)}`;
          source = "pinecone_similarity";
          console.log(`[JobRecommender] Pinecone: ${similarJobs.length} matches above threshold.`);
        }
      }
    } catch (pineconeErr) {
      console.warn(`[JobRecommender] Pinecone failed: ${pineconeErr.message}`);
    }
    }

    // ─── Step 2: DuckDuckGo fallback ─────────────────────────────────────────
    if (!jobContext) {
      try {
        const query = `entry level software engineer internship jobs for ${skillsText} 2024`;
        const webResults = await duckDuckGoSearch(query);
        if (webResults.status === "success" && webResults.data?.length > 0) {
          jobContext = `WEB SEARCH RESULTS:\n${webResults.data.map(w => `- ${w.title}: ${w.description}`).join('\n')}`;
          source = "web_search";
          console.log(`[JobRecommender] DDG: ${webResults.data.length} results.`);
        }
      } catch (ddgErr) {
        console.warn(`[JobRecommender] DDG failed: ${ddgErr.message}`);
      }
    }

    // ─── Step 3: LLM fallback ─────────────────────────────────────────────────
    if (!jobContext) {
      jobContext = "NO EXTERNAL DATA. Use your AI knowledge to recommend 5 entry-level roles.";
    }

    const systemPrompts = require('../prompts/systemPrompts.cjs');
    const prompt = `
      ${systemPrompts.SYSTEM_GUARDRAILS}
      ${systemPrompts.CAREER_AGENT_PROMPT}
      
      User's Current Skills: ${skillsText}
      Context: ${jobContext}
      
      RULES:
      - Use context for grounding when available, otherwise generate freely.
      - Focus on realistic entry/intern level roles.
      - For each role: matchScore (0-100), reasoning, matched skills, what to acquire.
    `;

    let recommendations;
    try {
      recommendations = await callLLM(prompt);
    } catch (llmErr) {
      console.error("[JobRecommender] Both LLMs failed:", llmErr.message);
      return { status: "error", message: "Failed to generate recommendations", data: [] };
    }

    const finalData = (recommendations.recommendations || []).slice(0, 5);
    const result = {
      status: "success",
      data: finalData,
      source,
      reasoning: "Groq (primary) + Pinecone similarity + web search fallback."
    };

    // Cache the result (30-minute TTL)
    cache.set(cacheKey, result, cache.TTL.JOB_RECS);

    console.log(`[JobRecommender] Done. ${finalData.length} recommendations. Source: ${source}`);
    return result;

  } catch (error) {
    console.error("[JobRecommender] Fatal error:", error);
    return { status: "error", message: error.message, data: [] };
  }
};

module.exports = { recommendJobs };
