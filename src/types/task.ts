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

/** 当前用户对任务的执行分配。任务本身与教师执行状态分离。 */
export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  status: TaskStoredStatus;
  derivedStatus?: Extract<BizStatus, 'DUE_SOON' | 'OVERDUE'>;
  required: boolean;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  /** 展示用标签（设计规范：任务卡展示两枚标签，第一枚为分类） */
  tags: string[];
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
  /** 后端任务定义字段；旧 Mock 数据缺省时由适配层补齐。 */
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignmentType?: 'ALL' | 'DEPARTMENT' | 'SELECTED_USERS';
  allowLateSubmission?: boolean;
  requireReview?: boolean;
  departmentId?: string;
  departmentName?: string;
  createdAt?: string;
  updatedAt?: string;
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
  assignmentId?: string;
  assignmentStatus?: TaskStoredStatus;
  submissionStatus?: import('./submission').SubmissionStatus;
  assignment?: TaskAssignment;
}

/** 任务列表筛选键（与「我的待办」标签页一一对应） */
export type TaskFilterKey =
  | 'ALL'
  | 'URGENT'
  | 'DUE_SOON'
  | 'OVERDUE'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'COMPLETED';
