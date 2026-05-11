// Course Finder Tool
// Finds relevant courses based on user skills, missing skills, or target roles.

const fs = require('fs');
const path = require('path');

const duckDuckGoSearch = require('./duckduckgoSearch.cjs');

/**
 * Finds matching courses based on skills array
 * 
 * @param {string|string[]} targetSkills - List of input skills (can be gaps or roles)
 * @returns {Promise<Object>} Structured JSON response with courses (max 5)
 */
const courseFinder = async (targetSkills, externalContext = null) => {
  if (!targetSkills) {
    return { status: "error", message: "Target skills missing", data: [] };
  }

  const searchSkills = Array.isArray(targetSkills) ? targetSkills : [targetSkills];

  if (searchSkills.length === 0 || searchSkills.join('').trim() === '') {
    console.warn("[CourseFinder] Warning: Empty skill inputs. Returning empty list.");
    return { status: "no_data", message: "Empty skill inputs", data: [] };
  }

  // ─── Step 0: Use external context from RetrieverNode if provided ─────────
  if (externalContext && Array.isArray(externalContext) && externalContext.length > 0) {
    console.log(`[CourseFinder] Using ${externalContext.length} results from RetrieverNode (skipping local + DDG).`);
    return {
      status: "success",
      data: externalContext.slice(0, 5),
      source: "retriever_node",
      reasoning: `Found ${externalContext.length} relevant courses from centralized retriever.`
    };
  }

  console.log(`[CourseFinder] Running course matching for: ${searchSkills.join(', ')}`);

  const datasetPath = path.join(__dirname, '../data/courses.json');
  let coursesData = {};
  
  if (fs.existsSync(datasetPath)) {
    try {
      coursesData = require('../data/courses.json.cjs');
    } catch (e) {
      console.warn("[CourseFinder] Warning: Failed to parse courses.json.");
    }
  } else {
    console.warn(`[CourseFinder] Warning: Dataset is missing at ${datasetPath}`);
  }

  const normalizedSkills = searchSkills.map(skill => skill.toLowerCase());
  
  let rawResults = [];
  let foundMatch = false;

  for (const [categoryName, coursesArr] of Object.entries(coursesData)) {
    const categoryLower = categoryName.toLowerCase();
    
    const isCategoryMatch = normalizedSkills.some(skill => 
      categoryLower.includes(skill) || skill.includes(categoryLower) || categoryLower === "missing_fallback"
    );

    if (isCategoryMatch) {
      foundMatch = true;
      rawResults = rawResults.concat(coursesArr);
    }
  }

  const uniqueResultsMap = new Map();
  for (const course of rawResults) {
    if (!uniqueResultsMap.has(course.link)) {
      uniqueResultsMap.set(course.link, course);
    }
  }

  const uniqueResults = Array.from(uniqueResultsMap.values());

  if (foundMatch && uniqueResults.length > 0) {
    const finalResults = uniqueResults.slice(0, 5);
    console.log(`[CourseFinder] Dataset match found: ${finalResults.length}`);
    return {
      status: "success",
      data: finalResults,
      source: "dataset",
      reasoning: `Found ${finalResults.length} relevant courses in the local dataset for the requested skills.`
    };
  }

  console.log("[CourseFinder] No local course matches found. Triggering DuckDuckGo fallback...");
  
  try {
    const subject = searchSkills[0]; 
    const query = `best free courses for ${subject}`;
    
    const webResults = await duckDuckGoSearch(query);
    
    // duckDuckGoSearch now returns structured object: { status, data, source, ... }
    if (webResults.status === "success") {
      return webResults;
    } else {
      return { status: "no_data", message: "No courses found via web fallback", data: [] };
    }

  } catch (apiError) {
    console.error(`[CourseFinder] DDG Course Search failed: ${apiError.message}`);
    return { status: "error", message: "Course fetch failed during web fallback", data: [] };
  }
};

module.exports = courseFinder;
module.exports.findCourses = courseFinder;
