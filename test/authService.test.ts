import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AuthService } from '../src/services/authService';
import { makeContext } from './mocks/vscode';

describe('AuthService', () => {
  let tempDir: string;

  beforeEach(() => {
    (AuthService as any).instance = undefined;
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'auth-test-'));
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  });

  it('returns undefined when no credentials stored', async () => {
    const auth = AuthService.getInstance();
    auth.setCredentialsPath(path.join(tempDir, 'nonexistent.json'));
    const ctx = makeContext();
    auth.init(ctx.secrets);
    const token = await auth.resolveToken();
    expect(token).to.be.undefined;
  });

  it('returns token from Claude credentials file', async () => {
    const credPath = path.join(tempDir, '.claude', '.credentials.json');
    fs.mkdirSync(path.dirname(credPath), { recursive: true });
    fs.writeFileSync(credPath, JSON.stringify({
      claudeAiOauth: { accessToken: 'sk-from-file', expiresAt: Math.floor(Date.now() / 1000) + 3600 },
    }));
    const auth = AuthService.getInstance();
    auth.setCredentialsPath(credPath);
    const ctx = makeContext();
    auth.init(ctx.secrets);
    const token = await auth.resolveToken();
    expect(token).to.equal('sk-from-file');
  });

  it('returns API key when stored in SecretStorage', async () => {
    const auth = AuthService.getInstance();
    auth.setCredentialsPath(path.join(tempDir, 'nonexistent.json'));
    const ctx = makeContext();
    auth.init(ctx.secrets);
    await ctx.secrets.store('claudeStatusPro.apiKey', 'sk-test123');
    const token = await auth.resolveToken();
    expect(token).to.equal('sk-test123');
  });

  it('caches token for 60s', async () => {
    const auth = AuthService.getInstance();
    auth.setCredentialsPath(path.join(tempDir, 'nonexistent.json'));
    const ctx = makeContext();
    auth.init(ctx.secrets);
    await ctx.secrets.store('claudeStatusPro.apiKey', 'sk-test');
    const t1 = await auth.resolveToken();
    await ctx.secrets.store('claudeStatusPro.apiKey', 'sk-changed');
    const t2 = await auth.resolveToken();
    expect(t1).to.equal('sk-test');
    expect(t2).to.equal('sk-test');
  });

  it('invalidate clears cache', async () => {
    const auth = AuthService.getInstance();
    auth.setCredentialsPath(path.join(tempDir, 'nonexistent.json'));
    const ctx = makeContext();
    auth.init(ctx.secrets);
    await ctx.secrets.store('claudeStatusPro.apiKey', 'sk-test');
    await auth.resolveToken();
    auth.invalidate();
    await ctx.secrets.store('claudeStatusPro.apiKey', 'sk-new');
    const token = await auth.resolveToken();
    expect(token).to.equal('sk-new');
  });
});
