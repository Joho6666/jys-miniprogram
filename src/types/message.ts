/** 消息类型（决定筛选分类） */
export type MessageType = 'TASK' | 'REVIEW' | 'SYSTEM';

import type { IconTone } from './common';

/** 消息业务事件 */
export type MessageEvent =
  | 'NEW_TASK'
  | 'DUE_SOON'
  | 'SUBMITTED'
  | 'REVIEW_APPROVED'
  | 'REVIEW_REJECTED'
  | 'NOTICE';

export interface Message {
  id: string;
  type: MessageType;
  event: MessageEvent;
  title: string;
  body: string;
  /** 来源：部门 · 类别 */
  source: string;
  /** YYYY-MM-DD HH:mm */
  time: string;
  read: boolean;
  taskId?: string;
  submissionId?: string;
  /** 审核意见（审核类消息展示子块） */
  opinion?: string;
}

/** 消息筛选键 */
export type MessageFilterKey = 'ALL' | MessageType;

export const MESSAGE_TYPE_META: Record<MessageType, { label: string; tile: string; bg: string; color: string }> = {
  TASK: { label: '任务通知', tile: '任', bg: '#E8F3FF', color: '#1677FF' },
  REVIEW: { label: '审核结果', tile: '审', bg: '#FFFBE6', color: '#FAAD14' },
  SYSTEM: { label: '系统消息', tile: '系', bg: '#F2F3F5', color: '#4E5969' },
};

/** 消息圆形图标（按业务事件取图标与色调，app-icon 消费） */
export const MESSAGE_EVENT_META: Record<MessageEvent, { icon: string; tone: IconTone }> = {
  NEW_TASK: { icon: 'notification', tone: 'primary' },
  DUE_SOON: { icon: 'notification', tone: 'warning' },
  SUBMITTED: { icon: 'paperplane', tone: 'primary' },
  REVIEW_APPROVED: { icon: 'checkmarkempty', tone: 'success' },
  REVIEW_REJECTED: { icon: 'closeempty', tone: 'danger' },
  NOTICE: { icon: 'sound', tone: 'primary' },
};
