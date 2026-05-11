// Government Scheme Finder Tool
// Finds and recommends relevant government training programs/schemes based on user skills.

const fs = require('fs');
const path = require('path');

const duckDuckGoSearch = require('./duckduckgoSearch.cjs');

/**
 * Finds relevant government schemes based on an array of skills or topics.
 * 
 * @param {string[]} searchSkills - List of input skills/gaps from the user
 * @returns {Promise<Object>} Structured JSON response with schemes (max 5)
 */
const governmentSchemeFinder = async (searchSkills, externalContext = null) => {
  if (!searchSkills || !Array.isArray(searchSkills) || searchSkills.length === 0) {
    console.warn("[SchemeFinder] Warning: No skills provided. Returning empty list.");
    return { status: "no_data", message: "No skills provided", data: [] };
  }

  // ─── Step 0: Use external context from RetrieverNode if provided ─────────
  if (externalContext && Array.isArray(externalContext) && externalContext.length > 0) {
    console.log(`[SchemeFinder] Using ${externalContext.length} results from RetrieverNode (skipping local + DDG).`);
    return {
      status: "success",
      data: externalContext.slice(0, 5),
      source: "retriever_node",
      reasoning: `Found ${externalContext.length} relevant schemes from centralized retriever.`
    };
  }

  console.log(`[SchemeFinder] Running scheme matching for: ${searchSkills.join(', ')}`);

  const datasetPath = path.join(__dirname, '../data/govSchemes.json');
  let govSchemes = {};
  
  if (fs.existsSync(datasetPath)) {
    try {
      govSchemes = require('../data/govSchemes.json.cjs');
    } catch (e) {
      console.warn("[SchemeFinder] Warning: Failed to parse govSchemes.json.");
    }
  } else {
    console.warn("[SchemeFinder] Warning: Dataset is missing at", datasetPath);
  }

  const normalizedSkills = searchSkills.map(skill => skill.toLowerCase());
  
  let results = [];
  let foundMatch = false;

  if (Array.isArray(govSchemes)) {
      for (const entry of govSchemes) {
        const requiredSkills = entry.required_skills || [];
        const normalizedRequired = requiredSkills.map(s => s.toLowerCase());

        const matchesSkill = normalizedSkills.some(skill => 
            normalizedRequired.some(reqSkill => reqSkill.includes(skill) || skill.includes(reqSkill))
        );

        if (matchesSkill && entry.recommended_government_schemes) {
            foundMatch = true;
            results = results.concat(entry.recommended_government_schemes);
        }
      }
  }

  const uniqueResultsMap = new Map();
  for (const rec of results) {
    if (rec && rec.link && !uniqueResultsMap.has(rec.name + rec.link)) {
      uniqueResultsMap.set(rec.name + rec.link, rec);
    }
  }
  const uniqueResults = Array.from(uniqueResultsMap.values());

  if (foundMatch && uniqueResults.length > 0) {
    const finalResults = uniqueResults.slice(0, 5);
    console.log(`[SchemeFinder] Dataset match found: ${finalResults.length}`);
    return {
      status: "success",
      data: finalResults,
      source: "dataset",
      reasoning: `Found ${finalResults.length} relevant schemes in the local dataset.`
    };
  }

  console.log("[SchemeFinder] No local dataset matches found. Falling back to DuckDuckGo search tool...");
  
  try {
    const querySkill = searchSkills[0]; 
    const searchQuery = `government free training skill program for ${querySkill} PMKVY nptel india`;
    
    const externalData = await duckDuckGoSearch(searchQuery);
    
    if (externalData.status === "success") {
      return externalData;
    } else {
      return { status: "no_data", message: "No schemes found via web fallback", data: [] };
    }
    
  } catch (apiError) {
    console.error(`[SchemeFinder] DDG Search Tool failed: ${apiError.message}`);
    return { status: "error", message: "Scheme fetch failed during web fallback", data: [] };
  }
};

module.exports = governmentSchemeFinder;
module.exports.findGovtSchemes = governmentSchemeFinder;
