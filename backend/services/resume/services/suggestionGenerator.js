import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateSuggestions(resume, job){

 const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
 });

  const prompt = `
You are an expert ATS resume coach. Analyze the resume below${job ? ` against this job description: "${job}"` : ''} and provide structured improvement suggestions.

Return your response in this exact format:
1. [Section Title]
[Detailed suggestion]

2. [Section Title]
[Detailed suggestion]

(continue for all suggestions)

Resume:
${resume}
`;

 const result = await model.generateContent(prompt);

 return result.response.text();
}