// ═══════════════════════════════════════════════════════════════════════════════
// Skill Gap Engine — Reusable Tool Module
// ═══════════════════════════════════════════════════════════════════════════════
// Computes the gap between a user's current skills and a job's required skills.
// Supports synonym mapping, normalization, and is future-ready for embedding similarity.

// ─── Skill Synonym Map ──────────────────────────────────────────────────────
// Maps common abbreviations and aliases to their canonical form.
// Extend this map as new synonyms are discovered.
const SKILL_SYNONYMS = {
  "ml": "machine learning",
  "dl": "deep learning",
  "ai": "artificial intelligence",
  "js": "javascript",
  "ts": "typescript",
  "py": "python",
  "node": "node.js",
  "react": "react.js",
  "vue": "vue.js",
  "ng": "angular",
  "k8s": "kubernetes",
  "tf": "tensorflow",
  "pytorch": "pytorch",
  "pg": "postgresql",
  "postgres": "postgresql",
  "mongo": "mongodb",
  "c#": "csharp",
  "cpp": "c++",
  "dsa": "data structures and algorithms",
  "data structures": "data structures and algorithms",
  "algorithms": "data structures and algorithms",
  "aws": "amazon web services",
  "gcp": "google cloud platform",
  "ci/cd": "continuous integration and deployment",
  "cicd": "continuous integration and deployment",
  "oop": "object oriented programming",
  "sql server": "microsoft sql server",
  "mssql": "microsoft sql server",
  "swe": "software engineering",
  "ui": "user interface design",
  "ux": "user experience design",
  "api": "api development",
  "rest": "rest api",
  "graphql": "graphql api",
  "ops": "operations",
  "devops": "devops engineering",
  "sre": "site reliability engineering",
  "llm": "large language models",
  "nlp": "natural language processing",
  "cv": "computer vision",
  "rl": "reinforcement learning"
};

/**
 * Normalize a single skill string:
 *   1. Lowercase
 *   2. Trim whitespace
 *   3. Resolve synonyms to canonical form
 *
 * @param {string} skill - Raw skill string
 * @returns {string} Normalized canonical skill
 */
function normalizeSkill(skill) {
  if (typeof skill !== "string") return "";
  const cleaned = skill.toLowerCase().trim();
  return SKILL_SYNONYMS[cleaned] || cleaned;
}

/**
 * Normalize an array of skills into a Set of canonical strings.
 *
 * @param {string[]} skills - Array of raw skill strings
 * @returns {Set<string>} Set of normalized skills
 */
function normalizeSkillSet(skills) {
  if (!Array.isArray(skills)) return new Set();
  return new Set(skills.map(normalizeSkill).filter(Boolean));
}

/**
 * Compute the skill gap between a user's skills and a job's required skills.
 *
 * @param {string[]} userSkills     - The user's current skills
 * @param {string[]} requiredSkills - The job's required skills
 * @returns {{ missingSkills: string[], matchedSkills: string[], gapPercentage: number }}
 */
function computeSkillGap(userSkills, requiredSkills) {
  const userSet = normalizeSkillSet(userSkills);
  const requiredSet = normalizeSkillSet(requiredSkills);

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of requiredSet) {
    if (userSet.has(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const total = requiredSet.size;
  const gapPercentage = total === 0 ? 0 : Math.round((missingSkills.length / total) * 100);

  return {
    missingSkills,
    matchedSkills,
    gapPercentage
  };
}

/**
 * [FUTURE-READY] Plug-in point for embedding-based similarity matching.
 * When implemented, this will use vector cosine similarity to detect
 * semantically similar skills that pure string matching misses.
 *
 * @param {string} skillA - First skill
 * @param {string} skillB - Second skill
 * @param {Function} [embeddingFn] - Optional async embedding generator
 * @returns {Promise<number>} Similarity score between 0 and 1
 */
async function embeddingSimilarity(skillA, skillB, embeddingFn = null) {
  // Placeholder — returns 0 until an embedding function is provided
  if (!embeddingFn) return 0;

  try {
    const [vecA, vecB] = await Promise.all([
      embeddingFn(skillA),
      embeddingFn(skillB)
    ]);

    // Cosine similarity
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }
    return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
  } catch {
    return 0;
  }
}

module.exports = {
  computeSkillGap,
  normalizeSkill,
  normalizeSkillSet,
  embeddingSimilarity,
  SKILL_SYNONYMS
};
