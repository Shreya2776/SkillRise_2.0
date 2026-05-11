const { Pinecone } = require("@pinecone-database/pinecone");
const { pipeline } = require("@xenova/transformers");

const EMBEDDING_MODEL = 'Xenova/bge-small-en-v1.5';
let generatorPromise = null;

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || 'dummy-key' });
const index = pinecone.index('chat-memory');

/**
 * Generates a local embedding for a string using Transformers.js (bge-small-en)
 */
async function generateEmbedding(text) {
  try {
    if (!generatorPromise) {
      generatorPromise = pipeline('feature-extraction', EMBEDDING_MODEL, { quantized: true });
    }
    const extractor = await generatorPromise;
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error("Vector Memory Error: Failed generating embedding", error.message);
    return [];
  }
}

/**
 * Stores a message embedding into Pinecone DB.
 */
async function storeEmbedding(threadId, messageId, content, role) {
  try {
    const vector = await generateEmbedding(content);
    if (!vector || vector.length === 0) return null;

    const record = {
      id: String(messageId),
      values: vector,
      metadata: {
        threadId: String(threadId),
        role: role,
        content: content,
        timestamp: Date.now()
      }
    };

    await index.upsert({ records: [record] });
    return messageId;

  } catch (error) {
    console.error("Vector Memory Error: Could not store embedding", error);
    return null;
  }
}

/**
 * Retrieves the most semantically relevant messages within a specific thread constraint.
 */
async function retrieveRelevantMessages(threadId, query, topK = 5) {
  try {
    const queryVector = await generateEmbedding(query);
    if (!queryVector || queryVector.length === 0) return [];

    const response = await index.query({
      vector: queryVector,
      topK: topK,
      includeMetadata: true,
      filter: {
        threadId: { $eq: String(threadId) }
      }
    });

    return response.matches.map(match => ({
      messageId: match.id,
      content: match.metadata?.content || "",
      role: match.metadata?.role || "",
      score: match.score
    }));

  } catch (error) {
    console.error("Vector Memory Error: Failed to retrieve messages", error);
    return [];
  }
}

/**
 * Retrieves the most semantically relevant static global datasets.
 */
async function retrieveSemanticDatasets(query, topK = 3) {
  try {
    const queryVector = await generateEmbedding(query);
    if (!queryVector || queryVector.length === 0) return [];

    const response = await index.query({
      vector: queryVector,
      topK: topK,
      includeMetadata: true,
      filter: {
        type: { $in: ["dataset_courses", "dataset_govSchemes", "dataset_skillRoadmap"] }
      }
    });

    return response.matches.map(match => ({
      type: match.metadata?.type || "dataset",
      content: match.metadata?.content || "",
      category: match.metadata?.category || "",
      score: match.score
    }));

  } catch (error) {
    console.error("Vector Memory Error: Failed to retrieve datasets", error);
    return [];
  }
}

module.exports = {
  storeEmbedding,
  retrieveRelevantMessages,
  retrieveSemanticDatasets,
  generateEmbedding
};
