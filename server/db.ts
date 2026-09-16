import { getPostgresPool } from './neonVectorRag';

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  password_salt: string;
  companion_name: string;
  companion_type: string;
  personality_type: string;
  language: string;
  is_guest: boolean;
  created_at: number;
  updated_at: number;
}

export interface DbChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'companion';
  message: string;
  emotion: string;
  confidence: number;
  created_at: number;
}

export interface DbMoodLog {
  id: string;
  user_id: string;
  mood: string;
  score: number;
  emotion: string;
  notes: string;
  created_at: number;
}

export interface DbCompanionMemory {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  created_at: number;
}

export interface DbVoiceReflection {
  id: string;
  user_id: string;
  transcript: string;
  emotion: string;
  reflection: string;
  themes_json: string;
  action_text: string;
  created_at: number;
}

function mapUser(row: any): DbUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    password_salt: row.password_salt,
    companion_name: row.companion_name || 'Wolfie',
    companion_type: row.companion_type || 'wolfie_guardian',
    personality_type: row.personality_type || 'Gentle Friend',
    language: row.language || 'en',
    is_guest: Boolean(row.is_guest),
    created_at: Number(row.created_at),
    updated_at: Number(row.updated_at)
  };
}

function mapChatMessage(row: any): DbChatMessage {
  return {
    id: row.id,
    user_id: row.user_id,
    role: row.role as 'user' | 'companion',
    message: row.message,
    emotion: row.emotion || 'SUPPORTIVE',
    confidence: typeof row.confidence === 'number' ? row.confidence : parseFloat(row.confidence || '1.0'),
    created_at: Number(row.created_at)
  };
}

function mapMoodLog(row: any): DbMoodLog {
  return {
    id: row.id,
    user_id: row.user_id,
    mood: row.mood,
    score: Number(row.score),
    emotion: row.emotion,
    notes: row.notes || '',
    created_at: Number(row.created_at)
  };
}

function mapCompanionMemory(row: any): DbCompanionMemory {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category || 'milestone',
    icon: row.icon || '🌱',
    created_at: Number(row.created_at)
  };
}

function mapVoiceReflection(row: any): DbVoiceReflection {
  return {
    id: row.id,
    user_id: row.user_id,
    transcript: row.transcript,
    emotion: row.emotion,
    reflection: row.reflection,
    themes_json: typeof row.themes_json === 'string' ? row.themes_json : JSON.stringify(row.themes_json || []),
    action_text: row.action_text || '',
    created_at: Number(row.created_at)
  };
}

class NeonDatabaseService {
  private getPool() {
    const pool = getPostgresPool();
    if (!pool) {
      throw new Error('FAIL LOUDLY: Neon PostgreSQL connection pool is not available. Local SQLite fallback is strictly prohibited.');
    }
    return pool;
  }

