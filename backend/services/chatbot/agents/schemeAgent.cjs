// Scheme Agent
// Finds and recommends relevant government schemes such as Skill India, PMKVY, NASSCOM FutureSkills
// Validates user skills and missing skills, combines them, calls the MCP tool, and returns the updated state.
// UPGRADED: Refines recommendations with full profile and retrieved data through LLM reasoning.

const { findGovtSchemes } = require('../mcp-tools/govtSchemeFinder.cjs');
const { createLLM } = require('../utils/llmFactory.cjs');
const getAgentPrompt = require('../prompts/agentPrompt.cjs');

/**
 * Scheme Agent Node for LangGraph
 * Analyzes the user's skills and missing skills to recommend relevant government training schemes.
 * Passes centralized retrievedData into govtSchemeFinder to avoid redundant lookups.
 * Refines the final output via LLM using full userContext.
 * 
 * @param {Object} state - The current state of the LangGraph workflow
 * @returns {Object} State updates formatted dynamically
 */
async function schemeAgent(state) {
  console.log("--- SCHEME AGENT EXECUTION ---");

  try {
    const userSkills = state.userContext?.skills || state.data?.userSkills || state.userSkills || [];
    
    const skillAnalysis = state.data?.skillAnalysis || state.skillAnalysis || state.skillMatchResult || {};
    const missingSkills = Array.isArray(skillAnalysis.missingSkills) 
      ? skillAnalysis.missingSkills 
      : Array.isArray(skillAnalysis.skillGaps)
        ? skillAnalysis.skillGaps 
        : [];

    const searchSkills = [...userSkills, ...missingSkills];

    if (searchSkills.length === 0) {
      console.warn("[SchemeAgent] Warning: No skills found in state.");
      return {
        status: "error",
        error: {
          agent: "schemeAgent",
          message: "No skills to search for schemes"
        }
      };
    }

    console.log(`[SchemeAgent] Searching for government schemes based on: ${searchSkills.join(', ')}`);

    // Extract centralized retrieved context
    const retrievedSchemes = state.retrievedData?.gov_schemes || [];

    let schemes = [];
    let source = "none";
    let message = "No schemes found";

    if (typeof findGovtSchemes === 'function') {
      // Pass retrieved schemes as externalContext — tool will return them directly
      const schemeData = await findGovtSchemes(searchSkills, retrievedSchemes.length > 0 ? retrievedSchemes : null);
      if (schemeData && schemeData.status === "success") {
        schemes = schemeData.data;
        source = schemeData.source || "schemeFinder";
        message = schemeData.reasoning || "Successfully retrieved schemes.";
      } else if (schemeData && schemeData.status === "no_data") {
         message = schemeData.message;
      }
    } else {
      const govtSchemeFinder = require('../mcp-tools/govtSchemeFinder.cjs');
      if (typeof govtSchemeFinder === 'function') {
        const schemeData = await govtSchemeFinder(searchSkills, retrievedSchemes.length > 0 ? retrievedSchemes : null);
        if (schemeData && schemeData.status === "success") {
          schemes = schemeData.data;
          source = schemeData.source || "schemeFinder";
          message = schemeData.reasoning || "Successfully retrieved schemes.";
        }
      }
    }

    console.log(`[SchemeAgent] Found ${schemes?.length || 0} relevant schemes.`);

    const toolOutput = {
      schemeRecommendations: schemes || []
    };

    // ─── Step 2: LLM Reasoning Layer with FULL CONTEXT ────────────────────
    try {
      console.log(`[SchemeAgent] Running full personalization reasoning layer...`);

      const agentSpecificTask = `
Your specific objective is to merge the following tool generated schemes with the user's FULL context.
Adjust the prioritized government schemes based on the user's true level and goal (determined by profile/resume).
Return ONLY valid JSON with this exact structure:
{
  "schemeRecommendations": [...],
  "refinedInsights": "A targeted summary of WHY these schemes fit their profile and financial/career goals."
}

EXISTING SCHEMES TO REFINE:
${JSON.stringify(toolOutput, null, 2)}
`;

      const finalPrompt = getAgentPrompt(state, agentSpecificTask);

      const llm = createLLM({ temperature: 0.3, caller: "schemeAgent" });
      const response = await llm.invoke(finalPrompt);
      const text = response.content || "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const refined = JSON.parse(jsonMatch[0]);
        console.log("[SchemeAgent] Context-aware reasoning successful.");
        return {
          status: "success",
          source: `${source}, reasoning: LLM(full_context)`,
          reasoning: refined.refinedInsights || "Refined scheme recommendations using full user context.",
          data: {
            schemeRecommendations: refined.schemeRecommendations || schemes || []
          }
        };
      }
    } catch (refineErr) {
      console.warn(`[SchemeAgent] Reasoning layer failed (${refineErr.message}). Falling back to tool output.`);
    }

    return {
      status: "success",
      source: source,
      reasoning: message,
      data: toolOutput
    };

  } catch (error) {
    console.error("[SchemeAgent] Encountered an error:", error);
    
    return {
      status: "error",
      error: {
        agent: "schemeAgent",
        message: error.message
      }
    };
  }
}

module.exports = schemeAgent;
