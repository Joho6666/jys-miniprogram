import type { Message } from '@/types';
import { db, handleMarkAllRead, handleMarkRead, messagesSorted } from '@/mock/handlers';
import { mockCopy, mockOk } from '@/services/request';
import { get, post, isMockMode } from '@/services/http';
import type { PageResult } from '@/types';
import { toMessage } from './mappers/message.mapper';

/** 全部消息（按时间倒序） */
export function fetchMessages(page = 1, pageSize = 20): Promise<PageResult<Message>> {
  if (!isMockMode()) return get<PageResult<Record<string, unknown>> & { size?: number }>('/messages', { page, size: pageSize }).then((result) => ({ ...result, pageSize: result.pageSize ?? result.size ?? pageSize, items: result.items.map((item) => toMessage(item as never)) }));
  const all = messagesSorted(); const items = all.slice((page - 1) * pageSize, page * pageSize);
  return mockCopy({ items, page, pageSize, total: all.length, hasMore: page * pageSize < all.length });
}

export function fetchUnreadCount(): Promise<number> {
  if (!isMockMode()) return get<{ count: number }>('/messages/unread-count').then((data) => data.count);
  return mockCopy(db.messages.filter((message) => !message.read).length, 120);
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
