import type { BizStatus, FileFormat } from './common';

/** 提交单状态 */
export type SubmissionStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

export interface Review {
  id: string;
  submissionId: string;
  reviewerId: string;
  reviewerName: string;
  approved: boolean;
  comment: string;
  reviewedAt: string;
}

/** 已提交文件 */
export interface SubmittedFile {
  id: string;
  name: string;
  format: FileFormat;
  sizeKB: number;
  uploadedAt: string;
}

/** 后端文件元数据；size 始终以字节为单位。 */
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  extension: string;
  uploadedAt: string;
  previewUrl?: string;
}

/** 单版本记录（时间线渲染用） */
export interface VersionNode {
  submissionId: string;
  version: number;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerName?: string;
  opinion?: string;
  active: boolean;
}

/** 提交单 */
export interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  /** 版本号，从 1 递增 */
  version: number;
  status: SubmissionStatus;
  files: SubmittedFile[];
  /** 提交说明（选填，≤500 字） */
  note: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewOpinion?: string;
  reviewerName?: string;
  assignmentId?: string;
  userId?: string;
  reviews?: Review[];
}

/** 提交单视图（含同任务版本链） */
export interface SubmissionView extends Submission {
  bizStatus: BizStatus;
  /** 同任务全部版本（按版本号升序） */
  versions: VersionNode[];
}
