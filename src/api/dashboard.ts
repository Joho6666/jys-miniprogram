import type { Message, PageResult, TaskView } from '@/types';
import { db } from '@/mock/handlers';
import { buildTaskView } from '@/services/domain';
import { get, isMockMode } from '@/services/http';
import { mockCopy } from '@/services/request';
import { toTaskView } from './mappers/task.mapper';
import { toMessage } from './mappers/message.mapper';

export interface DashboardSummary { todoCount: number; dueSoonCount: number; pendingReviewCount: number; completedCount: number; rejectedCount: number; overdueCount: number; urgentTasks: TaskView[]; recentActivities: Message[] }
export function fetchDashboard(): Promise<DashboardSummary> {
  if (!isMockMode()) return get<Record<string, unknown>>('/dashboard/me').then((dto) => ({ todoCount: Number(dto.todoCount ?? 0), dueSoonCount: Number(dto.dueSoonCount ?? 0), pendingReviewCount: Number(dto.pendingReviewCount ?? 0), completedCount: Number(dto.completedCount ?? 0), rejectedCount: Number(dto.rejectedCount ?? 0), overdueCount: Number(dto.overdueCount ?? 0), urgentTasks: ((dto.urgentTasks ?? []) as Array<Record<string, unknown>>).map(toTaskView), recentActivities: ((dto.recentActivities ?? []) as Array<Record<string, unknown>>).map((item) => toMessage(item as never)) }));
  const tasks = db.tasks.map((task) => buildTaskView(task, db.submissions.filter((s) => s.taskId === task.id)));
  return mockCopy({ todoCount: tasks.filter((t) => ['NOT_STARTED','IN_PROGRESS','DUE_SOON','OVERDUE','REJECTED'].includes(t.bizStatus)).length, dueSoonCount: tasks.filter((t) => t.bizStatus === 'DUE_SOON').length, pendingReviewCount: tasks.filter((t) => t.bizStatus === 'PENDING_REVIEW').length, completedCount: tasks.filter((t) => ['COMPLETED','APPROVED'].includes(t.bizStatus)).length, rejectedCount: tasks.filter((t) => t.bizStatus === 'REJECTED').length, overdueCount: tasks.filter((t) => t.bizStatus === 'OVERDUE').length, urgentTasks: tasks.filter((t) => ['DUE_SOON','OVERDUE'].includes(t.bizStatus)).sort((a,b) => a.deadline.localeCompare(b.deadline)), recentActivities: [...db.messages].filter((m) => m.type !== 'SYSTEM').sort((a,b) => b.time.localeCompare(a.time)).slice(0,2) });
}
