import 'dotenv/config';
import { Client, Pool } from 'pg';
import dns from 'dns/promises';
import { GoogleGenAI } from '@google/genai';

export interface RagDocument {
  id: number;
  content: string;
  source: string;
  category: string;
  metadata: Record<string, any>;
  similarity_score: number;
}

export interface VectorRagRetrievalResult {
  success: boolean;
  rag_mode: 'PGVECTOR_SEMANTIC' | 'PGVECTOR_FAILED' | 'LOW_CONFIDENCE' | 'OFFLINE_FALLBACK';
  documents: RagDocument[];
  retrieved_count: number;
  retrieved_ids: number[];
  retrieved_scores: number[];
  retrieved_topics: string[];
  embedding_dimension: number;
  error?: string;
  context_text: string;
  execution_time_ms: number;
}

export interface NeonDbStatus {
  success: boolean;
  dns_resolved: boolean;
  host?: string;
  connected: boolean;
  select_1: boolean;
  is_neon: boolean;
  version?: string;
  ssl_enabled: boolean;
  pgvector_active: boolean;
  pgvector_version?: string;
  rag_table_exists: boolean;
  rag_table_count: number;
  vector_dimension: number;
  error?: string;
  details?: Record<string, any>;
}

// Global pool instance to prevent socket leaks
let poolInstance: Pool | null = null;

export function getPostgresPool(): Pool | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes('your-neon-host.neon.tech') || dbUrl.includes('your_username')) {
    return null;
  }

  if (!poolInstance) {
    try {
      poolInstance = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      poolInstance.on('error', (err) => {
        console.error('[Neon Pool Error]:', err.message);
      });
    } catch (e: any) {
      console.error('[Neon Pool Init Failed]:', e.message);
      return null;
    }
  }

  return poolInstance;
}

// Explicit verification of Neon PostgreSQL + pgvector
export async function verifyNeonDatabase(): Promise<NeonDbStatus> {
  const dbUrl = process.env.DATABASE_URL;
  const status: NeonDbStatus = {
    success: false,
    dns_resolved: false,
    connected: false,
    select_1: false,
    is_neon: false,
    ssl_enabled: false,
    pgvector_active: false,
    rag_table_exists: false,
    rag_table_count: 0,
    vector_dimension: 3072,
  };

  if (!dbUrl) {
    status.error = 'FAIL LOUDLY: DATABASE_URL environment variable is completely unset.';
    return status;
  }

  let parsed: URL;
  try {
    parsed = new URL(dbUrl);
    status.host = parsed.hostname;
  } catch (err: any) {
    status.error = `FAIL LOUDLY: DATABASE_URL is not a valid URL format: ${err.message}`;
    return status;
  }

  if (parsed.hostname === 'your-neon-host.neon.tech' || parsed.username === 'your_username') {
    status.error = `FAIL LOUDLY: DATABASE_URL contains unconfigured placeholder host '${parsed.hostname}'. Production Neon credentials must be configured.`;
    return status;
  }

  // 1. Verify DNS
  try {
    const lookup = await dns.lookup(parsed.hostname);
    if (!lookup || !lookup.address) {
      status.error = `FAIL LOUDLY: DNS resolution returned no address for ${parsed.hostname}`;
      return status;
    }
    status.dns_resolved = true;
  } catch (dnsErr: any) {
    status.error = `FAIL LOUDLY: DNS resolution failed for host '${parsed.hostname}': ${dnsErr.message} (${dnsErr.code})`;
    return status;
  }

  // 2. PostgreSQL Connection & SSL
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 7000,
  });

  try {
    await client.connect();
    status.connected = true;

    // 3. SELECT 1 & Version
    const selectRes = await client.query('SELECT 1 as ping, version();');
    if (selectRes.rows?.[0]?.ping === 1) {
      status.select_1 = true;
      status.version = selectRes.rows[0].version;
      status.is_neon = (status.version?.toLowerCase().includes('neon') || parsed.hostname.includes('.neon.tech'));
    }

    // 4. Check SSL
    try {
      const sslRes = await client.query('SELECT ssl_is_used();');
      status.ssl_enabled = !!sslRes.rows?.[0]?.ssl_is_used;
    } catch {
      status.ssl_enabled = true; // Connected with ssl client option
    }

    // 5. Check pgvector extension
    const extRes = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';");
    if (extRes.rows.length > 0) {
      status.pgvector_active = true;
      status.pgvector_version = extRes.rows[0].extversion;
    } else {
      // Attempt activation
      try {
        await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
        const extRetry = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';");
        if (extRetry.rows.length > 0) {
          status.pgvector_active = true;
          status.pgvector_version = extRetry.rows[0].extversion;
        }
      } catch (extErr: any) {
        status.error = `FAIL LOUDLY: Failed to activate pgvector extension: ${extErr.message}`;
        await client.end();
        return status;
      }
    }

    // 6. Ensure RAG table exists
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

    // Verify table and count
    const tableCheck = await client.query("SELECT COUNT(*) FROM rag_documents;");
    status.rag_table_exists = true;
    status.rag_table_count = parseInt(tableCheck.rows[0].count, 10);
    status.success = true;

    await client.end();
    return status;
  } catch (dbErr: any) {
    status.error = `FAIL LOUDLY: PostgreSQL operation failed: ${dbErr.message}`;
    try { await client.end(); } catch {}
    return status;
  }
}

