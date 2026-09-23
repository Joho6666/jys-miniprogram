import type { FileMetadata } from '@/types';
import { mockFail, mockOk } from '@/services/request';
import { ApiError, del, downloadFile as httpDownload, get, isMockMode, uploadFile as httpUpload } from '@/services/http';
import { toFileMetadata } from './mappers/file.mapper';

export type UploadedFile = FileMetadata & { previewUrl?: string };
export async function uploadFile(localPath: string, onProgress?: (progress: number) => void): Promise<UploadedFile> {
  if (!isMockMode()) return httpUpload<Record<string, unknown>>('/files', localPath, 'file', {}, onProgress).then((dto) => toFileMetadata(dto as never));
  onProgress?.(100);
  return { id: `mock-file-${Date.now()}`, name: localPath.split(/[\\/]/).pop() ?? '材料', size: 0, mimeType: 'application/octet-stream', extension: localPath.split('.').pop() ?? '', uploadedAt: new Date().toISOString() };
}
export function getFileMetadata(fileId: string): Promise<UploadedFile> {
  if (!isMockMode()) return get<Record<string, unknown>>(`/files/${encodeURIComponent(fileId)}`).then((dto) => toFileMetadata(dto as never));
  return mockFail('演示模式暂不提供文件元数据查询');
}
export async function downloadFile(fileId: string): Promise<string> {
  if (!isMockMode()) {
    try { const result = await httpDownload(`/files/${encodeURIComponent(fileId)}/download`); return result.tempFilePath; }
    catch (e) { const error = e as ApiError; if (error.statusCode === 403) throw new Error('无权限访问该文件'); if (error.statusCode === 404) throw new Error('文件不存在'); throw new Error(error.message || '文件下载失败'); }
  }
  return mockFail('演示模式文件不可下载');
}
export async function deleteFile(fileId: string): Promise<void> {
  if (!isMockMode()) return del<void>(`/files/${encodeURIComponent(fileId)}`);
  if (!fileId) return mockFail('文件不存在');
  return mockOk();
}
