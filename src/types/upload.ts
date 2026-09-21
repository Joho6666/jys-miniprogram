import type { FileFormat } from './common';

/** 上传状态机 */
export type UploadState = 'PENDING' | 'UPLOADING' | 'SUCCESS' | 'FAILED';

/** 待上传/上传中的文件 */
export interface UploadItem {
  id: string;
  name: string;
  format: FileFormat;
  sizeKB: number;
  /** 本地临时路径（H5 为 blob 地址） */
  path: string;
  /** 上传进度 0-100 */
  progress: number;
  state: UploadState;
  /** 失败原因 */
  error?: string;
}

export const UPLOAD_STATE_LABEL: Record<UploadState, string> = {
  PENDING: '等待上传',
  UPLOADING: '上传中',
  SUCCESS: '上传成功',
  FAILED: '上传失败',
};
