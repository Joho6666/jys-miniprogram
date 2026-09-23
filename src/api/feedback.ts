import { isMockMode, post } from '@/services/http';
import { mockOk } from '@/services/request';

export function submitFeedback(content: string, contact?: string): Promise<void> {
  if (!content.trim()) return Promise.reject(new Error('请输入反馈内容'));
  return isMockMode() ? mockOk(180) : post<void>('/feedback', { content: content.trim(), contact: contact?.trim() || undefined });
}
