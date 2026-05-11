import cosineSimilarity from "cosine-similarity";

function textToVector(text) {
  const words = text.toLowerCase().split(/\W+/);
  const vector = {};

  words.forEach(w => {
    vector[w] = (vector[w] || 0) + 1;
  });

  return vector;
}

export async function getEmbedding(text) {
  return textToVector(text);
}

export function compareEmbeddings(vec1, vec2) {
  return cosineSimilarity(vec1, vec2);
}