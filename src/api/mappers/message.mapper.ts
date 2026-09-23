import type { Message } from '@/types';
type MessageDto = { id: string; eventType?: string; event?: string; title: string; body?: string; content?: string; source?: string; createdAt?: string; time?: string; read?: boolean; readAt?: string; taskId?: string; submissionId?: string; reviewOpinion?: string; opinion?: string };
export function toMessage(dto: MessageDto): Message {
  const event = (dto.eventType ?? dto.event ?? 'SYSTEM') as Message['event'];
  const type: Message['type'] = event.startsWith('REVIEW') ? 'REVIEW' : ['SYSTEM','NOTICE'].includes(event) ? 'SYSTEM' : 'TASK';
  return { id: dto.id, type, event, title: dto.title, body: dto.body ?? dto.content ?? '', source: dto.source ?? '教研室事务管理系统', time: dto.createdAt ?? dto.time ?? '', read: dto.read ?? Boolean(dto.readAt), taskId: dto.taskId, submissionId: dto.submissionId, opinion: dto.reviewOpinion ?? dto.opinion, targetType: dto.submissionId ? 'SUBMISSION' : dto.taskId ? 'TASK' : 'SYSTEM', targetId: dto.submissionId ?? dto.taskId };
}
