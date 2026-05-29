// export function calculateATS(resumeSkills, jobSkills, experienceScore){

//  let skillMatches = resumeSkills.filter(skill =>
//   jobSkills.includes(skill)
//  );

//  const skillScore = (skillMatches.length / jobSkills.length) * 60;

//  const expScore = experienceScore * 25;

//  const keywordScore = 15;

//  const totalScore = skillScore + expScore + keywordScore;

//  return Math.round(totalScore);
// }

export function calculateATS(resumeSkills, jobSkills, experienceYears, resumeText, jobDescription) {
  const normalizedResumeText = resumeText.toLowerCase();
  const normalizedJobSkills = jobSkills.map((skill) => skill.toLowerCase().trim());

  const matchedSkillCount = normalizedJobSkills.filter((skill) =>
    resumeSkills.some((resumeSkill) => resumeSkill.toLowerCase().trim() === skill)
  ).length;

  const skillScore = jobSkills.length
    ? (matchedSkillCount / jobSkills.length) * 50
    : 0;

  const uniqueKeywords = Array.from(
    new Set(
      (jobDescription || "")
        .toLowerCase()
        .split(/\W+/)
        .filter(Boolean)
    )
  );

  const matchedKeywordCount = uniqueKeywords.filter((keyword) =>
    normalizedResumeText.includes(keyword)
  ).length;

  const keywordScore = uniqueKeywords.length
    ? (matchedKeywordCount / uniqueKeywords.length) * 30
    : 0;

  const experienceScore = Math.min(25, Math.max(0, experienceYears * 5));

  const totalScore = Math.round(Math.max(0, Math.min(100, skillScore + keywordScore + experienceScore)));

  return totalScore;
}