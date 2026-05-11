// Retriever Node
// LangGraph node that queries Pinecone for relevant dataset entries based on the user's query.
// Runs AFTER the router (which decides which datasets are needed) and BEFORE the specialist agents.
// Falls back gracefully — if Pinecone is unreachable or returns nothing, agents still work.

const { Pinecone } = require("@pinecone-database/pinecone");
const { generateEmbedding } = require('../memory/vectorMemory.cjs');

// ─── Pinecone client (singleton, reuses the same client across calls) ────────
let _index = null;
function getPineconeIndex() {
  if (!_index) {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "dummy-key" });
    _index = pinecone.index(process.env.PINECONE_INDEX_NAME || "chat-memory");
  }
  return _index;
}

// ─── Dataset type → Pinecone metadata `type` value mapping ──────────────────
// These MUST match the `type` values used in embedDatasetToPinecone.js
const DATASET_TYPE_MAP = {
  jobs:           "job",
  skills:         "skill",
  courses:        "course",
  gov_schemes:    "scheme",
  career_guides:  "path"
};

/**
 * Query Pinecone for a single dataset type.
 * Returns top-K results with their metadata.
 *
 * @param {number[]} queryVector  - Pre-computed embedding of the user query
 * @param {string}   datasetType  - One of: jobs, skills, courses, gov_schemes, career_guides
 * @param {number}   topK         - Number of results to return (default 5)
 * @returns {Array<Object>}       - Array of { id, score, content, name, type }
 */
async function queryDataset(queryVector, datasetType, topK = 5) {
  try {
    const index = getPineconeIndex();
    const pineconeType = DATASET_TYPE_MAP[datasetType];

    if (!pineconeType) {
      console.warn(`[RetrieverNode] Unknown dataset type: "${datasetType}" — skipping.`);
      return [];
    }

    const response = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      filter: {
        type: { $eq: pineconeType }
      }
    });

    return (response.matches || []).map(match => ({
      id: match.id,
      score: match.score,
      content: match.metadata?.content || "",
      name: match.metadata?.name || match.id,
      type: pineconeType
    }));
  } catch (err) {
    console.error(`[RetrieverNode] Pinecone query failed for "${datasetType}":`, err.message);
    return [];
  }
}

/**
 * Retriever Node for LangGraph
 *
 * Reads `state.userQuery` and `state.datasets` (set by routerAgent).
 * Generates a single embedding and fans out queries to each requested dataset namespace.
 * Returns `{ retrievedData: { jobs: [...], courses: [...], ... } }`.
 *
 * SAFETY: If Pinecone is down or datasets is empty, returns `retrievedData: {}` —
 *         downstream agents will fall back to their existing tool-based logic.
 *
 * @param {Object} state - LangGraph state
 * @returns {Object}     - State update with `retrievedData`
 */
async function retrieverNode(state) {
  console.log("--- RETRIEVER NODE EXECUTION ---");

  const query = state.userQuery || "";
  const datasets = state.datasets || [];

  if (!query.trim() && datasets.length === 0) {
    console.warn("[RetrieverNode] No query and no datasets — returning empty retrievedData.");
    const buildUserContext = require('../utils/contextBuilder.cjs');
    return { retrievedData: {}, userContext: buildUserContext(state) };
  }

  // Build an enriched query string for better embedding quality
  const userSkills = state.data?.userSkills || [];
  const targetRole = state.data?.targetRole || "";
  const enrichedQuery = [
    query,
    userSkills.length > 0  ? `Skills: ${userSkills.join(", ")}` : "",
    targetRole             ? `Target Role: ${targetRole}`       : ""
  ].filter(Boolean).join(". ");

  // Generate embedding ONCE and reuse across all dataset queries
  let queryVector;
  try {
    queryVector = await generateEmbedding(enrichedQuery);
    if (!queryVector || queryVector.length === 0) {
      console.warn("[RetrieverNode] Embedding generation returned empty vector — returning empty retrievedData.");
      return { retrievedData: {}, userContext: buildUserContext(state) };
    }
  } catch (err) {
    console.error("[RetrieverNode] Embedding generation failed:", err.message);
    const buildUserContext = require('../utils/contextBuilder.cjs');
    return { retrievedData: {}, userContext: buildUserContext(state) };
  }

  // Fan out queries to all requested datasets in parallel
  const datasetsToQuery = datasets.length > 0 ? datasets : Object.keys(DATASET_TYPE_MAP);
  console.log(`[RetrieverNode] Querying Pinecone for datasets: ${datasetsToQuery.join(", ")}`);

  const results = await Promise.allSettled(
    datasetsToQuery.map(async (ds) => {
      const matches = await queryDataset(queryVector, ds, 5);
      return { dataset: ds, matches };
    })
  );

  // Assemble the retrievedData object
  const retrievedData = {};
  for (const result of results) {
    if (result.status === "fulfilled") {
      const { dataset, matches } = result.value;
      if (matches.length > 0) {
        retrievedData[dataset] = matches;
      }
    }
  }

  const totalResults = Object.values(retrievedData).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`[RetrieverNode] Retrieved ${totalResults} total results across ${Object.keys(retrievedData).length} datasets.`);

  const buildUserContext = require('../utils/contextBuilder.cjs');
  const userContext = buildUserContext(state);

  return { retrievedData, userContext };
}

module.exports = retrieverNode;
