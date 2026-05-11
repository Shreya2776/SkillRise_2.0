// Resume Agent
// Extracts structured information from a user's resume so that downstream agents can use it for:
// - skill matching
// - job recommendations
// - roadmap generation
// - government scheme discovery
// UPGRADED: After extraction, optionally refines output using Pinecone retrievedData via LLM reasoning.

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

let resumeAnalyzer;
try {
  resumeAnalyzer = require('../mcp-tools/resumeAnalyzer.cjs');
} catch (err) {
  const { parseResume } = require('../mcp-tools/resumeParser.cjs');
  resumeAnalyzer = parseResume;
}

const fs = require('fs');
const vectorMemory = require('../memory/vectorMemory.cjs');

/**
 * Resume Agent Node for LangGraph
 * Acts as the first step in the pipeline.
 *
 * @param {Object} state - The current state of the LangGraph workflow
 * @returns {Object} State updates with strict JSON format
 */
async function resumeAgent(state) {
  console.log("--- RESUME AGENT EXECUTION ---");

  try {
    const resumeFilePath = state.resumeFilePath;

    if (!resumeFilePath) {
      console.error("[ResumeAgent] Error: No resumeFilePath provided.");
      return {
        status: "error",
        error: {
          agent: "resumeAgent",
          message: "No resume file path provided"
        }
      };
    }

    if (!fs.existsSync(resumeFilePath)) {
      console.error(`[ResumeAgent] Error: File not found at ${resumeFilePath}`);
      return {
        status: "error",
        error: {
          agent: "resumeAgent",
          message: "Resume file does not exist on disk"
        }
      };
    }

    console.log(`[ResumeAgent] Analyzing resume found at: ${resumeFilePath}`);

    const resumeData = await resumeAnalyzer(resumeFilePath);

    if (!resumeData || typeof resumeData !== 'object' || Object.keys(resumeData).length === 0) {
      console.warn("[ResumeAgent] Warning: Analyzer returned empty results.");
      return {
        status: "error",
        error: {
          agent: "resumeAgent",
          message: "Analyzer failed to extract data"
        }
      };
    }

    const extractedSkills = resumeData.skills || [];
    const extractedEducation = resumeData.education || [];
    const extractedExperience = resumeData.experience || [];

    const resumeAnalysisInfo = {
       name: resumeData.personalInfo?.name || resumeData.name || "Unknown Candidate",
       summary: resumeData.summary || "",
       contact: resumeData.personalInfo || {}
    };

    console.log(`[ResumeAgent] Extraction complete. Found ${extractedSkills.length} skills.`);

    // Vectorize the extracted resume content into Pinecone for semantic search memory
    const resumeTextSummary = `User uploaded Resume Data.
Name: ${resumeAnalysisInfo.name}
Summary: ${resumeAnalysisInfo.summary}
Skills: ${extractedSkills.join(', ')}
Education: ${extractedEducation.map(ed => `${ed.degree} from ${ed.institution}`).join('; ')}
Experience: ${extractedExperience.map(ex => `${ex.jobTitle} at ${ex.company}: ${ex.description}`).join(' | ')}`;

    const resumeNodeId = "resume_node_" + Date.now();
    
    // Store in hybrid memory mapped to this thread
    if (state.threadId) {
      console.log(`[ResumeAgent] Generating vector embeddings for resume and storing to semantic memory...`);
      await vectorMemory.storeEmbedding(state.threadId, resumeNodeId, resumeTextSummary, "system_resume");
    }

    const toolOutput = {
      userSkills: extractedSkills,
      education: extractedEducation,
      experience: extractedExperience,
      resumeAnalysis: resumeAnalysisInfo
    };

    // ─── Step 2: RAG Refinement Layer (optional — compare with retrieved job data) ───
    const retrievedJobs = state.retrievedData?.jobs || [];
    const retrievedSkills = state.retrievedData?.skills || [];

    if (retrievedJobs.length > 0 || retrievedSkills.length > 0) {
      try {
        console.log(`[ResumeAgent] Refining with ${retrievedJobs.length} retrieved jobs + ${retrievedSkills.length} retrieved skills...`);

        const refinementPrompt = `
You are an AI resume analysis assistant.

Extracted Resume Data:
- Name: ${resumeAnalysisInfo.name}
- Skills: ${extractedSkills.join(", ")}
- Education: ${extractedEducation.map(ed => `${ed.degree} from ${ed.institution}`).join("; ")}
- Experience: ${extractedExperience.map(ex => `${ex.jobTitle} at ${ex.company}`).join("; ")}

Retrieved Job Data (from real database — shows what employers want):
${JSON.stringify(retrievedJobs.slice(0, 5), null, 2)}

Retrieved Skill Data (from real database):
${JSON.stringify(retrievedSkills.slice(0, 5), null, 2)}

TASK:
- Compare the resume's skills against what the retrieved jobs require.
- Identify skills the resume is MISSING that would make it stronger.
- Return ONLY a valid JSON object with this exact structure:
{
  "resumeStrengths": [...],
  "suggestedImprovements": [...],
  "missingSkillsForTarget": [...],
  "refinedInsights": "Brief summary"
}
`;

        const geminiLlm = new ChatGoogleGenerativeAI({
          model: "gemini-2.5-flash",
          apiKey: process.env.GOOGLE_API_KEY,
          temperature: 0.2,
          maxRetries: 1
        });

        const response = await geminiLlm.invoke(refinementPrompt);
        const text = response.content || "";

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const refined = JSON.parse(jsonMatch[0]);
          console.log("[ResumeAgent] RAG refinement successful.");
          
          const buildUserContext = require('../utils/contextBuilder.cjs');
          const tempState = { ...state, data: { ...state.data, ...toolOutput } };
          const userContext = buildUserContext(tempState);

          return {
            status: "success",
            source: "resumeAnalyzer tool, rag: pinecone+gemini",
            reasoning: refined.refinedInsights || `Extracted ${extractedSkills.length} skills and compared with job market.`,
            data: {
              ...toolOutput,
              resumeStrengths: refined.resumeStrengths || [],
              suggestedImprovements: refined.suggestedImprovements || [],
              missingSkillsForTarget: refined.missingSkillsForTarget || []
            },
            userContext
          };
        }
      } catch (refineErr) {
        console.warn(`[ResumeAgent] RAG refinement failed (${refineErr.message}). Using extraction output.`);
      }
    }

    // ─── Build User Context ──────────────────────────────────────────────
    const buildUserContext = require('../utils/contextBuilder.cjs');
    const tempState = { ...state, data: { ...state.data, ...toolOutput } };
    const userContext = buildUserContext(tempState);

    // ─── Fallback: Return extraction output without refinement ────────────
    return {
      status: "success",
      source: "resumeAnalyzer tool",
      reasoning: `Extracted ${extractedSkills.length} skills from the user's uploaded resume.`,
      data: toolOutput,
      userContext
    };

  } catch (error) {
    console.error("[ResumeAgent] Encountered an error:", error);
    
    return {
      status: "error",
      error: {
        agent: "resumeAgent",
        message: error.message
      }
    };
  }
}

module.exports = resumeAgent;
