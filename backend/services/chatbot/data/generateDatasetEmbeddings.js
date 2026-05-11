const fs = require('fs');
const path = require('path');
const { generateEmbedding } = require('../memory/vectorMemory');

// ─────────────────────────────────────────────
// createText: converts a dataset item into clean
// English text for semantic embedding (max ~100 words)
// ─────────────────────────────────────────────
function createText(item, type) {
  switch (type) {
    case 'job': {
      const skills  = (item.skills  || []).join(', ');
      const edu     = (item.edu     || []).join(', ');
      return (
        `Job Role: ${item.role || ''}. ` +
        `${item.desc || ''}. ` +
        `Skills required: ${skills}. ` +
        `Education: ${edu}. ` +
        `Salary range: ${item.salary || 'Not specified'}. ` +
        `Industry tags: ${(item.tags || []).join(', ')}.`
      ).trim();
    }

    case 'skill': {
      const roles = (item.roles || []).join(', ');
      const tags  = (item.tags  || []).join(', ');
      return (
        `Skill: ${item.name || ''}. ` +
        `${item.desc || ''}. ` +
        `Skill type: ${item.type || ''}. Level: ${item.level || 'general'}. ` +
        `Relevant roles: ${roles}. ` +
        `Tags: ${tags}.`
      ).trim();
    }

    case 'course': {
      const skills = (item.skills || []).join(', ');
      const roles  = (item.roles  || []).join(', ');
      return (
        `Course: ${item.name || ''}. ` +
        `Duration: ${item.duration || 'N/A'}. ` +
        `Eligibility: ${item.eligibility || 'Open to all'}. ` +
        `Skills taught: ${skills}. ` +
        `Career roles: ${roles}. ` +
        `Tags: ${(item.tags || []).join(', ')}.`
      ).trim();
    }

    case 'scheme': {
      const benefits   = (item.benefits || []).join('; ');
      const eduElig    = (item.eligibility?.education || []).join(', ');
      const suppRoles  = (item.supports?.roles || []).join(', ');
      return (
        `Government Scheme: ${item.name || ''}. ` +
        `${item.desc || ''}. ` +
        `Benefits: ${benefits}. ` +
        `Eligibility education: ${eduElig}. ` +
        `Age range: ${item.eligibility?.age_range || 'Any'}. ` +
        `Supports roles: ${suppRoles}. ` +
        `Tags: ${(item.tags || []).join(', ')}.`
      ).trim();
    }

    case 'path': {
      const progression = (item.path  || []).join(' → ');
      const steps       = (item.steps || []).join('; ');
      const skills      = (item.skills || []).join(', ');
      return (
        `Career Path for: ${item.role || ''}. ` +
        `Progression: ${progression}. ` +
        `Steps: ${steps}. ` +
        `Key skills: ${skills}. ` +
        `Education needed: ${(item.edu || []).join(', ')}. ` +
        `Growth time: ${item.growth_time || 'Varies'}.`
      ).trim();
    }

    default:
      // Fallback: basic key-value text (avoids raw JSON)
      return Object.entries(item)
        .filter(([k]) => typeof item[k] !== 'object')
        .map(([k, v]) => `${k}: ${v}`)
        .join('. ');
  }
}

// ─────────────────────────────────────────────
// processDataset: reads a JSON file, generates
// embeddings using createText(), saves back
// ─────────────────────────────────────────────
async function processDataset(filename, type) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[SKIP] File not found: ${filename}`);
    return;
  }

  console.log(`\n[START] Processing ${filename} (type=${type})`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (!Array.isArray(data)) {
    console.warn(`[WARN] ${filename} is not a flat array — skipping.`);
    return;
  }

  let processed = 0;
  let skipped   = 0;

  for (const item of data) {
    if (!item.id) {
      skipped++;
      continue;
    }

    const text = createText(item, type);
    const embedding = await generateEmbedding(text);

    if (!embedding || embedding.length === 0) {
      console.warn(`  [WARN] Empty embedding for item id=${item.id}`);
      skipped++;
      continue;
    }

    // Attach embedding in-memory (we do NOT persist large _embedded.json files)
    item._embeddedText = text;
    item._embeddingDim = embedding.length;
    processed++;
  }

  console.log(`[DONE] ${filename}: ${processed} embeddings created, ${skipped} skipped.`);
}

// ─────────────────────────────────────────────
// main: orchestrates all datasets
// ─────────────────────────────────────────────
async function main() {
  const datasets = [
    { file: 'jobs.json',         type: 'job'    },
    { file: 'job-skill.json',    type: 'skill'  },
    { file: 'courses.json',      type: 'course' },
    { file: 'govSchemes.json',   type: 'scheme' },
    { file: 'career-growth.json',type: 'path'   },
  ];

  try {
    for (const { file, type } of datasets) {
      await processDataset(file, type);
    }
    console.log('\n✅ All dataset embeddings verified successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating embeddings:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createText };
