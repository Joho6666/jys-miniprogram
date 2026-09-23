import type { Message } from '@/types';
import { db, handleMarkAllRead, handleMarkRead, messagesSorted } from '@/mock/handlers';
import { mockCopy, mockOk } from '@/services/request';
import { get, post, isMockMode } from '@/services/http';
import type { PageResult } from '@/types';

/** 全部消息（按时间倒序） */
export function fetchMessages(): Promise<Message[]> {
  if (!isMockMode()) return get<PageResult<Record<string, unknown>>>('/messages', { page: 1, pageSize: 100 }).then((page) => page.items.map(toHttpMessage));
  return mockCopy(messagesSorted());
}

function toHttpMessage(item: Record<string, unknown>): Message {
  const event = String(item.eventType ?? item.event ?? 'SYSTEM') as Message['event'];
  const type: Message['type'] = event.startsWith('REVIEW') ? 'REVIEW' : event === 'SYSTEM' ? 'SYSTEM' : 'TASK';
  return { id: String(item.id), type, event, title: String(item.title ?? ''), body: String(item.body ?? ''), source: '教研室事务管理系统', time: String(item.createdAt ?? ''), read: Boolean(item.read), taskId: item.taskId ? String(item.taskId) : undefined, submissionId: item.submissionId ? String(item.submissionId) : undefined, targetType: item.submissionId ? 'SUBMISSION' : item.taskId ? 'TASK' : 'SYSTEM', targetId: item.submissionId ? String(item.submissionId) : item.taskId ? String(item.taskId) : undefined };
}

/** 标记单条已读 */
export function markMessageRead(messageId: string): Promise<void> {
  if (!isMockMode()) return post<void>(`/messages/${messageId}/read`);
  handleMarkRead(messageId);
  return mockOk(120);
}

/** 全部已读 */
export function markAllMessagesRead(): Promise<void> {
  if (!isMockMode()) return post<void>('/messages/read-all');
  handleMarkAllRead();
  return mockOk(120);
}

/** 未读数（供 TabBar 角标） */
export function fetchUnreadCount(): Promise<number> {
  if (!isMockMode()) return get<{ count: number }>('/messages/unread-count').then((data) => Number(data.count ?? 0));
  return mockCopy(db.messages.filter((m) => !m.read).length, 120);
}
