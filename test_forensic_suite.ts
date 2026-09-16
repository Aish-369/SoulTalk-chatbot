import { dbService } from './server/db';
import crypto from 'crypto';

const BASE_URL = 'http://127.0.0.1:3000';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  httpStatus?: number;
  details: string;
}

const results: TestResult[] = [];

function record(suite: string, name: string, passed: boolean, httpStatus?: number, details: string = '') {
  results.push({ suite, name, passed, httpStatus, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] [${suite}] ${name} (Status: ${httpStatus || 'N/A'}) - ${details}`);
}

async function run() {
  console.log('=== STARTING SOULTALK COMPREHENSIVE FORENSIC VERIFICATION SUITE ===\n');

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & JWT FORENSICS
  // -------------------------------------------------------------
  const emailA = `alice_${Date.now()}@soultalk.app`;
  const emailB = `bob_${Date.now()}@soultalk.app`;
  const pw = 'SecurePass123!';

  // 1.1 Valid Register User A
  let userAToken = '';
  let userAId = '';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailA, password: pw, name: 'Alice Walker' })
    });
    const data = await res.json();
    userAToken = data.access_token;
    userAId = data.user?.id;
    record('Auth', 'Valid Registration (User A)', res.status === 200 && Boolean(userAToken), res.status, `ID: ${userAId}`);
  } catch (e: any) {
    record('Auth', 'Valid Registration (User A)', false, 0, e.message);
  }

  // 1.2 Duplicate Registration
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailA, password: pw, name: 'Alice Dup' })
    });
    record('Auth', 'Duplicate Registration Blocked (409)', res.status === 409, res.status, 'Expected 409 Conflict');
  } catch (e: any) {
    record('Auth', 'Duplicate Registration Blocked (409)', false, 0, e.message);
  }

  // 1.3 Invalid Email
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad-email', password: pw, name: 'Alice' })
    });
    record('Auth', 'Invalid Email Rejected (400)', res.status === 400, res.status, 'Expected 400 Bad Request');
  } catch (e: any) {
    record('Auth', 'Invalid Email Rejected (400)', false, 0, e.message);
  }

  // 1.4 Short Password (< 6 chars)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `valid_${Date.now()}@soultalk.app`, password: '123', name: 'Alice' })
    });
    record('Auth', 'Short Password Rejected (400)', res.status === 400, res.status, 'Expected 400 Bad Request');
  } catch (e: any) {
    record('Auth', 'Short Password Rejected (400)', false, 0, e.message);
  }

  // 1.5 Valid Register User B
  let userBToken = '';
  let userBId = '';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailB, password: pw, name: 'Bob Vance' })
    });
    const data = await res.json();
    userBToken = data.access_token;
    userBId = data.user?.id;
    record('Auth', 'Valid Registration (User B)', res.status === 200 && Boolean(userBToken), res.status, `ID: ${userBId}`);
  } catch (e: any) {
    record('Auth', 'Valid Registration (User B)', false, 0, e.message);
  }

  // 1.6 Login with Correct Credentials
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailA, password: pw })
    });
    const data = await res.json();
    record('Auth', 'Login with Correct Password (200)', res.status === 200 && Boolean(data.access_token), res.status, 'Token returned');
  } catch (e: any) {
    record('Auth', 'Login with Correct Password (200)', false, 0, e.message);
  }

  // 1.7 Login with Wrong Password
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailA, password: 'WrongPassword!' })
    });
    record('Auth', 'Login with Wrong Password Rejected (401)', res.status === 401, res.status, 'Expected 401 Unauthorized');
  } catch (e: any) {
    record('Auth', 'Login with Wrong Password Rejected (401)', false, 0, e.message);
  }

  // 1.8 Login with Nonexistent User
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ghost_user@soultalk.app', password: pw })
    });
    record('Auth', 'Login with Nonexistent User Rejected (401)', res.status === 401, res.status, 'Expected 401 Unauthorized');
  } catch (e: any) {
    record('Auth', 'Login with Nonexistent User Rejected (401)', false, 0, e.message);
  }

  // 1.9 JWT Validation Tests
  const resNoJwt = await fetch(`${BASE_URL}/api/auth/me`);
  record('JWT', 'Missing JWT Rejected (401)', resNoJwt.status === 401, resNoJwt.status, 'Expected 401');

  const resBadJwt = await fetch(`${BASE_URL}/api/auth/me`, { headers: { 'Authorization': 'Bearer malformed.jwt' } });
  record('JWT', 'Malformed JWT Rejected (401)', resBadJwt.status === 401, resBadJwt.status, 'Expected 401');

  const parts = userAToken.split('.');
  const tamperedPayload = Buffer.from(JSON.stringify({ userId: userBId, email: emailB, exp: Date.now() + 10000 })).toString('base64url');
  const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
  const resTampered = await fetch(`${BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${tamperedToken}` } });
  record('JWT', 'Tampered Signature Mismatch Rejected (401)', resTampered.status === 401, resTampered.status, 'Expected 401');

  // -------------------------------------------------------------
  // 2. AUTHORIZATION & IDOR ISOLATION FORENSICS
  // -------------------------------------------------------------
  // User A creates chat, mood, memory
  await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userAToken}` },
    body: JSON.stringify({ message: 'User A confidential note: I feel calm today.' })
  });

  await fetch(`${BASE_URL}/api/mood/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userAToken}` },
    body: JSON.stringify({ mood: 'Calm', notes: 'User A private journal reflection' })
  });

  await fetch(`${BASE_URL}/api/companion/memory/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userAToken}` },
    body: JSON.stringify({ title: 'User A Secret Milestone', desc: 'Alice achieved personal goal' })
  });

  // User B queries histories
  const bChatsRes = await fetch(`${BASE_URL}/api/chat/history`, { headers: { 'Authorization': `Bearer ${userBToken}` } });
  const bChats = await bChatsRes.json();
  const chatLeak = Array.isArray(bChats) && bChats.some((c: any) => c.message && c.message.includes('User A'));
  record('Isolation', 'User B Cannot View User A Chats', !chatLeak, bChatsRes.status, `B chat count: ${bChats.length}, Leaked: ${chatLeak}`);

  const bMoodsRes = await fetch(`${BASE_URL}/api/mood/history`, { headers: { 'Authorization': `Bearer ${userBToken}` } });
  const bMoods = await bMoodsRes.json();
  const moodLeak = bMoods.logs && bMoods.logs.some((m: any) => m.notes && m.notes.includes('User A'));
  record('Isolation', 'User B Cannot View User A Moods', !moodLeak, bMoodsRes.status, `B mood count: ${bMoods.logs?.length}, Leaked: ${moodLeak}`);

  const bMemsRes = await fetch(`${BASE_URL}/api/companion/memories`, { headers: { 'Authorization': `Bearer ${userBToken}` } });
  const bMems = await bMemsRes.json();
  const memLeak = bMems.memories && bMems.memories.some((m: any) => m.title && m.title.includes('User A'));
  record('Isolation', 'User B Cannot View User A Memories', !memLeak, bMemsRes.status, `B memory count: ${bMems.memories?.length}, Leaked: ${memLeak}`);

  // -------------------------------------------------------------
  // 3. CRISIS PIPELINE FORENSICS
  // -------------------------------------------------------------
  const crisisChecks = [
    { phrase: 'I want to die', desc: 'English lowercase' },
    { phrase: 'I WANT TO KILL MYSELF', desc: 'English uppercase' },
    { phrase: 'i don\'t want to live anymore', desc: 'English negative phrase' },
    { phrase: 'mala jagaycha nahiye, I want to end it all', desc: 'Roman Marathi' },
    { phrase: 'मला आता जगायचे नाही, आत्महत्या करावीशी वाटते', desc: 'Marathi Devanagari' }
  ];

  for (const c of crisisChecks) {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userBToken}` },
      body: JSON.stringify({ message: c.phrase })
    });
    const data = await res.json();
    const passed = data.is_crisis === true && (data.reply.includes('Tele MANAS') || data.reply.includes('14416') || data.reply.includes('112') || data.reply.includes('pain'));
    record('Crisis Safety', `Crisis Detection: "${c.phrase}" (${c.desc})`, passed, res.status, `is_crisis: ${data.is_crisis}, Helpline: ${passed}`);
  }

  // Crisis false positive check
  const nonCrisis = [
    'I am dying of laughter from this standup show',
    'My phone battery died today',
    'I want to live a long and peaceful life'
  ];
  for (const nc of nonCrisis) {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userBToken}` },
      body: JSON.stringify({ message: nc })
    });
    const data = await res.json();
    const passed = data.is_crisis === false || data.is_crisis === undefined;
    record('Crisis Safety', `False Positive Check: "${nc}"`, passed, res.status, `is_crisis: ${data.is_crisis || false}`);
  }

  // -------------------------------------------------------------
  // 4. RAG RETRIEVAL RUNTIME FORENSICS
  // -------------------------------------------------------------
  const ragQueries = [
    { q: 'mala khup anxiety hotay abhyasacha', lang: 'Roman Marathi' },
    { q: 'I feel so lonely in my apartment', lang: 'English' },
    { q: 'मला खूप ताण येतोय आणि भीती वाटते', lang: 'Devanagari Marathi' },
    { q: 'Overwhelmed with office deadlines and manager pressure', lang: 'Work Stress' }
  ];

  for (const rq of ragQueries) {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/api/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: rq.q })
    });
    const elapsed = Math.round(performance.now() - t0);
    const data = await res.json();
    const passed = data.exemplars && data.exemplars.length > 0;
    record('RAG Retrieval', `Query: "${rq.q}" (${rq.lang})`, passed, res.status, `Exemplars: ${data.exemplars?.length}, Topic: ${data.detectedTopic}, Latency: ${elapsed}ms`);
  }

  // -------------------------------------------------------------
  // 5. INPUT SECURITY & SANITIZATION FORENSICS
  // -------------------------------------------------------------
  const securityInputs = [
    { name: 'SQL Injection in chat', input: "'; DROP TABLE users; --" },
    { name: 'XSS script injection in chat', input: "<script>alert('XSS')</script>" },
    { name: 'Unicode & Emoji burst', input: "🌸✨💖 ॐ नमः शिवाय 🐺🧘‍♂️ Peaceful healing vibes" },
    { name: '1500 char long reflection', input: 'A'.repeat(1500) }
  ];

  for (const s of securityInputs) {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userBToken}` },
      body: JSON.stringify({ message: s.input })
    });
    const data = await res.json();
    record('Input Security', `Input: ${s.name}`, res.status === 200 && Boolean(data.reply), res.status, 'Safely handled without crash');
  }

  // Oversized message rejection (>2000 chars)
  const oversized = 'A'.repeat(2500);
  const resOver = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userBToken}` },
    body: JSON.stringify({ message: oversized })
  });
  record('Input Security', 'Oversized Message (>2000 chars) Rejected (400)', resOver.status === 400, resOver.status, 'Expected 400 Bad Request');

  // -------------------------------------------------------------
  // 6. RATE LIMITING & PER-USER ISOLATION
  // -------------------------------------------------------------
  // User A sends rapid chat messages until threshold (30 limit)
  let userARateLimited = false;
  let userARateLimitStatus = 0;
  for (let i = 1; i <= 35; i++) {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userAToken}` },
      body: JSON.stringify({ message: `Rate limit test burst ${i}` })
    });
    if (res.status === 429) {
      userARateLimited = true;
      userARateLimitStatus = res.status;
      break;
    }
  }
  record('Rate Limiting', 'HTTP 429 Produced on /api/chat (>30 req/min)', userARateLimited, userARateLimitStatus, 'Expected 429 received');

  // Verify User B is NOT blocked by User A reaching rate limit (Per-User isolation)
  const resBUnblocked = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userBToken}` },
    body: JSON.stringify({ message: 'User B independent message test.' })
  });
  record('Rate Limiting', 'Per-User Rate Limit Isolation (User B NOT blocked)', resBUnblocked.status === 200, resBUnblocked.status, 'User B request succeeded with 200');

  console.log('\n=== FINAL SUMMARY OF FORENSIC RUNTIME TESTS ===');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
}

run().catch(console.error);
