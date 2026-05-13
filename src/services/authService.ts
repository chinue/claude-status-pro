// Provider boundary: token resolution is Claude-specific.
// AGENTS: err->try-catch | secret-safe
// DESIGN: v2-phase2-implementation.md#servicesauthservicets

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { log } from '../utils';

const CLAUDE_CREDENTIALS_PATH = path.join(os.homedir(), '.claude', '.credentials.json');
const REFRESH_THRESHOLD_SECONDS = 300;
const SECRET_API_KEY = 'claudeStatusPro.apiKey';

export type ClaudeProvider = 'claude-ai' | 'aws-bedrock' | 'api-key' | 'unknown';

interface ClaudeCredentialsFile {
  claudeAiOauth?: {
    accessToken: string;
    expiresAt: number;
  };
}

function normalizeExpiresAt(expiresAt: number): number {
  // If > 1_000_000_000_000 treat as ms, else seconds. Return seconds.
  return expiresAt > 1_000_000_000_000 ? Math.floor(expiresAt / 1000) : Math.floor(expiresAt);
}

export function detectProvider(customCredPath?: string): ClaudeProvider {
  try {
    const credPath = customCredPath || CLAUDE_CREDENTIALS_PATH;
    if (fs.existsSync(credPath)) {
      const raw = fs.readFileSync(credPath, 'utf-8');
      const parsed = JSON.parse(raw) as ClaudeCredentialsFile;
      if (parsed.claudeAiOauth?.accessToken) {
        return 'claude-ai';
      }
    }
  } catch {
    // ignore
  }

  if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return 'aws-bedrock';
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return 'api-key';
  }

  return 'unknown';
}

export function readCredentials(customPath?: string): string {
  const credPath = customPath || CLAUDE_CREDENTIALS_PATH;
  let raw: string;
  try {
    raw = fs.readFileSync(credPath, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to read Claude credentials file: ${(err as Error).message}`);
  }

  let parsed: ClaudeCredentialsFile;
  try {
    parsed = JSON.parse(raw) as ClaudeCredentialsFile;
  } catch (err) {
    throw new Error(`Invalid JSON in Claude credentials file: ${(err as Error).message}`);
  }

  const oauth = parsed.claudeAiOauth;
  if (!oauth?.accessToken) {
    throw new Error('No accessToken found in Claude credentials file');
  }

  const expiresAtSec = normalizeExpiresAt(oauth.expiresAt);
  const nowSec = Math.floor(Date.now() / 1000);

  if (expiresAtSec > 0 && nowSec >= expiresAtSec) {
    throw new Error('Claude credentials have expired');
  }

  return oauth.accessToken;
}

export class AuthService {
  private static instance: AuthService;
  private secrets: vscode.SecretStorage | undefined;
  private cachedToken: string | null = null;
  private cachedAt = 0;
  private customCredPath: string | undefined;

  static getInstance(): AuthService {
    if (!AuthService.instance) { AuthService.instance = new AuthService(); }
    return AuthService.instance;
  }

  init(secrets: vscode.SecretStorage): void {
    this.secrets = secrets;
  }

  /** Override the default credentials file path (useful for testing). */
  setCredentialsPath(path: string | undefined): void {
    this.customCredPath = path;
  }

  /** Resolve token with 60s memory cache to avoid frequent SecretStorage reads. */
  async resolveToken(): Promise<string | undefined> {
    if (!this.secrets) return undefined;
    if (this.cachedToken && Date.now() - this.cachedAt < 60_000) {
      return this.cachedToken;
    }

    // Priority 1: Claude cred file
    try {
      const token = readCredentials(this.customCredPath);
      this.cachedToken = token;
      this.cachedAt = Date.now();
      return token;
    } catch {
      // cred file missing or expired, continue to fallbacks
    }

    // Priority 2: VS Code SecretStorage API Key
    try {
      const apiKey = await this.secrets.get(SECRET_API_KEY);
      if (apiKey) {
        this.cachedToken = apiKey;
        this.cachedAt = Date.now();
        return apiKey;
      }
    } catch (err) {
      log(`Failed to read API key from SecretStorage: ${(err as Error).message}`);
    }

    // Priority 3: env ANTHROPIC_API_KEY
    if (process.env.ANTHROPIC_API_KEY) {
      this.cachedToken = process.env.ANTHROPIC_API_KEY;
      this.cachedAt = Date.now();
      return process.env.ANTHROPIC_API_KEY;
    }

    return undefined;
  }

  /** Prompt user to run `claude login` externally. */
  async startOAuthFlow(): Promise<boolean> {
    const selection = await vscode.window.showInformationMessage(
      'Please run `claude login` in your terminal to authenticate, then return to VS Code.',
      'Open Terminal',
      'Done'
    );

    if (selection === 'Open Terminal') {
      await vscode.commands.executeCommand('workbench.action.terminal.new');
    }

    // Always return true to indicate the flow was initiated (user must complete externally)
    return true;
  }

  invalidate(): void {
    this.cachedToken = null;
    this.cachedAt = 0;
  }
}
