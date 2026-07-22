export function calculateATS(resumeSkills, jobSkills, experienceScore) {
  const expScore = experienceScore * 25;
  const keywordScore = 15;

  if (!jobSkills || jobSkills.length === 0) {
    const baseSkillScore = Math.min((resumeSkills.length / 10) * 60, 60);
    return Math.round(baseSkillScore + expScore + keywordScore);
  }

  const normalizedJob = jobSkills.map(s => s.toLowerCase().trim());
  const normalizedResume = resumeSkills.map(s => s.toLowerCase().trim());
  const matched = normalizedResume.filter(s => normalizedJob.includes(s));
  const skillScore = (matched.length / normalizedJob.length) * 60;

  return Math.round(skillScore + expScore + keywordScore);
}