import type { Message } from '@/types';
import { db, handleMarkAllRead, handleMarkRead, messagesSorted } from '@/mock/handlers';
import { mockCopy, mockOk } from '@/services/request';

/** 全部消息（按时间倒序） */
export function fetchMessages(): Promise<Message[]> {
  return mockCopy(messagesSorted());
}

/** 标记单条已读 */
export function markMessageRead(messageId: string): Promise<void> {
  handleMarkRead(messageId);
  return mockOk(120);
}

/** 全部已读 */
export function markAllMessagesRead(): Promise<void> {
  handleMarkAllRead();
  return mockOk(120);
}

/** 未读数（供 TabBar 角标） */
export function fetchUnreadCount(): Promise<number> {
  return mockCopy(db.messages.filter((m) => !m.read).length, 120);
}
