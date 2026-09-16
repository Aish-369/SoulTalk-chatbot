# SoulTalk Production Database Architecture & Governance Specification

**Database Engine:** Neon Serverless PostgreSQL / Cloud SQL  
**ORM / Data Layer:** SQLAlchemy with Connection Pooling (`QueuePool`)  
**SSL Enforcement:** `sslmode=require` (TLS 1.3 encrypted data-in-transit)  
**High Availability & Failover:** Multi-AZ with automated point-in-time recovery (PITR)  
**Offline / Local Fallback:** Embedded SQLite (for development, tests, and offline-first edge resilience)

---

## 1. Connection Pooling & Resiliency Architecture

```python
# Production connection pooling configuration (backend/database.py)
engine = create_engine(
    DATABASE_URL,
    poolclass=pool.QueuePool,
    pool_size=10,          # Base persistent connection pool
    max_overflow=20,       # Elastic burst capability for high concurrency
    pool_pre_ping=True,    # Liveness check before allocating connection from pool
    pool_recycle=3600,     # Periodic recycling (1 hr) to avoid stale socket timeouts
    echo=False
)
```

### Connection Failure & Retry Policy
1. **Pre-Ping Verification (`pool_pre_ping=True`)**: Emits `SELECT 1` automatically before serving requests. Stale connections are pruned immediately without client impact.
2. **Exponential Backoff**: `test_connection()` and `get_db()` retry failed handshakes up to 3 attempts with exponential delay ($2^t$ seconds) before gracefully degrading.

---

## 2. Relational Schema & Foreign Key Referential Integrity

All relational models are strictly bound to `users.id` with `ondelete="CASCADE"` and indexed on `(user_id, created_at)`.

```sql
-- 1. Users Table (Core Identity)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR,
    language VARCHAR DEFAULT 'en',
    companion_type VARCHAR DEFAULT 'mochi_cat',
    companion_name VARCHAR DEFAULT 'Mochi',
    personality_type VARCHAR DEFAULT 'Calm, Friendly, Comforting',
    created_at BIGINT NOT NULL
);
CREATE INDEX ix_users_email ON users (email);

-- 2. Mood Logs (Chronological Emotional Tracking)
CREATE TABLE mood_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood VARCHAR NOT NULL,
    emotion VARCHAR,
    score INTEGER DEFAULT 50,
    notes TEXT,
    created_at BIGINT NOT NULL
);
CREATE INDEX idx_mood_user_created ON mood_logs (user_id, created_at);

-- 3. Chat Messages (Private Sanctuary Dialogue)
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR NOT NULL, -- 'user' | 'companion'
    message TEXT NOT NULL,
    emotion VARCHAR,
    created_at BIGINT NOT NULL
);
CREATE INDEX idx_chat_user_created ON chat_messages (user_id, created_at);

-- 4. Voice Conversations (Audio Transcripts & Reflections)
CREATE TABLE voice_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transcript TEXT NOT NULL,
    emotion VARCHAR,
    confidence FLOAT,
    duration INTEGER DEFAULT 0,
    created_at BIGINT NOT NULL
);
CREATE INDEX idx_voice_user_created ON voice_conversations (user_id, created_at);

-- 5. Companion Memories (Semantic Long-Term Memory System)
CREATE TABLE companion_memories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    memory_title VARCHAR DEFAULT 'Companion Memory',
    memory_description TEXT,
    memory_type VARCHAR DEFAULT 'conversation',
    content TEXT,
    emotion VARCHAR DEFAULT 'neutral',
    importance_score FLOAT DEFAULT 0.5,
    context TEXT,
    icon VARCHAR DEFAULT 'Sparkles',
    category VARCHAR DEFAULT 'General',
    created_at BIGINT NOT NULL
);
CREATE INDEX idx_memory_user_created ON companion_memories (user_id, created_at);

-- 6. Companion Progress & Gamification
CREATE TABLE companion_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    stage VARCHAR DEFAULT 'Baby Companion',
    updated_at BIGINT NOT NULL
);

-- 7. User Preferences & Personalization
CREATE TABLE user_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR DEFAULT 'light',
    notifications_enabled INTEGER DEFAULT 1,
    ai_memory_enabled INTEGER DEFAULT 1,
    voice_enabled INTEGER DEFAULT 1,
    ai_tone VARCHAR DEFAULT 'Gentle Friend',
    language VARCHAR DEFAULT 'en',
    mood_reminders INTEGER DEFAULT 1,
    journal_reminders INTEGER DEFAULT 1,
    breathing_reminders INTEGER DEFAULT 1,
    voice_reminders INTEGER DEFAULT 0,
    emotion_sensitivity VARCHAR DEFAULT 'Medium',
    response_style VARCHAR DEFAULT 'Balanced',
    voice_speed FLOAT DEFAULT 1.0,
    voice_tone VARCHAR DEFAULT 'Soft',
    biometric_enabled INTEGER DEFAULT 0,
    offline_data_enabled INTEGER DEFAULT 1,
    privacy_level VARCHAR DEFAULT 'Standard',
    updated_at BIGINT NOT NULL
);
```

---

## 3. Strict User Data Isolation & Security

1. **Multi-Tenant Partitioning**: Every single read, write, and deletion query is filtered by the authenticated user's `user_id` extracted from cryptographically verified JWT tokens.
2. **User A cannot access User B's records**: Any request attempting to fetch or mutate records outside the token's `user_id` context yields an immediate HTTP 403 / 404 response.
3. **GDPR / CCPA Erasure Guarantee**: When `DELETE /api/profile/delete` or `DELETE /data/delete` is invoked, the database executes a single transactional cascade:
   $$\text{DELETE FROM users WHERE id = :user\_id;}$$
   All child rows in `mood_logs`, `chat_messages`, `companion_memories`, `voice_conversations`, and `user_preferences` are atomically and permanently erased.

---

## 4. Backup & Disaster Recovery Strategy

| Strategy Element | Implementation Details |
| :--- | :--- |
| **Continuous WAL Archiving** | Write-Ahead Logs (WAL) streamed continuously to immutable cloud storage. |
| **Point-in-Time Recovery (PITR)** | Granular rollbacks down to any second within a 7-day retention window. |
| **Automated Daily Snapshots** | Full database snapshot taken every 24 hours at 03:00 UTC with 30-day retention. |
| **Recovery Time Objective (RTO)** | $< 15\text{ minutes}$ in case of regional database failure. |
| **Recovery Point Objective (RPO)** | $< 1\text{ minute}$ of transactional data. |

---

## 5. Live Diagnostics Endpoint

Health and schema validation are continuously monitored at:
- `GET /api/db/health`
- `GET /api/health`
