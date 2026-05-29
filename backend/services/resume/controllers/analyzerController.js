// import { parseResume } from "../services/resumeParser.js";
// import { extractSkills } from "../services/skillExtractor.js";
// import { calculateATS } from "../services/atsScore.js";
// import { generateSuggestions } from "../services/suggestionGenerator.js";

// export async function analyzeResume(req,res){

//  try{
//  console.log("File received:", req.file);
//  const text = await parseResume(req.file);
//  console.log("Extracted text length:", text.length);
//  const skills = await extractSkills(text);
//  console.log("Skills:", skills);
 
//  const jobSkills = req.body?.jobSkills || [];
//  const jobDescription = req.body?.jobDescription || "";

//  const score = calculateATS(skills, jobSkills, 0.8);

//  const suggestions = await generateSuggestions(text, jobDescription);
 
  

//  res.json({
//   skills,
//   score,
//   suggestions
//  });

//  }catch(err){
//   res.status(500).json({error:err.message});
//  }


// }

import { parseResume } from "../services/resumeParser.js";
import { extractSkills } from "../services/skillExtractor.js";
import { calculateATS } from "../services/atsScore.js";
import { generateSuggestions } from "../services/suggestionGenerator.js";

export async function analyzeResume(req, res) {
  try {
    console.log("File received:", req.file);

    const text = await parseResume(req.file);
    console.log("Extracted text length:", text.length);

    const skills = await extractSkills(text);
    console.log("Skills:", skills);

    const jobSkills = req.body.jobSkills ? JSON.parse(req.body.jobSkills) : [];
    const jobDescription = req.body.jobDescription || "";
    const jobTitle = req.body.jobTitle || "";
    const experienceYears = Number(req.body.experienceYears || 0);

    const score = calculateATS(skills, jobSkills, experienceYears, text, jobDescription);

    const suggestions = await generateSuggestions(text, jobDescription, skills, jobTitle);

    res.json({
      skills,
      atsScore: score,
      suggestions,
      jobTitle,
      jobDescription,
      jobSkills,
      experienceYears,
    });
  } catch (err) {
    console.error("[Resume Analyzer] error:", err);
    res.status(500).json({ error: err.message });
  }
}