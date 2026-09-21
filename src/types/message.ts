/** 消息类型（决定图标色块与筛选分类） */
export type MessageType = 'TASK' | 'REVIEW' | 'SYSTEM';

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
  TASK: { label: '任务提醒', tile: '任', bg: '#E8F3FF', color: '#1677FF' },
  REVIEW: { label: '审核结果', tile: '审', bg: '#FFFBE6', color: '#FAAD14' },
  SYSTEM: { label: '系统通知', tile: '系', bg: '#F2F3F5', color: '#4E5969' },
};
