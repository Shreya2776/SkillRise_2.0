// DuckDuckGo Search Fallback Tool
// Fetches real-time search results using DuckDuckGo API whenever local datasets 
// (courses, government schemes, jobs) do not contain relevant results.
// Ensures the AI assistant can always provide resources.

const { search } = require("duck-duck-scrape");

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

/**
 * Searches the web via DuckDuckGo and returns formatted, useful information.
 * 
 * @param {string} query - The search query string (e.g., "best data science courses online")
 * @param {number} timeoutMs - Timeout in ms, default 8000
 * @returns {Promise<Object>} Formatted search result object
 */
async function duckduckgoSearch(query, timeoutMs = 8000) {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    console.warn("[DDG Fallback] Warning: Empty search query provided.");
    return { status: "no_data", message: "Empty query provided", data: [] };
  }

  console.log(`[DDG Fallback] Initiating search for: "${query}"`);

  try {
    // duck-duck-scrape's search() accepts only a query string, no options object
    const searchResults = await Promise.race([
      search(query),
      timeout(timeoutMs)
    ]);

    if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
      console.warn(`[DDG Fallback] No results found for query: "${query}"`);
      return { status: "no_data", message: "No results found from web search", data: [] };
    }

    const topResults = searchResults.results.slice(0, 5);

    const formattedResults = topResults.map(item => ({
      title: item.title || "Untitled Resource",
      link: item.url || item.link || "",
      description: item.description || "No description available",
      name: item.title || "Online Resource",
      provider: "External Web Result"
    }));

    return {
      status: "success",
      data: formattedResults,
      source: "web",
      disclaimer: "Results retrieved from web search fallback",
      reasoning: `Found ${formattedResults.length} web search results for the given query.`
    };

  } catch (error) {
    console.error("[DDG Fallback] Search failed:", error.message);
    return {
      status: "error",
      message: error.message,
      data: []
    };
  }
}

module.exports = duckduckgoSearch;
