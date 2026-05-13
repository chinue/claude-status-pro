// AGENTS: fmt->calc.ts | err->try-catch | no-disk-IO
import * as vscode from 'vscode';
import { ClaudeOAuthCredentials } from './types';

const SECRET_API_KEY = 'claudeStatusPro.apiKey';
const SECRET_OAUTH = 'claudeStatusPro.oauthCredentials';

let outputChannel: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('ClaudeStatusPro');
  }
  return outputChannel;
}

export function log(message: string): void {
  const ts = new Date().toLocaleString('zh-CN', { hour12: false });
  getOutputChannel().appendLine(`[${ts}] ${message}`);
}

export async function readApiKey(secrets: vscode.SecretStorage): Promise<string | undefined> {
  return secrets.get(SECRET_API_KEY) || undefined;
}

export async function writeApiKey(secrets: vscode.SecretStorage, key: string): Promise<void> {
  await secrets.store(SECRET_API_KEY, key);
}

export async function deleteApiKey(secrets: vscode.SecretStorage): Promise<void> {
  await secrets.delete(SECRET_API_KEY);
}

export async function readOAuth(secrets: vscode.SecretStorage): Promise<ClaudeOAuthCredentials | undefined> {
  const raw = await secrets.get(SECRET_OAUTH);
  if (!raw) return undefined;
  try { return JSON.parse(raw); } catch { return undefined; }
}

export async function writeOAuth(secrets: vscode.SecretStorage, creds: ClaudeOAuthCredentials): Promise<void> {
  await secrets.store(SECRET_OAUTH, JSON.stringify(creds));
}

export async function deleteOAuth(secrets: vscode.SecretStorage): Promise<void> {
  await secrets.delete(SECRET_OAUTH);
}

