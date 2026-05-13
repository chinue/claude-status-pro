import { expect } from 'chai';
import * as sinon from 'sinon';
import * as nodeFetch from 'node-fetch';
import { ApiService } from '../src/services/apiService';

describe('ApiService', () => {
  let api: ApiService;

  beforeEach(() => {
    api = ApiService.getInstance();
  });

  afterEach(() => {
    sinon.restore();
    (ApiService as any).instance = undefined;
  });

  it('parses Claude rate limit headers correctly', async () => {
    const reset7d = '1715568000';
    const reset5h = '1715582400';
    const resp = new nodeFetch.Response(JSON.stringify({ content: [{ text: '' }] }), {
      status: 200,
      headers: {
        'anthropic-ratelimit-unified-7d-utilization': '0.25',
        'anthropic-ratelimit-unified-5h-utilization': '0.50',
        'anthropic-ratelimit-unified-7d-reset': reset7d,
        'anthropic-ratelimit-unified-5h-reset': reset5h,
      },
    });
    sinon.stub(nodeFetch, 'default').resolves(resp);

    const result = await api.fetchQuota('sk-test');
    expect(result.ok).to.be.true;
    expect(result.data).to.not.be.undefined;
    expect(result.data!.weeklyUsedPct).to.equal(25);
    expect(result.data!.windowUsedPct).to.equal(50);
    expect(result.data!.weeklyResetAt).to.equal(parseFloat(reset7d) * 1000);
    expect(result.data!.windowResetAt).to.equal(parseFloat(reset5h) * 1000);
    expect(result.data!.weeklyLimit).to.equal(0);
    expect(result.data!.windowLimit).to.equal(0);
    expect(result.data!.parallelLimit).to.equal(0);
  });

  it('handles 403 quota exhausted', async () => {
    const resp = new nodeFetch.Response('', { status: 403 });
    sinon.stub(nodeFetch, 'default').resolves(resp);

    const result = await api.fetchQuota('sk-test');
    expect(result.ok).to.be.false;
    expect(result.authFailed).to.be.true;
    expect(result.error).to.equal('Rate limit quota exhausted');
  });

  it('returns authFailed on 401', async () => {
    const resp = new nodeFetch.Response('', { status: 401 });
    sinon.stub(nodeFetch, 'default').resolves(resp);

    const result = await api.fetchQuota('bad-token');
    expect(result.ok).to.be.false;
    expect(result.authFailed).to.be.true;
    expect(result.error).to.equal('HTTP 401');
  });

  it('returns networkError on timeout', async () => {
    sinon.stub(nodeFetch, 'default').rejects(new Error('ETIMEDOUT'));

    const result = await api.fetchQuota('sk-test');
    expect(result.ok).to.be.false;
    expect(result.networkError).to.be.true;
  });
});
