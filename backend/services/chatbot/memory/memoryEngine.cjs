// ═══════════════════════════════════════════════════════════════════════════════
// Memory Engine — Persistent User Intelligence Layer
// ═══════════════════════════════════════════════════════════════════════════════
// Manages the full lifecycle of user memory:
//   1. getUserMemory()       — fetch or create default memory
//   2. updateUserMemory()    — extract signals via LLM, update scores, apply decay
//   3. personalizeContext()  — enhance queries using top interests + goals
//
// Architecture:
//   MongoDB (UserMemory model) ← memoryEngine → LLM (signal extraction)

const UserMemory = require('../../../shared/models/UserMemory.js').default;
const { createLLM } = require('../utils/llmFactory.cjs');

// ─── Constants ───────────────────────────────────────────────────────────────
const INTEREST_INCREMENT = 0.1;
const INTEREST_CAP = 1.0;
const DECAY_FACTOR = 0.9;
const MAX_PAST_RECOMMENDATIONS = 50;     // Keep last N recommendations
const LLM_TEMPERATURE = 0.2;
const MAX_RETRIES = 2;

// ─── In-memory cache (avoids hitting MongoDB on every call) ─────────────────
const memoryCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(userId) {
  const entry = memoryCache.get(userId);
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  return null;
}

function setCache(userId, data) {
  memoryCache.set(userId, { data, ts: Date.now() });
}

