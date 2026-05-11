// export const formatRoadmap = (raw) => {
//   try {
//     const cleaned = raw
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();
//        console.log("ROADMAP DATA:", raw);
//     return JSON.parse(cleaned);
//   } catch (err) {
//     console.error("Bad JSON:", raw);
//     return { error: "Invalid AI response" };
//   }
// };

export const formatRoadmap = (raw) => {
  try {
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    
    console.log("📝 Parsing AI response...");
    
    const parsed = JSON.parse(cleaned);
    
    // Validate that roadmap exists and is an array
    if (!parsed.roadmap || !Array.isArray(parsed.roadmap)) {
      console.error("❌ Invalid roadmap structure:", parsed);
      throw new Error("Roadmap array not found in AI response");
    }
    
    console.log("✅ Roadmap parsed successfully with", parsed.roadmap.length, "items");
    return parsed;
    
  } catch (err) {
    console.error("❌ JSON parsing failed:", err.message);
    console.error("Raw response:", raw);
    
    throw new Error(`Failed to parse AI response: ${err.message}`);
  }
};
