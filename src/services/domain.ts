import type {
  BadgeKey,
  BizStatus,
  Submission,
  Task,
  TaskView,
  UrgencyLevel,
  VersionNode,
} from '@/types';
import { STATUS_META, URGENCY_META } from '@/types';
import { deadlineText, hoursUntil, remainText } from './format';

/** 即将截止阈值（小时） */
export const DUE_SOON_HOURS = 72;

/** 紧急阈值（小时）：72 小时内且已进入 2 天以内为「紧急」 */
export const URGENT_HOURS = 48;
/** 紧急度上限（小时）：「即将截止」的上界 */
export const SOON_HOURS = 120;

/**
 * 业务状态派生规则（全系统唯一权威）。
 * 存储态只有：NOT_STARTED / IN_PROGRESS / PENDING_REVIEW / COMPLETED / REJECTED，
 * DUE_SOON 与 OVERDUE 依据截止时间实时派生，不落库。
 */
export function deriveBizStatus(task: Task, latest?: Submission): BizStatus {
  if (task.status === 'COMPLETED') return 'COMPLETED';
  if (task.status === 'REJECTED') return 'REJECTED';
  if (task.status === 'PENDING_REVIEW') return 'PENDING_REVIEW';

  const hours = hoursUntil(task.deadline);
  if (hours < 0) return 'OVERDUE';
  if (hours <= DUE_SOON_HOURS) return 'DUE_SOON';

  if (latest && latest.status === 'APPROVED') return 'COMPLETED';
  if (task.status === 'NOT_STARTED' && !latest) return 'NOT_STARTED';
  return 'IN_PROGRESS';
}

/** 状态右侧说明文案 */
export function statusNoteOf(biz: BizStatus, deadline: string): string {
  switch (biz) {
    case 'OVERDUE':
      // 标签已显示「已逾期」，这里补充原截止时间，避免信息重复
      return `原截止 ${deadlineText(deadline)}`;
    case 'DUE_SOON':
    case 'IN_PROGRESS':
    case 'NOT_STARTED':
      return remainText(deadline);
    case 'PENDING_REVIEW':
      return '等待审核';
    case 'APPROVED':
      return '审核通过';
    case 'COMPLETED':
      return '已完成';
    case 'REJECTED':
      return '待修改';
    default:
      return '';
  }
}

/** 组装任务视图（存储态 + 派生态 + 最近提交信息） */
export function buildTaskView(task: Task, submissions: Submission[]): TaskView {
  const sorted = [...submissions].sort((a, b) => a.version - b.version);
  const latest = sorted.length ? sorted[sorted.length - 1] : undefined;
  const bizStatus = deriveBizStatus(task, latest);

  return {
    ...task,
    bizStatus,
    statusNote: statusNoteOf(bizStatus, task.deadline),
    latestSubmissionId: latest?.id,
    latestVersion: latest?.version,
    rejectSummary: bizStatus === 'REJECTED' ? latest?.reviewOpinion : undefined,
  };
}

/** 版本时间线节点（版本升序） */
export function buildVersionNodes(submissions: Submission[]): VersionNode[] {
  const sorted = [...submissions].sort((a, b) => a.version - b.version);
  const latestId = sorted.length ? sorted[sorted.length - 1].id : '';
  return sorted
    .map((s) => ({
      submissionId: s.id,
      version: s.version,
      status: s.status,
      submittedAt: s.submittedAt,
      reviewedAt: s.reviewedAt,
      reviewerName: s.reviewerName,
      opinion: s.reviewOpinion,
      active: s.id === latestId,
    }));
}

/** 任务主操作类型 */
export type TaskPrimaryAction = 'submit' | 'submission-detail' | 'resubmit' | 'review-result';

export interface TaskActionMeta {
  action: TaskPrimaryAction;
  /** 详情页底部主按钮文案 */
  label: string;
  /** 列表卡片上的紧凑文案 */
  shortLabel: string;
}

/** 不同状态下任务主操作（详情页/列表卡/消息按钮共用） */
export function primaryActionOf(biz: BizStatus): TaskActionMeta {
  switch (biz) {
    case 'PENDING_REVIEW':
      return { action: 'submission-detail', label: '查看提交详情', shortLabel: '查看详情' };
    case 'REJECTED':
      return { action: 'resubmit', label: '修改并重新提交', shortLabel: '修改重提' };
    case 'APPROVED':
    case 'COMPLETED':
      return { action: 'review-result', label: '查看审核结果', shortLabel: '查看结果' };
    case 'NOT_STARTED':
    case 'IN_PROGRESS':
    case 'DUE_SOON':
    case 'OVERDUE':
    default:
      return { action: 'submit', label: '去提交材料', shortLabel: '去处理' };
  }
}

/** 是否还可提交材料（逾期仍允许补交） */
export function canSubmit(task: TaskView): boolean {
  return primaryActionOf(task.bizStatus).action === 'submit';
}

/* ---------------------------------------------------------------------
   任务卡徽标与剩余时间（设计规范：徽标 + 「距截止 N 天」）
   --------------------------------------------------------------------- */

/** 紧急度派生：已逾期或 2 天内＝紧急；3–5 天＝即将截止；其余普通 */
export function urgencyOf(deadline: string): UrgencyLevel {
  const hours = hoursUntil(deadline);
  if (hours < 0 || hours <= URGENT_HOURS) return 'URGENT';
  if (hours <= SOON_HOURS) return 'SOON';
  return 'NORMAL';
}

export interface TaskBadge {
  /** 交给 StatusTag 渲染的键 */
  key: BadgeKey;
  label: string;
}

/** 任务卡徽标：审核相关与已完成显示业务状态，在办任务显示紧急度 */
export function taskBadgeOf(task: TaskView): TaskBadge {
  switch (task.bizStatus) {
    case 'PENDING_REVIEW':
    case 'REJECTED':
    case 'COMPLETED':
    case 'APPROVED':
      return { key: task.bizStatus, label: STATUS_META[task.bizStatus].label };
    default: {
      const level = urgencyOf(task.deadline);
      return { key: level, label: URGENCY_META[level].label };
    }
  }
}

/** 卡片右上角剩余时间：距截止 N 天 / 距截止 N 小时 / 已逾期 N 天 */
export function remainShortText(deadline: string): string {
  const hours = hoursUntil(deadline);
  if (hours < 0) {
    return `已逾期 ${Math.max(1, Math.ceil(-hours / 24))} 天`;
  }
  if (hours < 24) {
    return `距截止 ${Math.max(1, Math.ceil(hours))} 小时`;
  }
  return `距截止 ${Math.ceil(hours / 24)} 天`;
}
