import type { PageResult, TaskView } from '@/types';
import { db, findTask, submissionsOfTask } from '@/mock/handlers';
import { buildTaskView } from '@/services/domain';
import { mockCopy, mockFail } from '@/services/request';
import { apiRequest, get, isMockMode } from '@/services/http';

export interface TaskListQuery { page?: number; size?: number; keyword?: string; status?: string; sort?: string }

/** 全部任务视图（含派生态） */
export function fetchTasks(query: TaskListQuery = {}): Promise<PageResult<TaskView>> {
  const page = query.page ?? 1; const pageSize = query.size ?? 20;
  if (!isMockMode()) return get<PageResult<Record<string, unknown>> & { size?: number }>('/tasks', { page, pageSize, keyword: query.keyword, status: query.status, sort: query.sort }).then((result) => ({ ...result, pageSize: result.pageSize ?? result.size ?? pageSize, items: result.items.map(toTaskView) }));
  const status = query.status;
  const views = db.tasks.map((task) => buildTaskView(task, submissionsOfTask(task.id)))
    .filter((task) => !status || task.bizStatus === status)
    .filter((task) => !query.keyword || `${task.title} ${task.ownerName} ${task.category}`.includes(query.keyword));
  const items = views.slice((page - 1) * pageSize, page * pageSize);
  return mockCopy({ items, page, pageSize, total: views.length, hasMore: page * pageSize < views.length });
}

/** 任务详情 */
export function fetchTaskDetail(taskId: string): Promise<TaskView> {
  if (!isMockMode()) return apiRequest<Record<string, unknown>>(`/tasks/${taskId}`).then(toTaskView);
  const task = findTask(taskId);
  if (!task) {
    return mockFail('任务不存在或已下架');
  }
  return mockCopy(buildTaskView(task, submissionsOfTask(task.id)));
}

import { toTaskView } from './mappers/task.mapper';