// Generate Embedding via Gemini Embedding API
export async function generateEmbedding(text: string): Promise<{ vector: number[]; dimension: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('FAIL LOUDLY: GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-embedding-001';

  const res = await ai.models.embedContent({
    model: modelName,
    contents: text.trim(),
  });

  const vector = res?.embeddings?.[0]?.values;
  if (!vector || !Array.isArray(vector)) {
    throw new Error(`FAIL LOUDLY: Invalid embedding output from ${modelName}`);
  }

  if (vector.length !== 3072) {
    throw new Error(`FAIL LOUDLY: Expected 3072 dimensions, but received ${vector.length}`);
  }

  return { vector, dimension: vector.length };
}

// Real Semantic Vector Search using pgvector cosine distance (<=>)
export async function searchPgvectorRAG(
  query: string,
  topK: number = 5,
  minSimilarity: number = 0.60
): Promise<VectorRagRetrievalResult> {
  const startTime = Date.now();
  const pool = getPostgresPool();

  if (!pool) {
    const errorMsg = 'FAIL LOUDLY: Real Neon PostgreSQL connection pool is not available.';
    return {
      success: false,
      rag_mode: 'PGVECTOR_FAILED',
      documents: [],
      retrieved_count: 0,
      retrieved_ids: [],
      retrieved_scores: [],
      retrieved_topics: [],
      embedding_dimension: 0,
      error: errorMsg,
      context_text: '',
      execution_time_ms: Date.now() - startTime,
    };
  }

  try {
    // 1. Generate query embedding
    const { vector, dimension } = await generateEmbedding(query);

    // 2. Format vector for pgvector
    const vectorString = `[${vector.join(',')}]`;

    // 3. Real PostgreSQL pgvector query using <=> (cosine distance)
    // Cosine similarity = 1 - cosine_distance
    const sql = `
      SELECT 
        id, 
        content, 
        source, 
        category, 
        metadata,
        (1 - (embedding <=> $1::vector)) AS similarity_score
      FROM rag_documents
      ORDER BY embedding <=> $1::vector ASC
      LIMIT $2;
    `;

    const result = await pool.query(sql, [vectorString, topK]);

    const allDocs: RagDocument[] = result.rows.map((row: any) => ({
      id: row.id,
      content: row.content,
      source: row.source,
      category: row.category,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {}),
      similarity_score: parseFloat(row.similarity_score),
    }));

    // 4. Filter by minimum similarity threshold (Phase 11: Negative retrieval test)
    const validDocs = allDocs.filter(d => d.similarity_score >= minSimilarity);

    const isLowConfidence = validDocs.length === 0;
    const ragMode: VectorRagRetrievalResult['rag_mode'] = isLowConfidence ? 'LOW_CONFIDENCE' : 'PGVECTOR_SEMANTIC';

    // 5. Build context block for prompt
    let contextText = '';
    if (!isLowConfidence) {
      contextText = validDocs.map((doc, idx) => {
        const topic = doc.category || doc.metadata?.topic || 'general';
        const emotion = doc.metadata?.emotion || 'supportive';
        return `[Exemplar ${idx + 1} | Topic: ${topic} | Emotion: ${emotion} | Similarity: ${doc.similarity_score.toFixed(3)}]\n${doc.content}`;
      }).join('\n\n');
    }

    return {
      success: true,
      rag_mode: ragMode,
      documents: validDocs,
      retrieved_count: validDocs.length,
      retrieved_ids: validDocs.map(d => d.id),
      retrieved_scores: validDocs.map(d => parseFloat(d.similarity_score.toFixed(4))),
      retrieved_topics: Array.from(new Set(validDocs.map(d => d.category || d.metadata?.topic || 'unknown'))),
      embedding_dimension: dimension,
      context_text: contextText,
      execution_time_ms: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      success: false,
      rag_mode: 'PGVECTOR_FAILED',
      documents: [],
      retrieved_count: 0,
      retrieved_ids: [],
      retrieved_scores: [],
      retrieved_topics: [],
      embedding_dimension: 0,
      error: `FAIL LOUDLY: pgvector semantic retrieval failed: ${err.message}`,
      context_text: '',
      execution_time_ms: Date.now() - startTime,
    };
  }
}
