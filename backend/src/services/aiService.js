// import { groqClient } from "../config/groq.js";

// export const generateRoadmapFromAI = async (prompt) => {
//   try {
//     const res = await groqClient.post("/chat/completions", {
//       model: "llama-3.1-8b-instant",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a strict JSON generator. Always return valid JSON only.",
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       temperature: 0.6,
//     });

//     return res.data.choices[0].message.content;
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     throw new Error("AI generation failed");
//   }
// };

import { groqClient } from "../config/groq.js";

export const generateRoadmapFromAI = async (prompt, maxRetries = 3) => {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 AI generation attempt ${attempt}/${maxRetries}...`);
      
      const res = await groqClient.post("/chat/completions", {
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are a strict JSON generator. Always return valid JSON only. Never include explanations or text outside the JSON structure.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1800,
      });

      const content = res.data.choices[0].message.content;
      console.log("✅ AI response received successfully");
      
      // Validate it's parseable JSON before returning
      const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
      JSON.parse(cleaned); // Test parse
      
      return content;
      
    } catch (err) {
      // Capture the actual error from LLM
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.message 
        || err.message;
      
      console.error(`❌ Attempt ${attempt} failed:`, errorMessage);
      lastError = errorMessage;
      
      const normalizedError = lastError || "AI generation failed";

      if (normalizedError.includes("Request too large") || normalizedError.includes("tokens per minute") || normalizedError.includes("exceeded")) {
        throw new Error("The roadmap request was too large for the current AI plan. Please shorten the resume text or try again later.");
      }

      // If it's the last attempt, throw with the actual error
      if (attempt === maxRetries) {
        throw new Error(normalizedError);
      }
      
      // Wait 1 second before retry (exponential backoff)
      console.log(`⏳ Waiting before retry...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  throw new Error(lastError || "AI generation failed after all retries");
};
