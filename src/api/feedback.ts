import { isMockMode, post } from '@/services/http';
import { mockOk } from '@/services/request';
export function submitFeedback(content: string, contact?: string): Promise<void> { return isMockMode() ? mockOk() : post<void>('/feedback', { content, contact }); }
