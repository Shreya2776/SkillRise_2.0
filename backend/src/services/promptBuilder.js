const normalizeText = (value, maxChars = 2000) => {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxChars);
};

const compactProfile = (profile = {}) => {
  if (!profile || typeof profile !== "object") return {};

  return {
    name: profile.name || "",
    targetRole: profile.targetRole || profile.role || "",
    currentRole: profile.currentRole || "",
    summary: normalizeText(profile.summary || profile.bio || "", 300),
    skills: Array.isArray(profile.skills) ? profile.skills.slice(0, 20) : [],
    experience: normalizeText(profile.experience || "", 250),
    resume: normalizeText(profile.resume || "", 1000),
  };
};

const compactSteps = (steps = []) => {
  const safeSteps = Array.isArray(steps) ? steps.slice(0, 10) : [];
  return safeSteps.map((step) => (typeof step === "string" ? step : JSON.stringify(step)).slice(0, 120));
};

export const buildRoadmapPrompt = ({
  profile,
  resumeText,
  targetRole,
  duration,
  completedSteps = [],
  careerSwitch = false,
}) => {
  const compactedProfile = compactProfile(profile);
  const compactedResume = normalizeText(resumeText, 2500);
  const compactedCompletedSteps = compactSteps(completedSteps);

  return `
You are an expert AI career mentor.

USER DATA:
Profile: ${JSON.stringify(compactedProfile)}
Resume: ${compactedResume}

Target Role: ${normalizeText(targetRole, 120)}
Time Available: ${normalizeText(duration, 80)}

Completed Steps: ${JSON.stringify(compactedCompletedSteps)}

Career Switch Mode: ${careerSwitch}

INSTRUCTIONS:

1. Analyze:
- Strong skills
- Weak skills
- Missing industry skills

2. Detect:
- Weak projects
- Irrelevant resume parts

3. Generate a timeline roadmap:
- Month-wise
- Adaptive (skip completed steps)
- If career switch = true → add transition phase

4. Each step MUST include:
- title
- skills
- tools
- tasks (real-world tasks)
- outcome
- resources:
   - free (YouTube structured)
   - paid (Coursera/Udemy)
   - practice (LeetCode/Kaggle)

5. Suggest resume improvements:
- Add projects
- Fix sections

RETURN STRICT JSON:

{
  "analysis": {
    "strong": [],
    "weak": [],
    "missing": []
  },
  "roadmap": [],
  "resume_improvements": []
}
`;
};

export const buildUpdatePrompt = ({
  profile,
  resumeText,
  targetRole,
  duration,
  completedSteps = [],
}) => {
  const compactedProfile = compactProfile(profile);
  const compactedResume = normalizeText(resumeText, 2500);
  const compactedCompletedSteps = compactSteps(completedSteps);

  return `
You are an expert AI career mentor updating an existing roadmap.

USER DATA:
Profile: ${JSON.stringify(compactedProfile)}
Resume: ${compactedResume}

Target Role: ${normalizeText(targetRole, 120)}
Time Available: ${normalizeText(duration, 80)}

COMPLETED STEPS: ${JSON.stringify(compactedCompletedSteps)}

INSTRUCTIONS:

1. Analyze the user's CURRENT progress based on completed steps
2. Re-evaluate skills gained from completed steps
3. Generate UPDATED roadmap that:
   - SKIPS all completed steps
   - Focuses on REMAINING skills needed
   - Adjusts timeline based on progress
   - Adds advanced topics if basics are done

4. Each step MUST include:
- title
- skills
- tools
- tasks
- outcome
- resources (free, paid, practice)

5. Provide updated resume improvements based on NEW skills

RETURN STRICT JSON:

{
  "analysis": {
    "strong": [],
    "weak": [],
    "missing": []
  },
  "roadmap": [],
  "resume_improvements": []
}
`;
};

export const buildCareerSwitchPrompt = ({
  profile,
  resumeText,
  currentRole,
  targetRole,
  duration,
}) => {
  const compactedProfile = compactProfile(profile);
  const compactedResume = normalizeText(resumeText, 2500);

  return `
You are an expert AI career transition mentor.

USER DATA:
Profile: ${JSON.stringify(compactedProfile)}
Resume: ${compactedResume}

CURRENT ROLE: ${normalizeText(currentRole, 120)}
TARGET ROLE: ${normalizeText(targetRole, 120)}
Time Available: ${normalizeText(duration, 80)}

INSTRUCTIONS:

1. Analyze TRANSFERABLE skills from current role to target role
2. Identify SKILL GAPS that need to be filled
3. Create a CAREER TRANSITION roadmap with:
   - Phase 1: Foundation (transferable skills + basics)
   - Phase 2: Core skills for target role
   - Phase 3: Advanced + Portfolio building
   - Phase 4: Interview prep + networking

4. Each step MUST include:
- title
- skills
- tools
- tasks (real-world transition tasks)
- outcome
- resources (free, paid, practice)

5. Provide RESUME REWRITE suggestions:
   - How to reframe current experience for target role
   - Projects to add
   - Skills to highlight

6. Add NETWORKING & JOB SEARCH strategy

RETURN STRICT JSON:

{
  "analysis": {
    "transferable_skills": [],
    "skill_gaps": [],
    "transition_challenges": []
  },
  "roadmap": [],
  "resume_improvements": [],
  "networking_strategy": []
}
`;
};