  // --- USER METHODS ---
  public async createUser(user: {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    password_salt: string;
    companion_name?: string;
    companion_type?: string;
    personality_type?: string;
    language?: string;
    is_guest?: boolean;
  }): Promise<DbUser> {
    const pool = this.getPool();
    const now = Date.now();
    const sql = `
      INSERT INTO users (
        id, name, email, password_hash, password_salt,
        companion_name, companion_type, personality_type, language,
        is_guest, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;

    const res = await pool.query(sql, [
      user.id,
      user.name,
      user.email.toLowerCase().trim(),
      user.password_hash,
      user.password_salt,
      user.companion_name || 'Wolfie',
      user.companion_type || 'wolfie_guardian',
      user.personality_type || 'Gentle Friend',
      user.language || 'en',
      Boolean(user.is_guest),
      BigInt(now),
      BigInt(now)
    ]);

    return mapUser(res.rows[0]);
  }

  public async getUserByEmail(email: string): Promise<DbUser | null> {
    const pool = this.getPool();
    const sql = `SELECT * FROM users WHERE email = $1 LIMIT 1;`;
    const res = await pool.query(sql, [email.toLowerCase().trim()]);
    if (res.rows.length === 0) return null;
    return mapUser(res.rows[0]);
  }

  public async getUserById(id: string): Promise<DbUser | null> {
    const pool = this.getPool();
    const sql = `SELECT * FROM users WHERE id = $1 LIMIT 1;`;
    const res = await pool.query(sql, [id]);
    if (res.rows.length === 0) return null;
    return mapUser(res.rows[0]);
  }

  public async updateUserProfile(
    userId: string,
    updates: {
      name?: string;
      companion_name?: string;
      companion_type?: string;
      personality_type?: string;
      language?: string;
    }
  ): Promise<DbUser | null> {
    const pool = this.getPool();
    const existing = await this.getUserById(userId);
    if (!existing) return null;

    const name = updates.name !== undefined ? updates.name : existing.name;
    const companion_name = updates.companion_name !== undefined ? updates.companion_name : existing.companion_name;
    const companion_type = updates.companion_type !== undefined ? updates.companion_type : existing.companion_type;
    const personality_type = updates.personality_type !== undefined ? updates.personality_type : existing.personality_type;
    const language = updates.language !== undefined ? updates.language : existing.language;
    const now = Date.now();

    const sql = `
      UPDATE users SET
        name = $1,
        companion_name = $2,
        companion_type = $3,
        personality_type = $4,
        language = $5,
        updated_at = $6
      WHERE id = $7
      RETURNING *;
    `;

    const res = await pool.query(sql, [name, companion_name, companion_type, personality_type, language, BigInt(now), userId]);
    if (res.rows.length === 0) return null;
    return mapUser(res.rows[0]);
  }

  // --- CHAT METHODS (USER-SCOPED) ---
  public async getChatHistory(userId: string, limit: number = 50): Promise<DbChatMessage[]> {
    const pool = this.getPool();
    const sql = `
      SELECT * FROM chat_messages
      WHERE user_id = $1
      ORDER BY created_at ASC
      LIMIT $2;
    `;
    const res = await pool.query(sql, [userId, limit]);
    return res.rows.map(mapChatMessage);
  }

  public async addChatMessage(
    userId: string,
    role: 'user' | 'companion',
    message: string,
    emotion: string = 'SUPPORTIVE',
    confidence: number = 1.0
  ): Promise<DbChatMessage> {
    const pool = this.getPool();
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();
    const sql = `
      INSERT INTO chat_messages (id, user_id, role, message, emotion, confidence, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const res = await pool.query(sql, [id, userId, role, message, emotion, confidence, BigInt(now)]);
    return mapChatMessage(res.rows[0]);
  }

  // --- MOOD METHODS (USER-SCOPED) ---
  public async getMoodLogs(userId: string, limit: number = 50): Promise<DbMoodLog[]> {
    const pool = this.getPool();
    const sql = `
      SELECT * FROM mood_logs
      WHERE user_id = $1
      ORDER BY created_at ASC
      LIMIT $2;
    `;
    const res = await pool.query(sql, [userId, limit]);
    return res.rows.map(mapMoodLog);
  }

  public async addMoodLog(
    userId: string,
    mood: string,
    score: number,
    emotion: string,
    notes: string = ''
  ): Promise<DbMoodLog> {
    const pool = this.getPool();
    const id = `mood_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();
    const sql = `
      INSERT INTO mood_logs (id, user_id, mood, score, emotion, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const res = await pool.query(sql, [id, userId, mood, score, emotion, notes, BigInt(now)]);
    return mapMoodLog(res.rows[0]);
  }

  // --- MEMORY METHODS (USER-SCOPED) ---
  public async getMemories(userId: string): Promise<DbCompanionMemory[]> {
    const pool = this.getPool();
    const sql = `
      SELECT * FROM companion_memories
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    const res = await pool.query(sql, [userId]);
    return res.rows.map(mapCompanionMemory);
  }

  public async addMemory(
    userId: string,
    title: string,
    description: string,
    category: string = 'milestone',
    icon: string = '🌱'
  ): Promise<DbCompanionMemory> {
    const pool = this.getPool();
    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();
    const sql = `
      INSERT INTO companion_memories (id, user_id, title, description, category, icon, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const res = await pool.query(sql, [id, userId, title, description, category, icon, BigInt(now)]);
    return mapCompanionMemory(res.rows[0]);
  }

  public async resetMemories(userId: string): Promise<void> {
    const pool = this.getPool();
    const sql = `DELETE FROM companion_memories WHERE user_id = $1;`;
    await pool.query(sql, [userId]);
  }

  // --- VOICE REFLECTIONS (USER-SCOPED) ---
  public async addVoiceReflection(
    userId: string,
    transcript: string,
    emotion: string,
    reflection: string,
    themes: string[],
    action: string
  ): Promise<DbVoiceReflection> {
    const pool = this.getPool();
    const id = `vref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();
    const themesJson = JSON.stringify(themes || []);
    const sql = `
      INSERT INTO voice_reflections (id, user_id, transcript, emotion, reflection, themes_json, action_text, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const res = await pool.query(sql, [id, userId, transcript, emotion, reflection, themesJson, action, BigInt(now)]);
    return mapVoiceReflection(res.rows[0]);
  }

  public async getVoiceReflections(userId: string, limit: number = 20): Promise<DbVoiceReflection[]> {
    const pool = this.getPool();
    const sql = `
      SELECT * FROM voice_reflections
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2;
    `;
    const res = await pool.query(sql, [userId, limit]);
    return res.rows.map(mapVoiceReflection);
  }

  // --- DATA DELETION (GDPR / RIGHT TO BE FORGOTTEN) ---
  public async deleteUserData(userId: string): Promise<void> {
    const pool = this.getPool();
    // Delete user cascades to chat_messages, mood_logs, companion_memories, voice_reflections
    const sql = `DELETE FROM users WHERE id = $1;`;
    await pool.query(sql, [userId]);
  }

  // --- STATS ---
  public async getStats(): Promise<{ totalUsers: number; totalChats: number; totalMoods: number; totalMemories: number }> {
    const pool = this.getPool();
    const [u, c, m, mem] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users;`),
      pool.query(`SELECT COUNT(*) FROM chat_messages;`),
      pool.query(`SELECT COUNT(*) FROM mood_logs;`),
      pool.query(`SELECT COUNT(*) FROM companion_memories;`)
    ]);
    return {
      totalUsers: parseInt(u.rows[0].count, 10),
      totalChats: parseInt(c.rows[0].count, 10),
      totalMoods: parseInt(m.rows[0].count, 10),
      totalMemories: parseInt(mem.rows[0].count, 10)
    };
  }
}

export const dbService = new NeonDatabaseService();
