export function calculateATS(
  resumeSkills,
  jobSkills,
  experienceYears,
  resumeText,
  jobDescription,
) {
  const normalizedResumeText = resumeText.toLowerCase();
  const normalizedResumeSkills = resumeSkills.map((s) =>
    s.toLowerCase().trim(),
  );

  // ─── 1. SKILL MATCH SCORE (0–50) ──────────────────────────────────────
  // Use fuzzy matching: check if job skill is "contained in" or "contains" resume skill
  let matchedSkillCount = 0;
  const matchDetails = [];

  for (const jobSkill of jobSkills) {
    const jobSkillLower = jobSkill.toLowerCase().trim();
    const isMatched = normalizedResumeSkills.some((resumeSkill) => {
      // Exact match
      if (resumeSkill === jobSkillLower) return true;
      // Partial match: job skill contains or is contained in resume skill
      return (
        jobSkillLower.includes(resumeSkill) ||
        resumeSkill.includes(jobSkillLower)
      );
    });
    if (isMatched) {
      matchedSkillCount++;
      matchDetails.push(`✓ ${jobSkill}`);
    }
  }

  const skillScore =
    jobSkills.length > 0 ? (matchedSkillCount / jobSkills.length) * 50 : 0;

  // ─── 2. KEYWORD MATCH SCORE (0–30) ──────────────────────────────────────
  // Parse job description into meaningful keywords (filter stop words)
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "are",
    "was",
    "be",
    "this",
    "that",
    "these",
    "those",
    "it",
    "we",
    "you",
    "he",
    "she",
    "they",
  ]);

  const jobDescriptionLower = jobDescription.toLowerCase();
  const keywords = Array.from(
    new Set(
      jobDescriptionLower
        .split(/\W+/)
        .filter((word) => word.length > 2 && !stopWords.has(word)),
    ),
  );

  let matchedKeywordCount = 0;
  for (const keyword of keywords) {
    if (normalizedResumeText.includes(keyword)) {
      matchedKeywordCount++;
    }
  }

  const keywordScore =
    keywords.length > 0 ? (matchedKeywordCount / keywords.length) * 30 : 15; // Default 15 if no job description provided

  // ─── 3. EXPERIENCE SCORE (0–25) ──────────────────────────────────────
  // Linear: 0 years = 0, 5+ years = 25
  const experienceScore = Math.min(25, Math.max(0, experienceYears * 5));

  // ─── 4. FINALIZATION ────────────────────────────────────────────────────
  // Bonus: if skill matches are strong and experience exists, boost
  const baseScore = skillScore + keywordScore + experienceScore;
  let finalScore = Math.round(Math.max(0, Math.min(100, baseScore)));

  // Apply a small bonus if we have both skills + keywords match
  if (matchedSkillCount > 0 && matchedKeywordCount > 0 && experienceYears > 0) {
    finalScore = Math.min(100, finalScore + 5);
  }

  console.log(
    `[ATS Score] Skills: ${matchedSkillCount}/${jobSkills.length} (${skillScore.toFixed(1)}) + Keywords: ${matchedKeywordCount}/${keywords.length} (${keywordScore.toFixed(1)}) + Exp: ${experienceYears}y (${experienceScore.toFixed(1)}) = ${finalScore}`,
  );

  return finalScore;
}
