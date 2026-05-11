import { parseResume } from "../services/resumeParser.js";
import { extractSkills } from "../services/skillExtractor.js";
import { calculateATS } from "../services/atsScore.js";
import { generateSuggestions } from "../services/suggestionGenerator.js";

export async function analyzeResume(req,res){

 try{
 console.log("File received:", req.file);
 const text = await parseResume(req.file);
 console.log("Extracted text length:", text.length);
 const skills = await extractSkills(text);
 console.log("Skills:", skills);
 
 const jobSkills = req.body?.jobSkills || [];
 const jobDescription = req.body?.jobDescription || "";

 const score = calculateATS(skills, jobSkills, 0.8);

 const suggestions = await generateSuggestions(text, jobDescription);
 
  

 res.json({
  skills,
  score,
  suggestions
 });

 }catch(err){
  res.status(500).json({error:err.message});
 }


}