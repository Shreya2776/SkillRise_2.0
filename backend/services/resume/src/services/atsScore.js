export function calculateATS(resumeSkills, jobSkills, experienceScore){

 let skillMatches = resumeSkills.filter(skill =>
  jobSkills.includes(skill)
 );

 const skillScore = (skillMatches.length / jobSkills.length) * 60;

 const expScore = experienceScore * 25;

 const keywordScore = 15;

 const totalScore = skillScore + expScore + keywordScore;

 return Math.round(totalScore);
}