import { API_BASE, IS_MOCK, clearTokens, readAccessToken, readRefreshToken, saveTokens } from './request';

export interface ApiEnvelope<T> { data: T; traceId?: string; timestamp?: string; code?: string; message?: string; fieldErrors?: Record<string, string> }
export class ApiError extends Error {
  readonly statusCode: number; readonly code?: string; readonly traceId?: string; readonly fieldErrors?: Record<string, string>;
  constructor(message: string, statusCode = 0, details: Partial<ApiEnvelope<unknown>> = {}) { super(message); this.name = 'ApiError'; this.statusCode = statusCode; this.code = details.code; this.traceId = details.traceId; this.fieldErrors = details.fieldErrors; }
}
let refreshPromise: Promise<boolean> | null = null;
function rawRequest<T>(path: string, options: Omit<UniApp.RequestOptions, 'url'> = {}): Promise<{ statusCode: number; data: ApiEnvelope<T> | T }> {
  const token = readAccessToken();
  return new Promise((resolve, reject) => uni.request({ ...options, url: `${API_BASE}${path}`, header: { ...(options.header ?? {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, success: (res) => resolve(res as unknown as { statusCode: number; data: ApiEnvelope<T> | T }), fail: (err) => reject(new ApiError((err as { errMsg?: string }).errMsg ?? '网络连接失败')) }));
}
async function refreshAccessToken(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const refreshToken = readRefreshToken(); if (!refreshToken) return false;
  refreshPromise = rawRequest<{ accessToken: string; refreshToken?: string }>('/auth/refresh', { method: 'POST', data: { refreshToken }, header: { Authorization: '' } }).then((response) => {
    if (response.statusCode < 200 || response.statusCode >= 300) return false;
    const body = response.data as ApiEnvelope<{ accessToken: string; refreshToken?: string }>;
    const data = (body && typeof body === 'object' && 'data' in body ? body.data : body) as { accessToken?: string; refreshToken?: string };
    if (!data?.accessToken) return false; saveTokens(data.accessToken, data.refreshToken); return true;
  }).catch(() => false).finally(() => { refreshPromise = null; });
  return refreshPromise;
}
function envelopeData<T>(value: ApiEnvelope<T> | T): T { return value && typeof value === 'object' && 'data' in (value as object) ? (value as ApiEnvelope<T>).data : value as T; }
export async function apiRequest<T>(path: string, options: Omit<UniApp.RequestOptions, 'url'> = {}, retry = true): Promise<T> {
  if (IS_MOCK) throw new ApiError('真实接口在 Mock 模式下不可调用');
  let response: { statusCode: number; data: ApiEnvelope<T> | T }; try { response = await rawRequest<T>(path, options); } catch (error) { throw error instanceof ApiError ? error : new ApiError('网络连接失败'); }
  if (response.statusCode === 401 && retry && await refreshAccessToken()) return apiRequest<T>(path, options, false);
  if (response.statusCode === 401) { clearTokens(); throw new ApiError('登录已失效，请重新登录', 401); }
  if (response.statusCode < 200 || response.statusCode >= 300) { const body = response.data as ApiEnvelope<unknown>; throw new ApiError(body?.message ?? '请求失败', response.statusCode, body); }
  return envelopeData(response.data);
}
export const get = <T>(path: string, query?: Record<string, unknown>): Promise<T> => apiRequest<T>(query ? `${path}?${Object.entries(query).filter(([, value]) => value !== undefined && value !== '').map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&')}` : path);
export const post = <T>(path: string, data?: unknown): Promise<T> => apiRequest<T>(path, { method: 'POST', data: data as UniApp.RequestOptions['data'] });
export const put = <T>(path: string, data?: unknown): Promise<T> => apiRequest<T>(path, { method: 'PUT', data: data as UniApp.RequestOptions['data'] });
export const del = <T>(path: string, data?: unknown): Promise<T> => apiRequest<T>(path, { method: 'DELETE', data: data as UniApp.RequestOptions['data'] });
export function uploadFile<T>(path: string, filePath: string, name = 'file', formData: Record<string, string> = {}): Promise<T> {
  if (IS_MOCK) return Promise.reject(new ApiError('真实接口在 Mock 模式下不可调用'));
  return new Promise((resolve, reject) => uni.uploadFile({ url: `${API_BASE}${path}`, filePath, name, formData, header: readAccessToken() ? { Authorization: `Bearer ${readAccessToken()}` } : {}, success: (res) => { try { const body = JSON.parse(res.data) as ApiEnvelope<T>; if (res.statusCode < 200 || res.statusCode >= 300) throw new ApiError(body.message ?? '上传失败', res.statusCode, body); resolve(envelopeData(body)); } catch (error) { reject(error); } }, fail: (error) => reject(new ApiError((error as { errMsg?: string }).errMsg ?? '上传失败')) }));
}
export interface DownloadResult { statusCode: number; tempFilePath: string; }
export function downloadFile(path: string): Promise<DownloadResult> { return new Promise((resolve, reject) => uni.downloadFile({ url: `${API_BASE}${path}`, header: readAccessToken() ? { Authorization: `Bearer ${readAccessToken()}` } : {}, success: (res) => res.statusCode >= 200 && res.statusCode < 300 ? resolve(res as DownloadResult) : reject(new ApiError('下载失败', res.statusCode)), fail: (error) => reject(new ApiError((error as { errMsg?: string }).errMsg ?? '下载失败')) })); }
export function isMockMode(): boolean { return IS_MOCK || import.meta.env.VITE_USE_MOCK === 'true'; }
export function isDemoMode(): boolean { return import.meta.env.VITE_DEMO_MODE === 'true'; }
