import http from 'http';
import https from 'https';

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaStatus {
  available: boolean;
  url: string;
  models: string[];
  activeModel: string;
}

const DEFAULT_OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || process.env.LLM_MODEL || 'qwen2.5';

let cachedStatus: { status: OllamaStatus; lastChecked: number } | null = null;
const CACHE_TTL_MS = 10000; // 10s status cache to prevent repeated socket pings

/**
 * Fast health check for local Ollama instance (1000ms timeout)
 */
export async function checkOllamaAvailability(customUrl?: string): Promise<OllamaStatus> {
  const now = Date.now();
  if (cachedStatus && (now - cachedStatus.lastChecked < CACHE_TTL_MS)) {
    return cachedStatus.status;
  }

  const baseUrl = (customUrl || DEFAULT_OLLAMA_URL).replace(/\/$/, '');
  const result: OllamaStatus = {
    available: false,
    url: baseUrl,
    models: [],
    activeModel: DEFAULT_MODEL
  };

  try {
    const parsed = new URL(`${baseUrl}/api/tags`);
    const isHttps = parsed.protocol === 'https:';
    const client = isHttps ? https : http;

    const data = await new Promise<string>((resolve, reject) => {
      const req = client.get(parsed.toString(), { timeout: 1200 }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Status ${res.statusCode}`));
        }
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Ollama ping timeout'));
      });
    });

    const parsedJson = JSON.parse(data);
    const modelsList: string[] = (parsedJson.models || []).map((m: any) => m.name || m.model);
    result.available = true;
    result.models = modelsList;

    // Pick best available matching model or configured model
    if (modelsList.length > 0) {
      const matched = modelsList.find(m => 
        m.toLowerCase().includes('qwen') || 
        m.toLowerCase().includes('llama') ||
        m.toLowerCase().includes('mistral')
      );
      result.activeModel = matched || modelsList[0];
    }

    cachedStatus = { status: result, lastChecked: now };
    return result;
  } catch (err) {
    result.available = false;
    cachedStatus = { status: result, lastChecked: now };
    return result;
  }
}

/**
 * Query local Ollama /api/chat with streaming or single completion
 */
export async function queryOllamaChat(params: {
  systemPrompt: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userMessage: string;
  model?: string;
  timeoutMs?: number;
  ollamaUrl?: string;
}): Promise<string | null> {
  const baseUrl = (params.ollamaUrl || DEFAULT_OLLAMA_URL).replace(/\/$/, '');
  const modelToUse = params.model || cachedStatus?.status.activeModel || DEFAULT_MODEL;
  const timeout = params.timeoutMs || 10000;

  const messages: OllamaMessage[] = [
    { role: 'system', content: params.systemPrompt }
  ];

  if (params.history && params.history.length > 0) {
    params.history.slice(-6).forEach(h => {
      messages.push({
        role: h.role,
        content: h.content
      });
    });
  }

  messages.push({
    role: 'user',
    content: params.userMessage
  });

  const payload = JSON.stringify({
    model: modelToUse,
    messages,
    stream: false,
    options: {
      temperature: 0.7,
      top_p: 0.9,
      num_predict: 250
    }
  });

  try {
    const parsed = new URL(`${baseUrl}/api/chat`);
    const isHttps = parsed.protocol === 'https:';
    const client = isHttps ? https : http;

    const responseText = await new Promise<string>((resolve, reject) => {
      const req = client.request(
        parsed.toString(),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          },
          timeout
        },
        (res) => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(body);
            } else {
              reject(new Error(`Ollama returned status ${res.statusCode}: ${body}`));
            }
          });
        }
      );

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Ollama request timed out after ${timeout}ms`));
      });

      req.write(payload);
      req.end();
    });

    const parsedJson = JSON.parse(responseText);
    const botReply = parsedJson.message?.content || parsedJson.response || '';
    return botReply ? botReply.trim() : null;
  } catch (err: any) {
    console.warn(`[Ollama Offline Client] Notice querying local model (${modelToUse}):`, err?.message || err);
    return null;
  }
}
