// Router Agent
// Uses llmFactory for round-robin Gemini key rotation + Grok fallback
// CACHE: 2-minute TTL on routing decisions for identical queries

const { createStructuredLLM } = require('../utils/llmFactory.cjs');
const routerPrompt = require('../prompts/routerPrompt.cjs');
const { z } = require("zod");
const cache = require('../utils/responseCache.cjs');

const routerSchema = z.object({
  agents: z.array(z.enum(["resumeAgent", "careerAgent", "skillAgent", "schemeAgent", "roadMapAgent", "chitchat"])).describe("List of agents to call"),
  datasets: z.array(z.enum(["jobs", "courses", "skills", "gov_schemes", "career_guides"])).optional().describe("Which Pinecone datasets to search for RAG context"),
  extractedSkills: z.array(z.string()).optional().describe("Technical or soft skills mentioned by the user"),
  targetRole: z.string().optional().describe("Target job role or career goal mentioned by the user")
});

/**
 * Router Agent — Groq Primary, Gemini Fallback
 */
async function routerAgent(state) {
  console.log("--- ROUTER AGENT EXECUTION ---");

  const query = state.userQuery || "";

  // Default routing when no query and no resume
  if (!query.trim() && !state.resumeFilePath) {
    console.warn("[RouterAgent] No query — defaulting to careerAgent.");
    return { selectedAgents: ["careerAgent"] };
  }

  // Build prompt with conversation history
  let historyText = "";
  if (state.chatHistory && state.chatHistory.length > 0) {
    historyText = "Conversation History:\n" + state.chatHistory.slice(-5)
      .map(msg => `[${msg.role}]: ${msg.content}`)
      .join("\n") + "\n\n";
  }
  const promptText = routerPrompt + "\n" + historyText + "User's Final Query: " + query;

  // ─── Cache check ─────────────────────────────────────────────────────────────
  const cacheKey = cache.hash(promptText);
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    console.log("[RouterAgent] Returning cached routing decision.");
    return buildRouterOutput(cached, state);
  }

  try {
    let rawResponse;

    try {
      console.log("[RouterAgent] Calling LLM (round-robin + fallback)...");
      const structuredLlm = createStructuredLLM(routerSchema, {
        temperature: 0,
        caller: "routerAgent",
        name: "router",
      });
      rawResponse = await structuredLlm.invoke(promptText);
      console.log("[RouterAgent] LLM routing succeeded.");
    } catch (llmErr) {
      console.warn(`[RouterAgent] LLM failed (${llmErr.message}). Using safe default routing.`);
      // Robust Regex Fallback
      let fallbackAgents = state.resumeFilePath ? ["resumeAgent", "careerAgent", "skillAgent"] : ["careerAgent", "skillAgent"];
      if (query.toLowerCase().includes("scheme") || query.toLowerCase().includes("government") || query.toLowerCase().includes("gov")) {
         fallbackAgents.push("schemeAgent");
      }
      if (query.toLowerCase().includes("roadmap") || query.toLowerCase().includes("road map")) {
         fallbackAgents.push("roadMapAgent");
      }
      rawResponse = {
        agents: Array.from(new Set(fallbackAgents)),
        datasets: [],
        extractedSkills: [],
        targetRole: null
      };
    }

    // Cache the raw routing response
    cache.set(cacheKey, rawResponse, cache.TTL.ROUTER);

    return buildRouterOutput(rawResponse, state);

  } catch (error) {
    console.error(`[RouterAgent] Both LLMs failed: ${error.message}`);
    return { selectedAgents: ["careerAgent"] };
  }
}

// ─── Agent-to-Dataset mapping for auto-inference ─────────────────────────────
const AGENT_DATASET_MAP = {
  careerAgent:  ["jobs", "courses"],
  skillAgent:   ["skills", "jobs"],
  schemeAgent:  ["gov_schemes"],
  roadMapAgent: ["career_guides", "courses"],
  resumeAgent:  ["jobs", "skills"]
};

function buildRouterOutput(rawResponse, state) {
  let agents = rawResponse.agents || [];

  // Always inject resumeAgent if a resume file is uploaded
  if (state.resumeFilePath && !agents.includes("resumeAgent")) {
    console.log("[RouterAgent] Auto-injecting resumeAgent (resume detected).");
    agents = [...new Set([...agents, "resumeAgent", "skillAgent", "careerAgent"])];
  }

  // Filter to valid agent pool
  const validAgents = ["resumeAgent", "careerAgent", "skillAgent", "schemeAgent", "roadMapAgent", "chitchat"];
  agents = agents.filter(a => validAgents.includes(a));
  if (agents.length === 0) agents = ["careerAgent"];

  console.log(`[RouterAgent] Selected agents: ${agents.join(", ")}`);

  // ─── Dataset selection (LLM output + auto-infer from agents) ────────────
  let datasets = rawResponse.datasets || [];
  const validDatasets = ["jobs", "courses", "skills", "gov_schemes", "career_guides"];
  datasets = datasets.filter(d => validDatasets.includes(d));

  // Auto-infer datasets from selected agents if LLM missed them
  for (const agent of agents) {
    const mapped = AGENT_DATASET_MAP[agent] || [];
    for (const ds of mapped) {
      if (!datasets.includes(ds)) datasets.push(ds);
    }
  }
  // Chitchat needs no datasets
  if (agents.length === 1 && agents[0] === "chitchat") datasets = [];

  console.log(`[RouterAgent] Selected datasets: ${datasets.join(", ") || "(none)"}`);

  const outputData = {};
  if (!state.resumeFilePath && rawResponse.extractedSkills?.length > 0) {
    outputData.userSkills = rawResponse.extractedSkills;
    console.log(`[RouterAgent] Extracted skills: ${rawResponse.extractedSkills.join(", ")}`);
  }
  if (rawResponse.targetRole) {
    outputData.targetRole = rawResponse.targetRole;
  }

  return { selectedAgents: agents, datasets, data: outputData };
}

module.exports = routerAgent;
