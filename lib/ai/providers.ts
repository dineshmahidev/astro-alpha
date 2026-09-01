/**
 * Free AI providers with automatic failover.
 * Groq is primary (fetched from Supabase secrets), LLM7 is fallback.
 */

import { supabase } from '../supabase';

export interface AIProvider {
  id: string;
  name: string;
  baseURL: string;
  model: string;
  headers?: Record<string, string>;
}

// LLM7 fallback providers (no key needed)
const LLM7_PROVIDERS: AIProvider[] = [
  {
    id: 'llm7',
    name: 'LLM7.io (Turbo)',
    baseURL: 'https://api.llm7.io/v1',
    model: 'turbo',
  },
  {
    id: 'llm7-llama',
    name: 'LLM7.io (Llama)',
    baseURL: 'https://api.llm7.io/v1',
    model: 'meta-Llama-3.1-8B-Instruct-Turbo',
  },
];

// Cached Groq provider (fetched once from Supabase)
let _groqProvider: AIProvider | null = null;
let _groqKey: string | null = null;

async function getGroqProvider(): Promise<AIProvider | null> {
  if (_groqProvider && _groqKey) return _groqProvider;

  try {
    const { data } = await supabase
      .from('secrets')
      .select('value')
      .eq('key', 'groq_api_key')
      .single();

    if (data?.value) {
      _groqKey = data.value;
      _groqProvider = {
        id: 'groq',
        name: 'Groq (Llama 3)',
        baseURL: 'https://api.groq.com/openai/v1',
        model: 'llama3-8b-8192',
        headers: { Authorization: `Bearer ${_groqKey}` },
      };
      return _groqProvider;
    }
  } catch {
    // Supabase not configured yet
  }
  return null;
}

export async function getProviders(): Promise<AIProvider[]> {
  const groq = await getGroqProvider();
  return groq ? [groq, ...LLM7_PROVIDERS] : LLM7_PROVIDERS;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  id?: string;
  timestamp?: number;
  domain?: string;
  referencedAnalysisId?: string;
}

export function deduplicateMessages(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= 1) return messages;

  const result: ChatMessage[] = [messages[0]];

  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const curr = messages[i];

    if (prev.role === curr.role) {
      const prevStart = prev.content.slice(0, 50);
      const currStart = curr.content.slice(0, 50);

      if (prevStart === currStart) {
        continue;
      }
    }

    result.push(curr);
  }

  return result;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

/**
 * Try to get a response from a single provider.
 */
async function tryProvider(
  provider: AIProvider,
  messages: ChatMessage[],
  timeoutMs = 15000,
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...provider.headers,
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        max_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) return null;

    const data: ChatCompletionResponse = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch {
    return null;
  }
}

/**
 * Call AI with automatic failover across providers.
 * Tries Groq first (if key available), then LLM7 fallback.
 */
export async function callAIWithFallback(
  messages: ChatMessage[],
  providerList?: AIProvider[],
): Promise<{ content: string; provider: string } | null> {
  const providers = providerList || (await getProviders());
  for (const provider of providers) {
    const content = await tryProvider(provider, messages);
    if (content) {
      return { content, provider: provider.id };
    }
  }
  return null;
}
