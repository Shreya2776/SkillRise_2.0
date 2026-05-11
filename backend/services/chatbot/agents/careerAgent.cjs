// Career Agent
// Recommends suitable career paths, job roles, and learning resources based on the user's skill profile.
// If job recommendations fail, still passes through what data is available.
// UPGRADED: Uses profile-aware prioritization and an LLM reasoning layer with full user context.

const { createLLM } = require('../utils/llmFactory.cjs');
const getAgentPrompt = require('../prompts/agentPrompt.cjs');

let jobRecommender;
try {
  const jobRec = require('../mcp-tools/jobRecommender.cjs');
  jobRecommender = jobRec.recommendJobs || jobRec;
} catch (error) {
  console.warn("[CareerAgent] jobRecommender tool could not be loaded properly.");
}

let courseFinder;
try {
  const cFinder = require('../mcp-tools/courseFinder.cjs');
  courseFinder = cFinder.findCourses || cFinder;
} catch (error) {
  console.warn("[CareerAgent] courseFinder tool could not be loaded properly.");
}

/**
 * Career Agent Node for LangGraph
 * Recommends job roles based on skills and finds relevant courses.
 * Performs profile-aware prioritization of retrieved jobs and uses LLM for personalization.
 *
 * @param {Object} state - The current state of the LangGraph workflow
 * @returns {Object} State updates formatted dynamically
 */
async function careerAgent(state) {
  console.log("--- CAREER AGENT EXECUTION ---");

  try {
    const userSkills = state.userContext?.skills || state.data?.userSkills || [];

    if (!userSkills || userSkills.length === 0) {
      console.warn("[CareerAgent] Warning: No user skills found in state.");
      return {
        status: "error",
        error: { agent: "careerAgent", message: "User skills missing" }
      };
    }

    console.log(`[CareerAgent] Finding recommendations for skills: ${userSkills.join(', ')}`);

    // Extract centralized retrieved context
    const jobs = state.retrievedData?.jobs || [];
    const retrievedCourses = state.retrievedData?.courses || [];

    // ─── Profile-Aware Prioritization Logic ──────────────────────────────
    const rankedJobs = [...jobs].sort((a, b) => {
      // Robust checking to accommodate raw text contents if actual array is missing
      const scoreA = userSkills.filter(s => {
        const strA = JSON.stringify(a).toLowerCase();
        return (a.requiredSkills && a.requiredSkills.includes(s)) || strA.includes(s.toLowerCase());
      }).length;
      const scoreB = userSkills.filter(s => {
        const strB = JSON.stringify(b).toLowerCase();
        return (b.requiredSkills && b.requiredSkills.includes(s)) || strB.includes(s.toLowerCase());
      }).length;
      return scoreB - scoreA;
    });

    let careerRecommendations = [];
    let jobSource = "none";
    let targetRole = state.userContext?.targetRole || null;
    
    // ─── Step 1: Get Job Recommendations (with ranked external context) ────
    if (typeof jobRecommender === 'function') {
      try {
        const recommendationsResult = await jobRecommender(userSkills, rankedJobs.length > 0 ? rankedJobs : null);
        if (recommendationsResult && recommendationsResult.status === "success" && recommendationsResult.data) {
          careerRecommendations = recommendationsResult.data;
          jobSource = recommendationsResult.source || "jobRecommender";
          console.log(`[CareerAgent] Got ${careerRecommendations.length} job recommendations (source: ${jobSource})`);
        } else {
          console.warn("[CareerAgent] Job recommender returned no data:", recommendationsResult?.message);
        }
      } catch (jobErr) {
        console.error("[CareerAgent] Job recommender threw:", jobErr.message);
      }
    }

    // Determine the top target role from recommendations for course finding
    if (careerRecommendations.length > 0) {
      const topRec = careerRecommendations[0];
      targetRole = topRec.jobTitle || topRec.role || targetRole;
    }

    // ─── Step 2: Find Courses (with external context) ──────────────────────
    let recommendedCourses = [];
    let courseSource = "none";

    if (targetRole && typeof courseFinder === 'function') {
      try {
        const courseResults = await courseFinder(targetRole, retrievedCourses.length > 0 ? retrievedCourses : null);
        if (courseResults && courseResults.status === "success" && courseResults.data) {
          recommendedCourses = courseResults.data;
          courseSource = courseResults.source || "courseFinder";
          console.log(`[CareerAgent] Found ${recommendedCourses.length} courses for role: ${targetRole}`);
        }
      } catch (courseErr) {
        console.error("[CareerAgent] Course finder threw:", courseErr.message);
      }
    }

    const hasData = careerRecommendations.length > 0 || targetRole;

    const toolOutput = {
      careerRecommendations,
      targetRole,
      recommendedCourses
    };

    // ─── Step 3: LLM Reasoning Layer with FULL CONTEXT ────────────────────
    try {
      console.log(`[CareerAgent] Running full personalization reasoning layer...`);

      const agentSpecificTask = `
Your specific objective is to merge the following tool output with the user's FULL context (profile, resume, logic history) to output highly tailored career suggestions.
Return ONLY valid JSON with this exact structure:
{
  "careerRecommendations": [...],
  "targetRole": "...",
  "recommendedCourses": [...],
  "refinedInsights": "A targeted summary of WHY these are the best options given the user's specific context, level, and goals."
}

EXISTING TOOL OUTPUT TO REFINE:
${JSON.stringify(toolOutput, null, 2)}
`;

      const finalPrompt = getAgentPrompt(state, agentSpecificTask);

      const llm = createLLM({ temperature: 0.3, caller: "careerAgent" });
      const response = await llm.invoke(finalPrompt);
      const text = response.content || "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const refined = JSON.parse(jsonMatch[0]);
        console.log("[CareerAgent] Context-aware reasoning successful.");
        return {
          status: "success",
          source: `job: ${jobSource}, course: ${courseSource}, reasoning: LLM(full_context)`,
          reasoning: refined.refinedInsights || "Refined career recommendations using full user context.",
          data: {
            careerRecommendations: refined.careerRecommendations || careerRecommendations,
            targetRole: refined.targetRole || targetRole,
            recommendedCourses: refined.recommendedCourses || recommendedCourses
          }
        };
      }
    } catch (refineErr) {
      console.warn(`[CareerAgent] Reasoning layer failed (${refineErr.message}). Falling back to tool output.`);
    }

    // ─── Fallback string ─────────────────────────────────────────────────
    return {
      status: hasData ? "success" : "no_data",
      source: `job: ${jobSource}, course: ${courseSource}`,
      reasoning: hasData
        ? "Generated career and course recommendations successfully."
        : "No recommendations could be generated from the provided skills.",
      data: toolOutput
    };

  } catch (error) {
    console.error("[CareerAgent] Encountered an error:", error);
    
    return {
      status: "error",
      error: { agent: "careerAgent", message: error.message }
    };
  }
}

module.exports = careerAgent;
