const conversationMemory = require('./conversationMemory.cjs');
const vectorMemory = require('./vectorMemory.cjs');

/**
 * Saves a message into both MongoDB (transactional history) and Pinecone (semantic memory).
 */
async function saveMessage(threadId, role, content) {
  try {
    // 1. Save directly to MongoDB to immediately capture the payload
    const savedMsg = await conversationMemory.addMessage(threadId, role, content);
    
    // 2. Queue the embedding creation to avoid heavily blocking the main thread execution
    // (In production, this could be handled asynchronously via background workers/events)
    vectorMemory.storeEmbedding(threadId, savedMsg._id, content, role)
      .then((embedId) => {
        if (embedId) {
          console.log(`[MemoryManager] Successfully vectorized message ${savedMsg._id}`);
        }
      })
      .catch(err => console.error("Vector memory async task failed", err));

    return savedMsg;
  } catch (error) {
    console.error("[MemoryManager] Failed saving message globally:", error);
    throw error;
  }
}

/**
 * Gets historical context from MongoDB and queries semantic contexts from Pinecone.
 * Combines both so the agent LLMs have immediate recency context + long-term semantic context.
 */
async function getRelevantContext(threadId, query) {
  try {
    // Fire queries to both databases concurrently
    const [recentMessages, semanticMatches, datasetMatches] = await Promise.all([
      conversationMemory.getThreadMessages(threadId, 20),
      vectorMemory.retrieveRelevantMessages(threadId, query, 5),
      vectorMemory.retrieveSemanticDatasets(query, 3)
    ]);

    // Format output mapping strictly to the schema we expect
    return {
      recentMessages: recentMessages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt
      })),
      semanticMatches: semanticMatches.map(m => ({
        role: m.role,
        content: m.content,
        score: m.score
      })),
      datasetMatches: datasetMatches.map(m => ({
        type: m.type,
        category: m.category,
        content: m.content,
        score: m.score
      }))
    };
  } catch (error) {
    console.error("[MemoryManager] Context generation failed:", error);
    // Return empty arrays to avoid halting the application
    return {
      recentMessages: [],
      semanticMatches: [],
      datasetMatches: []
    };
  }
}

module.exports = {
  saveMessage,
  getRelevantContext
};
