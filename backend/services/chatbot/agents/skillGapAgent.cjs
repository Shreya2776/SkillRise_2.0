// ═══════════════════════════════════════════════════════════════════════════════
// Skill Gap Agent — LLM-Powered Career Insight Generator
// ═══════════════════════════════════════════════════════════════════════════════
// Uses the skillGapEngine tool to identify raw gaps, then sends a structured
// prompt to an LLM for intelligent refinement (transferable skills, priority
// ranking, learning plan generation).
//
// Architecture:
//   1. Tool Layer  → computeSkillGap()
//   2. Agent Layer → LLM reasoning + JSON extraction
//   3. Merge       → Combined tool + LLM output

const { createLLM } = require('../utils/llmFactory.cjs');
const { computeSkillGap } = require('../mcp-tools/skillGapEngine.cjs');

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_RETRIES = 2;
const LLM_TEMPERATURE = 0.2;

/**
 * Extract valid JSON from an LLM text response.
 * Handles markdown code fences and partial text.
 *
 * @param {string} text - Raw LLM output
 * @returns {Object|null} Parsed JSON or null
 */
function extractJSON(text) {
  if (!text) return null;

  // Strip markdown code fences if present
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch { /* fall through */ }

  // Try extracting the outermost { ... }
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch { /* fall through */ }
  }

  return null;
}

/**
 * Build the structured prompt for the LLM reasoning step.
 *
 * @param {Object} userProfile - { skills, experience, projects }
 * @param {Object} job         - { role, requiredSkills }
 * @param {Object} initialGap  - Output from computeSkillGap()
 * @returns {string} The full prompt string
 */
function buildPrompt(userProfile, job, initialGap) {
  return `You are an intelligent career advisor AI.

You analyze user skills and job requirements to identify meaningful skill gaps.

---

USER INPUT:

User Profile:
- Skills: ${JSON.stringify(userProfile.skills || [])}
- Experience: ${userProfile.experience || "Not specified"}
- Projects: ${JSON.stringify(userProfile.projects || [])}

Target Job:
- Role: ${job.role || "Unknown Role"}
- Required Skills: ${JSON.stringify(job.requiredSkills || [])}

Initial Skill Gap (computed by tool):
- Missing Skills: ${JSON.stringify(initialGap.missingSkills)}
- Matched Skills: ${JSON.stringify(initialGap.matchedSkills)}
- Gap Percentage: ${initialGap.gapPercentage}%

---

TASKS:

1. Refine the missing skills:
   - Remove false gaps (if user has related / transferable skills)
   - Detect partial matches (e.g. "React" covers "React.js")
   - Consider transferable skills from projects and experience

2. Identify:
   - trueMissingSkills (genuinely missing)
   - strengths (user's strongest relevant assets)

3. Rank missing skills by priority:
   - High: required immediately, blockers for the role
   - Medium: important but can be learned on the job
   - Low: nice-to-have, not critical

4. Explain WHY each missing skill is needed for this specific role

5. Suggest concrete next learning steps (courses, projects, certifications)

---

OUTPUT FORMAT (STRICT JSON — no markdown, no explanation, ONLY this JSON object):

{
  "trueMissingSkills": [
    {
      "skill": "skill name",
      "priority": "High | Medium | Low",
      "reason": "why this skill is needed for the role"
    }
  ],
  "strengths": ["strength 1", "strength 2"],
  "improvementAreas": ["area 1", "area 2"],
  "learningPlan": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "gapScore": <number 0-100, refined estimate of how ready the user is (100 = fully ready, 0 = not ready)>
}`;
}

/**
 * Call the LLM with retry logic.
 *
 * @param {string} prompt    - The full prompt
 * @param {number} [retries] - Number of retries remaining
 * @returns {Promise<Object|null>} Parsed LLM JSON or null
 */
async function callLLMWithRetry(prompt, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      // Round-robin Gemini + automatic Grok fallback via llmFactory
      const llm = createLLM({ temperature: LLM_TEMPERATURE, caller: "skillGapAgent" });

      console.log(`[SkillGapAgent] LLM call attempt ${attempt}/${retries + 1}...`);
      const response = await llm.invoke(prompt);
      const parsed = extractJSON(response.content);

      if (parsed && parsed.trueMissingSkills) {
        return parsed;
      }

      console.warn(`[SkillGapAgent] Attempt ${attempt}: LLM returned invalid JSON, retrying...`);
    } catch (err) {
      console.warn(`[SkillGapAgent] Attempt ${attempt} failed: ${err.message}`);
    }
  }

  return null;
}

