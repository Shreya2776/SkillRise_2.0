import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const generateBlogContent = async (topic, details = "") => {
  try {
    const prompt = `
You are an expert content creator helping NGOs in India create blog posts for job awareness and skill development.

Audience:
* blue collar workers
* grey collar workers
* students and job seekers

Task:
Generate a blog post.

Input:
Topic: ${topic}
Details: ${details}

Instructions:
* simple language
* practical job-focused content
* Indian context
* 80–120 word description

Return STRICT JSON:
{
"title": "",
"description": "",
"skills": [],
"tags": []
}

Rules:
* no extra text
* no markdown
* valid JSON only
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const jsonOutput = JSON.parse(content);
    return jsonOutput;

  } catch (error) {
    console.error("AI Generation Error:", error.message);
    throw new Error("Failed to generate blog content. " + error.message);
  }
};

