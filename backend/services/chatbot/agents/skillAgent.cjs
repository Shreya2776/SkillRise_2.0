const { createLLM } = require('../utils/llmFactory.cjs');
const { PromptTemplate } = require("@langchain/core/prompts");

const skillAgent = async (state) => {
  console.log("--- SKILL GAP AGENT EXECUTION ---");
  try {
    const userSkills = state.userProfile?.skills || state.userContext?.skills || state.data?.userSkills || [];
    const targetRole = state.userQuery || state.userProfile?.targetRole || "Career Role";
    const retrievedJobs = state.retrievedData?.jobs || [];
    const retrievedSkills = state.retrievedData?.skills || [];
    const externalContext = [...retrievedJobs, ...retrievedSkills];

    const promptTemplate = PromptTemplate.fromTemplate(`
Your objective is to conduct a highly intelligent Skill Gap Analysis for the user trying to enter the target role: "{targetRole}".

User's explicitly known skills: {userSkills}
(Crucial Rule: If the user currently has NO skills listed above, you MUST assume they are an absolute beginner. You must NEVER output "None specified". Instead, identify the foundational basic skills they need to acquire first to even start).

Industry Data Context (Retrieved DB matching): {externalContext}

Analyze the user's gap using your LLM reasoning logic.
Provide a JSON strictly using this format:
{{
  "skillAnalysis": {{
    "coreSkillsToLearn": [
       {{ "skill": "...", "priority": "High" }},
       {{ "skill": "...", "priority": "High" }}
    ],
    "supportingSkillsToLearn": [
       {{ "skill": "...", "priority": "Medium" }},
       {{ "skill": "...", "priority": "Low" }}
    ],
    "targetRole": "{targetRole}"
  }},
  "refinedInsights": "A 1-2 sentence targeted summary of why these gaps matter."
}}

Rank skills strictly based on importance for absolute job readiness. If they have no skills, prioritize foundational concepts (e.g. computer literacy, math, basic communication, etc. if blue-collar/grey-collar).
    `);

    const prompt = await promptTemplate.format({
      targetRole,
      userSkills: userSkills.length ? userSkills.join(", ") : "[] (NO SKILLS EXPLICITLY PROVIDED)",
      externalContext: JSON.stringify(externalContext.slice(0, 3)) // keep it light for context limits
    });

    const llm = createLLM({ temperature: 0.3, caller: "skillAgent" });
    const response = await llm.invoke(prompt);
    
    // Parse JSON
    let parsedData = {};
    const text = response.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch(e) { console.error("JSON Parse Error in SkillAgent"); }
    }

    return {
      data: {
        skillAnalysis: parsedData.skillAnalysis || {}
      },
      reasoning: parsedData.refinedInsights || "Analyzed core vs supporting skills based on requirement gaps."
    };

  } catch (error) {
    console.error("[SkillAgent] Error:", error);
    return {
      data: {
        skillAnalysis: { coreSkillsToLearn: [], supportingSkillsToLearn: [] }
      }
    };
  }
};

module.exports = skillAgent;
