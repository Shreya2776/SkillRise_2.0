const fs = require('fs');
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { generateEmbedding } = require('../memory/vectorMemory');
const { createText } = require('./generateDatasetEmbeddings');

// ─────────────────────────────────────────────
// Pinecone — single shared index: chat-memory
// ─────────────────────────────────────────────
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX_NAME || 'chat-memory');

const BATCH_SIZE = 50;

// ─────────────────────────────────────────────
// upsertBatch: batch upsert vectors into Pinecone
// ─────────────────────────────────────────────
async function upsertBatch(records) {
  if (records.length === 0) return;
  try {
    await index.upsert({ records });
  } catch (err) {
    console.error(`  [ERROR] Batch upsert failed:`, err.message || err);
  }
}

// ─────────────────────────────────────────────
// processDataset: reads, embeds, and upserts
// all items from a given JSON file into Pinecone
// ─────────────────────────────────────────────
async function processDataset(filename, type) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[SKIP] File not found: ${filename}`);
    return;
  }

  console.log(`\n[START] Embedding ${filename} → Pinecone (type=${type})`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (!Array.isArray(data)) {
    console.warn(`[WARN] ${filename} is not a flat array — skipping.`);
    return;
  }

  console.log(`  Items found: ${data.length}`);

  let totalEmbeddings = 0;
  let totalUpserted   = 0;
  let skipped         = 0;
  let batch           = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];

    if (!item.id) {
      skipped++;
      continue;
    }

    // Generate clean semantic text (no raw JSON)
    const text = createText(item, type);

    // Generate embedding
    const embedding = await generateEmbedding(text);
    if (!embedding || embedding.length === 0) {
      console.warn(`  [WARN] Empty embedding for id=${item.id} — skipping.`);
      skipped++;
      continue;
    }

    totalEmbeddings++;

    // Build Pinecone record
    // Use stable item.id so re-runs upsert (update) rather than duplicate
    const record = {
      id: `${type}_${item.id}`,
      values: embedding,
      metadata: {
        type: type,
        name: item.role || item.name || item.id,
        // Store condensed content for retrieval context
        content: text.substring(0, 500),
      }
    };

    batch.push(record);

    // Flush batch when it hits BATCH_SIZE
    if (batch.length >= BATCH_SIZE) {
      await upsertBatch(batch);
      totalUpserted += batch.length;
      console.log(`  [BATCH] Upserted ${totalUpserted}/${data.length - skipped} vectors...`);
      batch = [];
    }
  }

  // Flush remaining records
  if (batch.length > 0) {
    await upsertBatch(batch);
    totalUpserted += batch.length;
    batch = [];
  }

  console.log(
    `[DONE] ${filename}:\n` +
    `  Items processed : ${data.length - skipped}\n` +
    `  Embeddings made : ${totalEmbeddings}\n` +
    `  Vectors upserted: ${totalUpserted}\n` +
    `  Skipped         : ${skipped}`
  );
}

// ─────────────────────────────────────────────
// main: runs all datasets in sequence
// ─────────────────────────────────────────────
async function main() {
  const datasets = [
    { file: 'jobs.json',          type: 'job'    },
    { file: 'job-skill.json',     type: 'skill'  },
    { file: 'courses.json',       type: 'course' },
    { file: 'govSchemes.json',    type: 'scheme' },
    { file: 'career-growth.json', type: 'path'   },
  ];

  try {
    for (const { file, type } of datasets) {
      await processDataset(file, type);
    }

    console.log('\n✅ All datasets embedded and upserted into Pinecone (chat-memory index) successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during embedding/upserting:', error);
    process.exit(1);
  }
}

main();
