const { createLLM } = require('../utils/llmFactory.cjs');
const { PromptTemplate } = require("@langchain/core/prompts");

const leadAgent = async (state) => {
  console.log("--- LEAD AGENT EXECUTION ---");
  try {
    const userQuery = state.userQuery || "";
    const userProfile = state.userProfile || {};
    const chatHistory = state.chatHistory || [];

    const promptTemplate = PromptTemplate.fromTemplate(`
You are a highly empathetic and intelligent career mentor chatbot named "SkillRise AI". 
Your goal is to parse the user's query and provide a brief, human-like conversational response.

User Query: {userQuery}
User Profile: {userProfile}
Recent Chat Context: {chatHistory}

Instructions:
1. Analyze the User Query to determine if it is a GENERAL query (e.g. "hi", "who are you", "how are you", "thanks") OR a CAREER query asking for advice, roadmap, skills, courses, or jobs.
2. Provide a 2-4 sentence conversational response.
3. You MUST return ONLY valid JSON with no markdown block wrappers around it. Exactly like this:

{{
  "isGeneralQuery": true/false,
  "response": "Your conversational response here."
}}

If CAREER query (isGeneralQuery = false):
- Acknowledge their experience level and goal.
- Give a short, insightful career perspective.
- Motivate them in a warm, mentoring tone.

If GENERAL query (isGeneralQuery = true):
- Answer their question warmly and naturally.
- Remind them briefly that you can build career roadmaps, analyze skill gaps, and recommend courses.
    `);

    const prompt = await promptTemplate.format({
      userQuery: userQuery,
      userProfile: JSON.stringify(userProfile),
      chatHistory: JSON.stringify(chatHistory.slice(-3))
    });

    const llm = createLLM({ temperature: 0.4, caller: "leadAgent" });
    const response = await llm.invoke(prompt);
    const text = response.content || "";
    
    let parsedData = {
      isGeneralQuery: false,
      response: "Hello! Let's take a look at your career journey and map out the next best steps for you."
    };

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch(e) { console.error("LeadAgent JSON Fix Failed", e); }
    }

    if (parsedData.isGeneralQuery) {
      return {
        isGeneralQuery: true,
        conversationalIntro: parsedData.response,
        conversationalResponse: parsedData.response // Set directly for general queries so it can skip the rest
      };
    }

    return {
      isGeneralQuery: false,
      conversationalIntro: parsedData.response
    };

  } catch (error) {
    console.error("[LeadAgent] Error:", error);
    return {
      isGeneralQuery: false,
      conversationalIntro: "Hello! I am ready to guide you on your career path."
    };
  }
};

module.exports = leadAgent;
