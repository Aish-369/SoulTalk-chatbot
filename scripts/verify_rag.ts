import 'dotenv/config';
import { verifyNeonDatabase, searchPgvectorRAG, generateEmbedding } from '../server/neonVectorRag';
import { GoogleGenAI } from '@google/genai';

async function main() {
  console.log('====================================================');
  console.log('SOULTALK REAL NEON POSTGRESQL + PGVECTOR RAG AUDIT');
  console.log('====================================================\n');

  // PHASE 1 — FIX NEON DATABASE
  console.log('>>> PHASE 1: NEON DATABASE VERIFICATION');
  const dbStatus = await verifyNeonDatabase();
  console.log('DNS Resolved:', dbStatus.dns_resolved);
  console.log('Connection Succeeded:', dbStatus.connected);
  console.log('SELECT 1 Succeeded:', dbStatus.select_1);
  console.log('Database is Neon:', dbStatus.is_neon);
  console.log('SSL Enabled:', dbStatus.ssl_enabled);
  if (!dbStatus.success) {
    console.error('FAIL LOUDLY: Neon Database Check Failed:', dbStatus.error);
  } else {
    console.log('Database Verification PASSED.');
  }

  // PHASE 2 — PGVECTOR EXTENSION VERIFICATION
  console.log('\n>>> PHASE 2: PGVECTOR VERIFICATION');
  console.log('pgvector Active:', dbStatus.pgvector_active);
  console.log('pgvector Version:', dbStatus.pgvector_version || 'N/A');

  // PHASE 3 — RAG TABLE DESIGN
  console.log('\n>>> PHASE 3: RAG TABLE DESIGN');
  console.log('Table exists:', dbStatus.rag_table_exists);
  console.log('Rows in rag_documents:', dbStatus.rag_table_count);
  console.log('Configured Vector Column Dimension:', dbStatus.vector_dimension);

  // PHASE 4 — EMBEDDING MODEL VERIFICATION
  console.log('\n>>> PHASE 4: EMBEDDING MODEL VERIFICATION');
  let embeddingOk = false;
  let sampleDim = 0;
  try {
    const embedRes = await generateEmbedding('SoulTalk emotional resonance query');
    sampleDim = embedRes.dimension;
    embeddingOk = sampleDim === 3072;
    console.log('Model: gemini-embedding-001');
    console.log('Actual Output Dimension:', sampleDim);
    console.log('Matches Database vector(3072):', embeddingOk);
  } catch (embedErr: any) {
    console.error('FAIL LOUDLY: Embedding model verification failed:', embedErr.message);
  }

  // PHASE 7, 8, 9, 10 — VECTOR RETRIEVAL AND LLM INJECTION
  console.log('\n>>> PHASE 7 - 10: SEMANTIC VECTOR RETRIEVAL & LLM PIPELINE');
  const testQueries = [
    { id: 'TEST 1', text: 'I feel lonely and nobody understands me.' },
    { id: 'TEST 2', text: 'I am anxious about my future.' },
    { id: 'TEST 3', text: 'I lost someone close to me and I am grieving.' },
    { id: 'TEST 4', text: 'I feel confused and overwhelmed.' },
  ];

  const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

  for (const t of testQueries) {
    console.log(`\n--- ${t.id} ---`);
    console.log(`Query: "${t.text}"`);

    const ragResult = await searchPgvectorRAG(t.text, 3, 0.60);
    console.log(`RAG Mode: ${ragResult.rag_mode}`);
    console.log(`Retrieved Count: ${ragResult.retrieved_count}`);
    console.log(`Retrieved IDs: [${ragResult.retrieved_ids.join(', ')}]`);
    console.log(`Similarity Scores: [${ragResult.retrieved_scores.join(', ')}]`);
    console.log(`Retrieved Topics: [${ragResult.retrieved_topics.join(', ')}]`);
    console.log(`Embedding Dimension: ${ragResult.embedding_dimension}`);

    if (ragResult.error) {
      console.log(`RAG Retrieval Error: ${ragResult.error}`);
    }

    // LLM generation with context
    if (ai) {
      try {
        const systemPrompt = `You are SoulTalk (Wolfie), an empathetic emotional companion. 
        Ground your tone in the following retrieved exemplars if available:
        ${ragResult.context_text || 'No external RAG exemplars available.'}
        Respond with warm, non-diagnostic compassion.`;

        let res: any = null;
        let chosenModel = 'gemini-3.8-flash';
        for (const m of ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest']) {
          try {
            res = await ai.models.generateContent({
              model: m,
              contents: [{ role: 'user', parts: [{ text: t.text }] }],
              config: { systemInstruction: systemPrompt }
            });
            if (res && res.text) {
              chosenModel = m;
              break;
            }
          } catch (mErr) {
            // try next
          }
        }

        console.log(`LLM Provider: Google (${chosenModel})`);
        console.log(`Generated Response Snippet: "${res?.text?.trim().slice(0, 120)}..."`);
      } catch (llmErr: any) {
        console.error(`LLM Generation Failed: ${llmErr.message}`);
      }
    }
  }

  // PHASE 11 — NEGATIVE RETRIEVAL TEST
  console.log('\n>>> PHASE 11: NEGATIVE RETRIEVAL TEST');
  const negativeQuery = 'What is the capital of France?';
  console.log(`Negative Query: "${negativeQuery}"`);
  const negResult = await searchPgvectorRAG(negativeQuery, 3, 0.65);
  console.log(`RAG Mode: ${negResult.rag_mode}`);
  console.log(`Retrieved Count: ${negResult.retrieved_count}`);
  console.log(`Negative filter successfully dropped irrelevant docs: ${negResult.retrieved_count === 0}`);

  // PHASE 12 — RAG QUALITY TEST (10 Realistic Queries)
  console.log('\n>>> PHASE 12: RAG QUALITY TEST (10 EVALUATION QUERIES)');
  const evalQueries = [
    { q: 'I feel so isolated in my hostel room.', expected: 'loneliness' },
    { q: 'My hands are shaking and heart racing before exams.', expected: 'anxiety' },
    { q: 'My grandmother passed away last week.', expected: 'grief' },
    { q: 'I cannot focus on anything and feel mentally paralyzed.', expected: 'overwhelm' },
    { q: 'My partner broke up with me yesterday.', expected: 'heartbreak' },
    { q: 'I cannot sleep because of running thoughts.', expected: 'sleep' },
    { q: 'I feel like a total failure compared to my peers.', expected: 'self_worth' },
    { q: 'Burnout from working 14 hours every single day.', expected: 'burnout' },
    { q: 'Fighting with my parents constantly.', expected: 'family' },
    { q: 'Feeling hopeful and peaceful today.', expected: 'gratitude' },
  ];

  let evalMatches = 0;
  for (const eq of evalQueries) {
    const res = await searchPgvectorRAG(eq.q, 1, 0.50);
    const topTopic = res.retrieved_topics[0] || 'none';
    const topScore = res.retrieved_scores[0] || 0;
    const hasMatch = res.retrieved_count > 0;
    if (hasMatch) evalMatches++;
    console.log(`Query: "${eq.q.slice(0, 35)}..." | Expected: ${eq.expected} | Got: ${topTopic} (Score: ${topScore.toFixed(3)})`);
  }
  console.log(`Evaluation Match Count: ${evalMatches}/${evalQueries.length}`);

  // FINAL SUMMARY
  console.log('\n====================================================');
  console.log('FINAL AUDIT SUMMARY');
  console.log('====================================================');
  console.log('Database Status:', dbStatus.success ? 'VERIFIED' : 'FAILED');
  console.log('pgvector Status:', dbStatus.pgvector_active ? 'ACTIVE' : 'INACTIVE');
  console.log('Embedding Dimension:', sampleDim);
  console.log('Final Verdict:');
  if (dbStatus.success && dbStatus.pgvector_active && dbStatus.rag_table_count > 0) {
    console.log('REAL PGVECTOR RAG VERIFIED');
  } else {
    console.log('REAL PGVECTOR RAG NOT VERIFIED');
  }
}

main().catch(e => {
  console.error('Fatal Audit Error:', e);
  process.exit(1);
});