function invalidateCache(userId) {
  memoryCache.delete(userId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 1: getUserMemory — Fetch or create default memory
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Retrieve user memory from MongoDB. Creates a default entry if none exists.
 *
 * @param {string} userId - The user's unique identifier
 * @returns {Promise<Object>} The user memory document
 */
async function getUserMemory(userId) {
  if (!userId) {
    console.warn("[MemoryEngine] getUserMemory called without userId.");
    return createDefaultMemory("anonymous");
  }

  // Check cache first
  const cached = getCached(userId);
  if (cached) {
    console.log(`[MemoryEngine] Cache hit for user ${userId}`);
    return cached;
  }

  try {
    let memory = await UserMemory.findOne({ userId });

    if (!memory) {
      console.log(`[MemoryEngine] No memory found for ${userId}. Creating default.`);
      memory = await UserMemory.create(createDefaultMemory(userId));
    }

    setCache(userId, memory);
    return memory;
  } catch (error) {
    console.error(`[MemoryEngine] Error fetching memory for ${userId}:`, error.message);
    return createDefaultMemory(userId);
  }
}

/**
 * Build a default memory object for a new user.
 */
function createDefaultMemory(userId) {
  return {
    userId,
    goals: [],
    interests: {},
    skillFocus: {},
    pastRecommendations: [],
    interactionSignals: {
      totalQueries: 0,
      domainCounts: {}
    },
    lastUpdated: new Date()
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 2: updateUserMemory — Extract signals, update scores, apply decay
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract structured signals from a query using LLM.
 * Returns { interests: string[], intent: string, goalHints: string[] }
 */
async function extractSignalsViaLLM(query) {
  const prompt = `You are an AI signal extractor. Given a user query from a career assistant platform, extract structured signals.

User Query:
"${query}"

Extract the following:
- interests: topics the user is interested in (e.g. "AI", "Web Development", "Data Science", "Cloud Computing")
- intent: the user's primary intent (one of: "learning", "job_search", "resume_help", "skill_assessment", "career_guidance", "general")
- goalHints: any career aspirations or goals mentioned or implied (e.g. "become a data scientist", "get a backend developer job")

Return ONLY a valid JSON object — no markdown, no explanation:
{
  "interests": [],
  "intent": "",
  "goalHints": []
}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const llm = createLLM({ temperature: LLM_TEMPERATURE, caller: "memoryEngine" });
      const response = await llm.invoke(prompt);
      const text = (response.content || "").replace(/```json\s*/gi, "").replace(/```/g, "").trim();

      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.interests && parsed.intent) return parsed;
      }
    } catch (err) {
      console.warn(`[MemoryEngine] LLM signal extraction attempt ${attempt} failed: ${err.message}`);
    }
  }

  // Fallback: return empty signals
  console.warn("[MemoryEngine] Signal extraction failed. Returning empty signals.");
  return { interests: [], intent: "general", goalHints: [] };
}

/**
 * Extract recommendations from a structured response object.
 * Scans careerRecommendations, courses, governmentSchemes.
 */
function extractRecommendationsFromResponse(responseData) {
  const recs = [];

  if (responseData.careerRecommendations) {
    for (const job of responseData.careerRecommendations) {
      recs.push({
        type: "job",
        title: job.jobTitle || job.role || job.title || "Unknown Job",
        metadata: { matchScore: job.matchScore },
        timestamp: new Date()
      });
    }
  }

  if (responseData.courses) {
    for (const course of responseData.courses) {
      recs.push({
        type: "course",
        title: course.name || course.title || "Unknown Course",
        metadata: { link: course.link, provider: course.provider },
        timestamp: new Date()
      });
    }
  }

  if (responseData.governmentSchemes) {
    for (const scheme of responseData.governmentSchemes) {
      recs.push({
        type: "scheme",
        title: scheme.name || scheme.title || "Unknown Scheme",
        metadata: { link: scheme.link, provider: scheme.provider },
        timestamp: new Date()
      });
    }
  }

  return recs;
}

/**
 * Update user memory after a query-response cycle.
 *
 * Steps:
 *   1. Fetch existing memory
 *   2. Extract signals via LLM
 *   3. Increment interest scores (capped at 1.0)
 *   4. Update interaction signals
 *   5. Deduplicate and append goal hints
 *   6. Store new recommendations
 *   7. Apply decay to all interest scores
 *   8. Save to MongoDB
 *
 * @param {string} userId       - User ID
 * @param {string} query        - The user's query text
 * @param {Object} responseData - The structured response from the aggregator
 * @returns {Promise<Object>}   - The updated memory document
 */
async function updateUserMemory(userId, query, responseData = {}) {
  if (!userId || userId === "anonymous-user") {
    console.log("[MemoryEngine] Skipping memory update for anonymous user.");
    return null;
  }

  console.log(`[MemoryEngine] Updating memory for user ${userId}...`);

  try {
    // 1. Fetch existing memory
    let memory = await UserMemory.findOne({ userId });
    if (!memory) {
      memory = new UserMemory(createDefaultMemory(userId));
    }

    // 2. Extract signals via LLM
    const signals = await extractSignalsViaLLM(query);
    console.log(`[MemoryEngine] Extracted signals — interests: ${signals.interests.length}, intent: ${signals.intent}, goals: ${signals.goalHints.length}`);

    // 3. Increment interest scores (capped at INTEREST_CAP)
    const interests = memory.interests instanceof Map ? memory.interests : new Map(Object.entries(memory.interests || {}));
    for (const interest of signals.interests) {
      const key = interest.toLowerCase().trim();
      const current = interests.get(key) || 0;
      interests.set(key, Math.min(current + INTEREST_INCREMENT, INTEREST_CAP));
    }

    // 4. Update interaction signals
    if (!memory.interactionSignals) {
      memory.interactionSignals = { totalQueries: 0, domainCounts: new Map() };
    }
    memory.interactionSignals.totalQueries = (memory.interactionSignals.totalQueries || 0) + 1;

    const domainCounts = memory.interactionSignals.domainCounts instanceof Map
      ? memory.interactionSignals.domainCounts
      : new Map(Object.entries(memory.interactionSignals.domainCounts || {}));
    const domain = signals.intent || "general";
    domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    memory.interactionSignals.domainCounts = domainCounts;

    // 5. Deduplicate and append goal hints
    const existingGoals = new Set((memory.goals || []).map(g => g.toLowerCase().trim()));
    for (const hint of signals.goalHints) {
      const normalized = hint.toLowerCase().trim();
      if (normalized && !existingGoals.has(normalized)) {
        memory.goals.push(hint);
        existingGoals.add(normalized);
      }
    }

    // 6. Store new recommendations (avoid duplicates by title)
    const newRecs = extractRecommendationsFromResponse(responseData);
    const existingTitles = new Set((memory.pastRecommendations || []).map(r => r.title.toLowerCase()));
    for (const rec of newRecs) {
      if (!existingTitles.has(rec.title.toLowerCase())) {
        memory.pastRecommendations.push(rec);
        existingTitles.add(rec.title.toLowerCase());
      }
    }
    // Trim to keep only the most recent N recommendations
    if (memory.pastRecommendations.length > MAX_PAST_RECOMMENDATIONS) {
      memory.pastRecommendations = memory.pastRecommendations.slice(-MAX_PAST_RECOMMENDATIONS);
    }

    // 7. Apply decay to ALL interest scores
    for (const [key, value] of interests) {
      const decayed = parseFloat((value * DECAY_FACTOR).toFixed(3));
      if (decayed < 0.01) {
        interests.delete(key);   // Prune negligible interests
      } else {
        interests.set(key, decayed);
      }
    }
    memory.interests = interests;

    // 8. Save
    memory.lastUpdated = new Date();
    await memory.save();

    // Invalidate cache so next read picks up fresh data
    invalidateCache(userId);
    console.log(`[MemoryEngine] Memory updated. Goals: ${memory.goals.length}, Interests: ${interests.size}, Recs: ${memory.pastRecommendations.length}`);

    return memory;
  } catch (error) {
    console.error(`[MemoryEngine] Error updating memory for ${userId}:`, error.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 3: personalizeContext — Enhance queries using memory
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Use stored memory to enhance the user's query and produce personalization preferences.
 *
 * Logic:
 *   1. Identify top interests (score > 0.6)
 *   2. Enhance query with top interest context
 *   3. Return enhanced query + user preferences for downstream use
 *
 * @param {string} query      - The raw user query
 * @param {Object} userMemory - The user's memory document
 * @returns {{ enhancedQuery: string, userPreferences: Object }}
 */
function personalizeContext(query, userMemory) {
  if (!userMemory || !query) {
    return { enhancedQuery: query || "", userPreferences: {} };
  }

  // Extract interest map (handle both Map and plain Object)
  const interestEntries = userMemory.interests instanceof Map
    ? Array.from(userMemory.interests.entries())
    : Object.entries(userMemory.interests || {});

  // Filter top interests (score > 0.6)
  const topInterests = interestEntries
    .filter(([_, score]) => score > 0.6)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic);

  // Build enhanced query
  let enhancedQuery = query;
  if (topInterests.length > 0) {
    const interestContext = topInterests.slice(0, 3).join(", ");
    // Only enhance if the query is vague / generic
    const vaguePatterns = /^(what|how|which|suggest|recommend|help|guide|tell|show|find)/i;
    if (vaguePatterns.test(query.trim())) {
      enhancedQuery = `${query} (Context: user is interested in ${interestContext})`;
    }
  }

  // Build user preferences object for downstream injection
  const goals = userMemory.goals || [];
  const pastRecTitles = (userMemory.pastRecommendations || []).map(r => r.title);
  const totalQueries = userMemory.interactionSignals?.totalQueries || 0;

  // Determine engagement level
  let engagementLevel = "new";
  if (totalQueries >= 20) engagementLevel = "power_user";
  else if (totalQueries >= 5) engagementLevel = "returning";

  const userPreferences = {
    topInterests,
    goals,
    engagementLevel,
    totalQueries,
    avoidRecommendations: pastRecTitles.slice(-10)  // Last 10 recs to avoid repetition
  };

  console.log(`[MemoryEngine] Personalized context — top interests: [${topInterests.join(', ')}], engagement: ${engagementLevel}`);

  return { enhancedQuery, userPreferences };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════════════
module.exports = {
  getUserMemory,
  updateUserMemory,
  personalizeContext
};
