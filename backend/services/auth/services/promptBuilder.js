export const buildRoadmapPrompt = ({
  profile,
  resumeText,
  targetRole,
  duration,
  completedSteps = [],
  careerSwitch = false,
}) => {
  return `
You are an expert AI career mentor.

USER DATA:
Profile: ${JSON.stringify(profile)}
Resume: ${resumeText}

Target Role: ${targetRole}
Time Available: ${duration}

Completed Steps: ${JSON.stringify(completedSteps)}

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
  return `
You are an expert AI career mentor updating an existing roadmap.

USER DATA:
Profile: ${JSON.stringify(profile)}
Resume: ${resumeText}

Target Role: ${targetRole}
Time Available: ${duration}

COMPLETED STEPS: ${JSON.stringify(completedSteps)}

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
  return `
You are an expert AI career transition mentor.

USER DATA:
Profile: ${JSON.stringify(profile)}
Resume: ${resumeText}

CURRENT ROLE: ${currentRole}
TARGET ROLE: ${targetRole}
Time Available: ${duration}

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