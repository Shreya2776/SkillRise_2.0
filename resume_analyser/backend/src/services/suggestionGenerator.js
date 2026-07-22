import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const groqClient = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    "Content-Type": "application/json",
  },
});

export async function generateSuggestions(resume, job) {
  const prompt = `You are an expert ATS resume coach. Analyze the resume below${job ? ` against this job description: "${job}"` : ''} and provide structured improvement suggestions.

Return your response in this exact format:
1. [Section Title]
[Detailed suggestion]

2. [Section Title]
[Detailed suggestion]

Resume:
${resume}`;

  const res = await groqClient.post("/chat/completions", {
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  return res.data.choices[0].message.content;
}