import type { BizStatus, FileFormat } from './common';

/** 任务分类 */
export type TaskCategory =
  | '项目申报'
  | '教学建设'
  | '日常事务'
  | '材料归档'
  | '经费管理'
  | '教材建设'
  | '实验室建设'
  | '人事事务';

/**
 * 任务存储态（持久化部分）。
 * 派生态 DUE_SOON / OVERDUE 由 services/domain.ts 依据截止时间实时计算，不落库。
 */
export type TaskStoredStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'REJECTED';

/** 任务附件（模板/指导文件） */
export interface TaskAttachment {
  id: string;
  name: string;
  format: FileFormat;
  sizeKB: number;
  note: string;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  /** 任务负责人（当前登录教师视角即本人） */
  ownerId: string;
  ownerName: string;
  /** 发布人（教学秘书 / 教研室主任） */
  publisherId: string;
  publisherName: string;
  /** 发布时间 YYYY-MM-DD HH:mm */
  publishedAt: string;
  /** 截止时间 YYYY-MM-DD HH:mm */
  deadline: string;
  /** 任务说明 */
  description: string;
  /** 依据文号（可选） */
  guide?: string;
  attachments: TaskAttachment[];
  status: TaskStoredStatus;
}

/** 任务视图（存储态 + 派生态，供列表/详情直接渲染） */
export interface TaskView extends Task {
  /** 全系统统一业务状态 */
  bizStatus: BizStatus;
  /** 状态说明：剩余 N 天 / 已逾期 N 天 / 等待审核 … */
  statusNote: string;
  /** 最近一次提交单 ID */
  latestSubmissionId?: string;
  /** 最近一次提交版本号 */
  latestVersion?: number;
  /** 已驳回时的一行审核摘要 */
  rejectSummary?: string;
}

/** 任务列表筛选键 */
export type TaskFilterKey = 'ALL' | 'DUE_SOON' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'REJECTED' | 'COMPLETED';
