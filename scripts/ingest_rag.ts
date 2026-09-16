import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Client } from 'pg';
import { GoogleGenAI } from '@google/genai';

interface RawMessage {
  role: string;
  content: string;
}

interface RawDatasetRecord {
  id?: string;
  topic?: string;
  category?: string;
  crisis_tag?: string;
  messages?: RawMessage[];
  dialogue?: Array<{ speaker: string; text: string }>;
  emotion?: string;
  user_input?: string;
  bot_reply?: string;
  language?: string;
}

interface NormalizedChunk {
  id: string;
  content: string;
  source: string;
  category: string;
  metadata: Record<string, any>;
  contentHash: string;
}

function parseJsonObjects(rawText: string): any[] {
  const cleaned = rawText.trim();
  if (!cleaned) return [];
  if (cleaned.startsWith('[')) {
    try {
      return JSON.parse(cleaned);
    } catch {}
  }
  try {
    const wrapped = '[' + cleaned.replace(/\}\s*\{/g, '},{') + ']';
    return JSON.parse(wrapped);
  } catch {}

  const results: any[] = [];
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let startIndex = -1;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') {
        if (depth === 0) startIndex = i;
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && startIndex !== -1) {
          try {
            results.push(JSON.parse(cleaned.slice(startIndex, i + 1)));
          } catch {}
          startIndex = -1;
        }
      }
    }
  }
  return results;
}

