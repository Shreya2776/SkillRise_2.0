/**
 * Response Aggregator Node for LangGraph
 * ──────────────────────────────────────
 * UPGRADED from a passive merger to an INTELLIGENT AGGREGATOR that:
 *   1. Ranks career recommendations by user skill match
 *   2. Resolves targetRole conflicts with a priority chain
 *   3. Enriches skill analysis with matchPercentage
 *   4. Merges & deduplicates retrieved Pinecone data
 *   5. Builds a structured final response with debug logging
 *
 * All original data fields and cleanup logic are preserved.
 */

// ─── Helper: Deduplicate an array of objects by a given key ──────────────────
function dedupeByKey(arr, key) {
  const map = new Map();
  (arr || []).forEach(item => {
    if (item && item[key]) {
      map.set(item[key], item);
    }
  });
  return Array.from(map.values());
}

async function responseAggregator(state) {
  console.log("--- RESPONSE AGGREGATOR EXECUTION ---");

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ACCESS FULL CONTEXT
  // ═══════════════════════════════════════════════════════════════════════════
  const data = state.data || {};
  const userContext = state.userContext || {};
  const retrievedData = state.retrievedData || {};

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. JOB RANKING — score each career recommendation by user skill overlap
  // ═══════════════════════════════════════════════════════════════════════════
  const userSkills = userContext.skills || [];
  const rawCareers = data.careerRecommendations || state.careerRecommendations || [];

  const rankedCareers = rawCareers.map(job => {
    const required = job.requiredSkills || [];
    // Score: how many of the user's skills appear in the job's required list
    const matchCount = userSkills.filter(skill =>
      required.some(r => r.toLowerCase().includes(skill.toLowerCase()))
    ).length;

    return {
      ...job,
      matchScore: matchCount
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. RESOLVE TARGET ROLE CONFLICT — priority: skillAgent > careerAgent > router
  // ═══════════════════════════════════════════════════════════════════════════
  const targetRole =
    data.skillAnalysis?.targetRole ||   // skillAgent (most accurate — derived from gap analysis)
    data.targetRole ||                  // careerAgent
    state.targetRole ||                 // routerAgent / fallback
    null;

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ENRICH SKILL ANALYSIS — compute matchPercentage
  // ═══════════════════════════════════════════════════════════════════════════
  const skillAnalysis = {
    ...(data.skillAnalysis || data.skillMatchResult || state.skillAnalysis || state.skillMatchResult || {})
  };

  skillAnalysis.matchPercentage = (() => {
    const matched = skillAnalysis.matchedSkills?.length || skillAnalysis.userSkills?.length || 0;
    const gaps = skillAnalysis.skillGaps?.length || skillAnalysis.missingSkills?.length || 0;
    const total = matched + gaps;
    return total === 0 ? 0 : Math.round((matched / total) * 100);
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. MERGE RETRIEVED DATA — normalize Pinecone namespaces into one shape
  // ═══════════════════════════════════════════════════════════════════════════
  const enrichedRetrieved = {
    jobs: retrievedData.jobs || [],
    courses: retrievedData.courses || [],
    schemes: retrievedData.gov_schemes || [],
    skills: retrievedData.skills || [],
    careerGuides: retrievedData.career_guides || []
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. DEDUPLICATE courses and schemes by link (or name as fallback key)
  // ═══════════════════════════════════════════════════════════════════════════
  const agentCourses = data.recommendedCourses || [];
  const retrievedCourses = enrichedRetrieved.courses;
  const mergedCourses = dedupeByKey([...agentCourses, ...retrievedCourses], "link");
  // Fallback dedup by name if link key is sparse
  const finalCourses = mergedCourses.length > 0
    ? mergedCourses
    : dedupeByKey([...agentCourses, ...retrievedCourses], "name");

  const agentSchemes = data.schemeRecommendations || [];
  const retrievedSchemes = enrichedRetrieved.schemes;
  const mergedSchemes = dedupeByKey([...agentSchemes, ...retrievedSchemes], "link");
  const finalSchemes = mergedSchemes.length > 0
    ? mergedSchemes
    : dedupeByKey([...agentSchemes, ...retrievedSchemes], "name");

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. BUILD FINAL ENRICHED RESPONSE
  // ═══════════════════════════════════════════════════════════════════════════
  const response = {
    // Resume information
    resumeInfo: data.resumeAnalysis || null,

    // Resolved target role (conflict-free)
    targetRole,

    // Ranked career recommendations (top 3)
    careerRecommendations: rankedCareers.length > 0 ? rankedCareers.slice(0, 3) : null,

    // Enriched skill analysis with matchPercentage
    skillAnalysis: Object.keys(skillAnalysis).length > 1 ? skillAnalysis : null,

    // Deduplicated courses
    courses: finalCourses.length > 0 ? finalCourses : null,

    // Deduplicated government schemes
    governmentSchemes: finalSchemes.length > 0 ? finalSchemes : null,

    // Custom roadmap from roadmapAgent
    roadmap: data.roadmap || state.roadmap || null,

    // Normalized retrieved context for responseGenerator
    retrievedContext: enrichedRetrieved
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. FILTER EMPTY FIELDS — keep existing cleanup logic
  // ═══════════════════════════════════════════════════════════════════════════
  const cleanedResponse = Object.fromEntries(
    Object.entries(response).filter(([_, v]) => {
      if (v == null) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false;
      return true;
    })
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. DEBUG LOGGING
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`[Aggregator] Response keys: ${Object.keys(cleanedResponse).join(', ') || '(empty)'}`);
  console.log(`[Aggregator] Top Career: ${cleanedResponse.careerRecommendations?.[0]?.jobTitle || cleanedResponse.careerRecommendations?.[0]?.role || '(none)'}`);
  console.log(`[Aggregator] Match %: ${cleanedResponse.skillAnalysis?.matchPercentage ?? 'N/A'}`);
  console.log(`[Aggregator] Target Role (resolved): ${cleanedResponse.targetRole || '(none)'}`);
  console.log(`[Aggregator] Courses: ${finalCourses.length}, Schemes: ${finalSchemes.length}`);

  return {
    finalResponse: cleanedResponse
  };
}

module.exports = responseAggregator;
