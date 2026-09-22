import { API_BASE, IS_MOCK } from './request';

export interface ApiEnvelope<T> { data: T; traceId: string; timestamp: string }

function fail(message: string): Promise<never> { return Promise.reject(new Error(message)); }

export async function apiRequest<T>(path: string, options: Omit<UniApp.RequestOptions, 'url'> = {}): Promise<T> {
  if (IS_MOCK) return fail('真实接口在 Mock 模式下不可调用');
  const token = uni.getStorageSync('accessToken') as string | undefined;
  const response = await uni.request({
    ...options,
    url: `${API_BASE}${path}`,
    header: { Authorization: token ? `Bearer ${token}` : '', ...(options.header ?? {}) },
  }) as unknown as { statusCode: number; data: ApiEnvelope<T> & { message?: string } };
  if (response.statusCode === 401) { uni.removeStorageSync('accessToken'); return fail('登录已失效，请重新登录'); }
  if (response.statusCode < 200 || response.statusCode >= 300) return fail((response.data as any)?.message ?? '请求失败');
  return response.data.data;
}

export function isMockMode(): boolean { return IS_MOCK || import.meta.env.VITE_USE_MOCK === 'true'; }