async function embedWithRetry(
  ai: GoogleGenAI,
  modelName: string,
  content: string,
  maxRetries: number = 3
): Promise<number[]> {
  let attempt = 0;
  let delayMs = 1500;

  while (attempt < maxRetries) {
    try {
      const res = await ai.models.embedContent({
        model: modelName,
        contents: content,
      });

      const vector = res?.embeddings?.[0]?.values;
      if (!vector || vector.length !== 3072) {
        throw new Error(`Invalid vector returned (dimension: ${vector?.length}, expected 3072)`);
      }
      return vector;
    } catch (err: any) {
      attempt++;
      const isRateLimit = err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.status === 'RESOURCE_EXHAUSTED';
      if (isRateLimit && attempt < maxRetries) {
        console.warn(`[429 Rate Limit]: Retrying in ${delayMs}ms (attempt ${attempt}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs *= 2;
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Failed to generate embedding after ${maxRetries} attempts`);
}

export async function runIngestion(options: { maxNewItems?: number; batchDelayMs?: number } = {}) {
  const maxNewItems = options.maxNewItems || 50; // Default safe increment
  const batchDelayMs = options.batchDelayMs || 600;

  console.log('===========================================================');
  console.log('SOULTALK RESUMABLE PGVECTOR INGESTION (NEON + GEMINI 3072)');
  console.log('===========================================================');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('your-neon-host.neon.tech')) {
    throw new Error('FAIL LOUDLY: DATABASE_URL is missing or contains placeholder host.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('FAIL LOUDLY: GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-embedding-001';

  // 1. Connect to Neon
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to Neon PostgreSQL.');

  // 2. Ensure pgvector and table exist
  await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
  await client.query(`
    CREATE TABLE IF NOT EXISTS rag_documents (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      source TEXT NOT NULL,
      category TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      embedding vector(3072) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 3. Fetch existing content hashes/snippets to prevent ANY duplication
  const existingRows = await client.query('SELECT content FROM rag_documents;');
  const existingContents = new Set<string>();
  for (const row of existingRows.rows) {
    existingContents.add(row.content.trim());
  }
  console.log(`Existing vectors already stored in Neon: ${existingContents.size}`);

  // 4. Load datasets
  const datasetPath1 = path.join(process.cwd(), 'backend', 'dataset', 'soultalk_dataset.json');
  let raw1: any[] = [];
  if (fs.existsSync(datasetPath1)) {
    raw1 = parseJsonObjects(fs.readFileSync(datasetPath1, 'utf8'));
  }
  console.log(`Loaded ${raw1.length} total source records from soultalk_dataset.json`);

  // 5. Clean, normalize and filter out already-ingested records
  const toIngest: NormalizedChunk[] = [];
  let skippedAlreadyIngested = 0;
  let duplicatesInFile = 0;
  const seenInRun = new Set<string>();

  for (let idx = 0; idx < raw1.length; idx++) {
    const rec = raw1[idx];
    let content = '';
    let category = rec.topic || rec.category || 'general_support';

    if (rec.messages && Array.isArray(rec.messages)) {
      const dialogueLines: string[] = [];
      for (const msg of rec.messages) {
        const role = msg.role === 'user' ? 'User' : 'SoulTalk Companion';
        dialogueLines.push(`${role}: ${msg.content.trim()}`);
      }
      content = dialogueLines.join('\n');
    } else if (rec.user_input && rec.bot_reply) {
      content = `User: ${rec.user_input.trim()}\nSoulTalk Companion: ${rec.bot_reply.trim()}`;
    }

    if (!content || content.length < 15) continue;

    const trimmedContent = content.trim();
    if (existingContents.has(trimmedContent)) {
      skippedAlreadyIngested++;
      continue;
    }

    const hash = crypto.createHash('sha256').update(trimmedContent.toLowerCase()).digest('hex');
    if (seenInRun.has(hash)) {
      duplicatesInFile++;
      continue;
    }
    seenInRun.add(hash);

    toIngest.push({
      id: rec.id || `soultalk_${idx}`,
      content: trimmedContent,
      source: 'soultalk_dataset',
      category: category.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      metadata: {
        original_id: rec.id || null,
        topic: category,
        crisis_tag: rec.crisis_tag || 'CRISIS_NONE',
        emotion: rec.emotion || 'supportive',
        source: 'soultalk_dataset',
        character_length: trimmedContent.length,
      },
      contentHash: hash,
    });
  }

  console.log(`Chunks already in Neon (skipped): ${skippedAlreadyIngested}`);
  console.log(`Chunks remaining to ingest: ${toIngest.length}`);

  const batch = toIngest.slice(0, maxNewItems);
  console.log(`Ingesting batch of ${batch.length} new records in this run...`);

  let successfulEmbeddings = 0;
  let failedEmbeddings = 0;

  for (let i = 0; i < batch.length; i++) {
    const chunk = batch[i];
    try {
      const vector = await embedWithRetry(ai, modelName, chunk.content);
      const vectorString = `[${vector.join(',')}]`;

      await client.query(
        `
        INSERT INTO rag_documents (content, source, category, metadata, embedding)
        VALUES ($1, $2, $3, $4, $5::vector)
      `,
        [chunk.content, chunk.source, chunk.category, JSON.stringify(chunk.metadata), vectorString]
      );

      existingContents.add(chunk.content);
      successfulEmbeddings++;
      console.log(`[${i + 1}/${batch.length}] Ingested: [${chunk.category}] ${chunk.id}`);
    } catch (err: any) {
      failedEmbeddings++;
      console.warn(`[FAILED] Record ${chunk.id}: ${err.message}`);
      if (err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
        console.warn('Quota limit reached for this window. Halting batch gracefully. Resumable pipeline will continue next run.');
        break;
      }
    }

    // Rate-limiting delay between requests
    await new Promise((r) => setTimeout(r, batchDelayMs));
  }

  const finalCountRes = await client.query('SELECT COUNT(*) FROM rag_documents;');
  const totalInDb = parseInt(finalCountRes.rows[0].count, 10);
  await client.end();

  const report = {
    totalSourceRecords: raw1.length,
    alreadyInDatabase: skippedAlreadyIngested,
    attemptedThisBatch: batch.length,
    successfulNewEmbeddings: successfulEmbeddings,
    failedThisBatch: failedEmbeddings,
    remainingUnprocessed: toIngest.length - successfulEmbeddings,
    totalDocumentsInNeonNow: totalInDb,
  };

  console.log('\nResumable Ingestion Summary:', report);
  return report;
}

if (process.argv[1] && process.argv[1].endsWith('ingest_rag.ts')) {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 30;

  runIngestion({ maxNewItems: limit })
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Ingestion error:', err.message);
      process.exit(1);
    });
}