/**
 * Skill Gap Agent
 *
 * Combines the deterministic skillGapEngine tool with LLM reasoning
 * to produce intelligent, personalized career gap analysis.
 *
 * @param {Object} input
 * @param {Object} input.userProfile - { skills: string[], experience: string, projects: string[] }
 * @param {Object} input.job         - { role: string, requiredSkills: string[] }
 * @returns {Promise<Object>} Combined tool + LLM analysis
 */
async function skillGapAgent({ userProfile, job }) {
  console.log("--- SKILL GAP AGENT EXECUTION ---");

  // ─── Validate inputs ──────────────────────────────────────────────────────
  if (!userProfile || !job) {
    console.error("[SkillGapAgent] Missing userProfile or job input.");
    return {
      status: "error",
      error: { agent: "skillGapAgent", message: "Missing userProfile or job input" }
    };
  }

  const userSkills = userProfile.skills || [];
  const requiredSkills = job.requiredSkills || [];

  if (requiredSkills.length === 0) {
    console.warn("[SkillGapAgent] No required skills specified for job.");
    return {
      status: "error",
      error: { agent: "skillGapAgent", message: "Job has no required skills" }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: Tool Layer — Deterministic skill gap computation
  // ═══════════════════════════════════════════════════════════════════════════
  console.log(`[SkillGapAgent] Computing skill gap: ${userSkills.length} user skills vs ${requiredSkills.length} required...`);

  const initialGap = computeSkillGap(userSkills, requiredSkills);

  console.log(`[SkillGapAgent] Tool result — Missing: ${initialGap.missingSkills.length}, Matched: ${initialGap.matchedSkills.length}, Gap: ${initialGap.gapPercentage}%`);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: Agent Layer — LLM reasoning for refinement
  // ═══════════════════════════════════════════════════════════════════════════
  const prompt = buildPrompt(userProfile, job, initialGap);
  const llmOutput = await callLLMWithRetry(prompt);

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: Merge tool + LLM output into final response
  // ═══════════════════════════════════════════════════════════════════════════
  if (llmOutput) {
    console.log(`[SkillGapAgent] LLM refinement successful. Gap score: ${llmOutput.gapScore}`);

    return {
      status: "success",
      source: "skillGapEngine + LLM",
      role: job.role,
      gapAnalysis: {
        // Tool output (raw deterministic)
        raw: {
          missingSkills: initialGap.missingSkills,
          matchedSkills: initialGap.matchedSkills,
          gapPercentage: initialGap.gapPercentage
        },
        // LLM output (refined intelligent)
        refined: {
          trueMissingSkills: llmOutput.trueMissingSkills || [],
          strengths: llmOutput.strengths || [],
          improvementAreas: llmOutput.improvementAreas || [],
          gapScore: llmOutput.gapScore ?? initialGap.gapPercentage
        }
      },
      recommendations: {
        learningPlan: llmOutput.learningPlan || [],
        prioritySkills: (llmOutput.trueMissingSkills || [])
          .filter(s => s.priority === "High")
          .map(s => s.skill)
      }
    };
  }

  // ─── Fallback: Return tool-only output if LLM failed ──────────────────────
  console.warn("[SkillGapAgent] LLM refinement failed. Returning tool-only output.");

  return {
    status: "partial",
    source: "skillGapEngine (tool only — LLM unavailable)",
    role: job.role,
    gapAnalysis: {
      raw: {
        missingSkills: initialGap.missingSkills,
        matchedSkills: initialGap.matchedSkills,
        gapPercentage: initialGap.gapPercentage
      },
      refined: null
    },
    recommendations: {
      learningPlan: initialGap.missingSkills.map((s, i) => `Step ${i + 1}: Learn ${s}`),
      prioritySkills: initialGap.missingSkills.slice(0, 3)
    }
  };
}

module.exports = skillGapAgent;
