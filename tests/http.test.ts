import { beforeEach, describe, expect, it, vi } from 'vitest';

type FakeRequestOptions = { url: string; method?: string; header?: Record<string, string>; data?: unknown; success: (response: { statusCode: number; data: unknown }) => void; fail: (error: unknown) => void };
function setupNetwork(refreshSucceeds: boolean) {
  const storage = new Map<string, string>([['accessToken', 'old-access'], ['refreshToken', 'old-refresh']]);
  let refreshCalls = 0;
  const fakeUni = {
    getStorageSync: (key: string) => storage.get(key),
    setStorageSync: (key: string, value: string) => storage.set(key, value),
    removeStorageSync: (key: string) => storage.delete(key),
    request: (options: FakeRequestOptions) => {
      setTimeout(() => {
        if (options.url.endsWith('/auth/refresh')) {
          refreshCalls += 1;
          options.success(refreshSucceeds ? { statusCode: 200, data: { data: { accessToken: 'fresh-access', refreshToken: 'fresh-refresh' } } } : { statusCode: 401, data: { message: 'expired' } });
          return;
        }
        if (options.header?.Authorization === 'Bearer old-access') options.success({ statusCode: 401, data: { message: 'expired' } });
        else options.success({ statusCode: 200, data: { data: { ok: true } } });
      }, 0);
      return {};
    },
  };
  Object.assign(globalThis, { uni: fakeUni });
  return { storage, get refreshCalls() { return refreshCalls; } };
}

describe('HTTP refresh handling', () => {
  beforeEach(() => { vi.resetModules(); vi.stubEnv('VITE_API_BASE', 'https://api.test'); vi.stubEnv('VITE_USE_MOCK', 'false'); });
  it('shares one refresh request across concurrent 401 responses and retries both calls', async () => {
    const network = setupNetwork(true);
    const { apiRequest } = await import('@/services/http');
    const results = await Promise.all([apiRequest<{ ok: boolean }>('/tasks'), apiRequest<{ ok: boolean }>('/messages')]);
    expect(results).toEqual([{ ok: true }, { ok: true }]);
    expect(network.refreshCalls).toBe(1);
    expect(network.storage.get('accessToken')).toBe('fresh-access');
  });
  it('clears both tokens after refresh fails', async () => {
    const network = setupNetwork(false);
    const { apiRequest } = await import('@/services/http');
    await expect(apiRequest('/tasks')).rejects.toThrow('登录已失效');
    expect(network.storage.has('accessToken')).toBe(false);
    expect(network.storage.has('refreshToken')).toBe(false);
  });
});
