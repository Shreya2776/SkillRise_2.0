// Roadmap Agent
// Generates personalized learning roadmaps based on the user's target role and missing skills
// UPGRADED: Uses centralized retrievedData to enrich roadmap, then refines with full LLM context.

const fs = require('fs');
const path = require('path');
const { createLLM } = require('../utils/llmFactory.cjs');
const getAgentPrompt = require('../prompts/agentPrompt.cjs');

/**
 * Roadmap Agent Node for LangGraph
 * Generates a personalized learning roadmap.
 * Uses retrievedData.courses to enrich roadmap phases with suggested courses.
 * Refines the final roadmap via LLM applying full userContext and user level matching.
 * 
 * @param {Object} state - The current state of the LangGraph workflow
 * @returns {Object} State updates formatted dynamically
 */
async function roadMapAgent(state) {
  console.log("--- ROADMAP AGENT EXECUTION ---");

  try {
    const targetRole = state.userContext?.targetRole || state.data?.targetRole || state.targetRole;
    
    const skillAnalysis = state.data?.skillAnalysis || {};
    const coreSkills = Array.isArray(skillAnalysis.coreSkillsToLearn) ? skillAnalysis.coreSkillsToLearn.map(s => s.skill || s) : [];
    const supportingSkills = Array.isArray(skillAnalysis.supportingSkillsToLearn) ? skillAnalysis.supportingSkillsToLearn.map(s => s.skill || s) : [];
    const missingSkills = [...coreSkills, ...supportingSkills];

    if (!targetRole) {
      console.warn("[RoadMapAgent] Warning: No targetRole specified in state.");
      return {
        status: "error",
        error: {
          agent: "roadmapAgent",
          message: "No targetRole specified"
        }
      };
    }

    if (!missingSkills || missingSkills.length === 0) {
      console.log("[RoadMapAgent] No missing skills found. Roadmap is empty.");
      return {
        status: "success",
        source: "skillRoadmap",
        reasoning: "No missing skills; roadmap is not necessary.",
        data: { roadmap: [] }
      };
    }

    const datasetPath = path.join(__dirname, '../data/skillRoadmap.json');
    let skillRoadmapData = {};
    
    if (fs.existsSync(datasetPath)) {
      const fileData = fs.readFileSync(datasetPath, 'utf-8');
      skillRoadmapData = JSON.parse(fileData);
    } else {
      console.warn("[RoadMapAgent] Warning: skillRoadmap.json dataset not found at", datasetPath);
      return {
        status: "error",
        error: {
          agent: "roadmapAgent",
          message: "skillRoadmap dataset missing"
        }
      };
    }

    const generalRoadmap = skillRoadmapData[targetRole];
    
    if (!generalRoadmap) {
      console.warn(`[RoadMapAgent] Warning: No predefined roadmap found for role "${targetRole}".`);
      return {
        status: "no_data",
        source: "dataset",
        reasoning: `No predefined roadmap found for role ${targetRole}.`,
        data: { roadmap: [] }
      };
    }

    const personalizedRoadmap = [];
    const missingSkillsLower = missingSkills.map(skill => skill.toLowerCase());

    // Extract centralized retrieved context
    const retrievedCourses = state.retrievedData?.courses || [];
    const retrievedCareerGuides = state.retrievedData?.career_guides || [];

    for (const [phaseName, phaseSkills] of Object.entries(generalRoadmap)) {
      const neededSkills = phaseSkills.filter(skill => {
        // Assume skills in database might be objects with string keys, or strings directly
        if (typeof skill === 'object' && skill.topic) {
          return missingSkillsLower.includes(skill.topic.toLowerCase());
        } else if (typeof skill === 'string') {
          return missingSkillsLower.includes(skill.toLowerCase());
        }
        return false;
      });

      if (neededSkills.length > 0) {
        // Enrich phase with retrieved courses that match phase skills
        const phaseSkillNames = neededSkills.map(s => typeof s === 'string' ? s.toLowerCase() : (s.topic || '').toLowerCase());
        const suggestedCourses = retrievedCourses
          .filter(course => {
            const courseText = (course.content || course.name || '').toLowerCase();
            return phaseSkillNames.some(skill => courseText.includes(skill));
          })
          .slice(0, 3);

        personalizedRoadmap.push({
          phase: phaseName,
          skills: neededSkills,
          ...(suggestedCourses.length > 0 ? { suggestedCourses } : {})
        });
      }
    }

    let source = "dataset";

    // If we enriched with retrieved courses, update source
    if (retrievedCourses.length > 0 || retrievedCareerGuides.length > 0) {
      source = "dataset + retriever_node";
      console.log(`[RoadMapAgent] Enriched roadmap with ${retrievedCourses.length} retrieved courses + ${retrievedCareerGuides.length} career guides.`);
    }

    console.log(`[RoadMapAgent] Successfully generated personalized roadmap with ${personalizedRoadmap.length} phases.`);
    
    const toolOutput = {
      roadmap: personalizedRoadmap
    };

    // ─── Step 2: LLM Reasoning Layer with FULL CONTEXT ────────────────────
    try {
      console.log(`[RoadMapAgent] Running full personalization reasoning layer...`);

      const agentSpecificTask = `
Your specific objective is to merge the following tool generated roadmap with the user's FULL context.
Adjust the roadmap based on the user's assessed EXPERIENCE LEVEL (determined by profile/resume) and prioritize missing skills.
Return ONLY valid JSON with this exact structure:
{
  "roadmap": [
    {
      "phase": "...",
      "skills": [...],
      "suggestedCourses": [...]
    }
  ],
  "refinedInsights": "A targeted summary of WHY this roadmap order makes sense for the user."
}

EXISTING ROADMAP TO REFINE:
${JSON.stringify(toolOutput, null, 2)}
`;

      const finalPrompt = getAgentPrompt(state, agentSpecificTask);

      const llm = createLLM({ temperature: 0.3, caller: "roadmapAgent" });
      const response = await llm.invoke(finalPrompt);
      const text = response.content || "";

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const refined = JSON.parse(jsonMatch[0]);
        console.log("[RoadMapAgent] Context-aware reasoning successful.");
        return {
          status: "success",
          source: `${source}, reasoning: LLM(full_context)`,
          reasoning: refined.refinedInsights || "Refined learning roadmap using full user context.",
          data: {
            roadmap: refined.roadmap || personalizedRoadmap
          }
        };
      }
    } catch (refineErr) {
      console.warn(`[RoadMapAgent] Reasoning layer failed (${refineErr.message}). Falling back to tool output.`);
    }

    return {
      status: "success",
      source,
      reasoning: `Extracted ${personalizedRoadmap.length} roadmap phases matching the user's missing skills.`,
      data: toolOutput
    };

  } catch (error) {
    console.error("[RoadMapAgent] Encountered an error:", error);
    
    return {
      status: "error",
      error: {
        agent: "roadmapAgent",
        message: error.message
      }
    };
  }
}

module.exports = roadMapAgent;
