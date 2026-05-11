import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateSuggestions(resume, job){

 const model = genAI.getGenerativeModel({
  model: "gemma-3-27b-it"
 });

 const prompt = `
 Analyze the resume and suggest improvements to increase ATS score.

 Resume:
 ${resume}
 `;

 const result = await model.generateContent(prompt);

 return result.response.text();
}