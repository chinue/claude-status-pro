// 🔀 Provider boundary: API format is Claude-specific.
// AGENTS: err->try-catch | network-fallback
// If adapting to another provider, replace this module.

// DESIGN: v2-provider-abstraction.md
import fetch from 'node-fetch';
import { QuotaData, ApiResponse } from '../types';

const API_URL = 'https://api.anthropic.com/v1/messages';

export class ApiService {
  private static instance: ApiService;

  static getInstance(): ApiService {
    if (!ApiService.instance) { ApiService.instance = new ApiService(); }
    return ApiService.instance;
  }

  async fetchQuota(token: string): Promise<ApiResponse> {
    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'oauth-2025-04-20',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: '.' }],
        }),
      });

      if (resp.status === 403) {
        return { ok: false, error: 'Rate limit quota exhausted', authFailed: true };
      }
      if (resp.status === 401) {
        return { ok: false, error: `HTTP ${resp.status}`, authFailed: true };
      }
      if (!resp.ok) {
        return { ok: false, error: `HTTP ${resp.status}` };
      }

      const data = this.parseHeaders(resp.headers);
      return { ok: true, data };
    } catch (err) {
      const msg = (err as Error).message;
      const isNetwork = /fetch|network|ECONN|ENOTFOUND|ETIMEDOUT/i.test(msg);
      return { ok: false, error: msg, networkError: isNetwork };
    }
  }

  private parseHeaders(headers: any): QuotaData {
    const h = (key: string): string | undefined => {
      const raw = headers.get?.(key);
      if (typeof raw === 'string') { return raw; }
      return undefined;
    };

    const weeklyUsedPct = parsePct(h('anthropic-ratelimit-unified-7d-utilization'));
    const windowUsedPct = parsePct(h('anthropic-ratelimit-unified-5h-utilization'));
    const weeklyResetAt = parseReset(h('anthropic-ratelimit-unified-7d-reset'));
    const windowResetAt = parseReset(h('anthropic-ratelimit-unified-5h-reset'));

    // Claude headers do not provide absolute usage numbers
    return {
      weeklyLimit: 0,
      weeklyUsed: 0,
      weeklyUsedPct,
      weeklyResetAt,
      windowLimit: 0,
      windowUsed: 0,
      windowRemaining: 0,
      windowUsedPct,
      windowResetAt,
      parallelLimit: 0,
    };
  }
}

function parsePct(v: string | undefined): number {
  if (v === undefined) { return 0; }
  const n = parseFloat(v);
  if (isNaN(n)) { return 0; }
  return Math.min(100, Math.max(0, n * 100));
}

function parseReset(v: string | undefined): number {
  if (v === undefined) { return 0; }
  const n = parseFloat(v);
  if (isNaN(n)) { return 0; }
  return n * 1000;
}
