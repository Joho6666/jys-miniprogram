import type { TaskCategory, TaskView } from '@/types';
import { db, findTask, submissionsOfTask } from '@/mock/handlers';
import { buildTaskView } from '@/services/domain';
import { mockCopy, mockFail } from '@/services/request';
import { apiRequest, isMockMode } from '@/services/http';

/** 全部任务视图（含派生态） */
export function fetchTasks(): Promise<TaskView[]> {
  if (!isMockMode()) return apiRequest<{ items: Array<Record<string, unknown>> }>('/tasks').then((page) => page.items.map(toTaskView));
  const views = db.tasks.map((task) => buildTaskView(task, submissionsOfTask(task.id)));
  return mockCopy(views);
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

function toTaskView(task: Record<string, unknown>): TaskView {
  return {
    id: String(task.id), title: String(task.title), category: String(task.category) as TaskCategory,
    tags: [String(task.category)], ownerId: '', ownerName: '', publisherId: '', publisherName: '',
    publishedAt: '', deadline: String(task.deadline), description: String(task.description ?? ''), attachments: [],
    status: String(task.lifecycleStatus) === 'DRAFT' ? 'NOT_STARTED' : 'IN_PROGRESS', bizStatus: 'IN_PROGRESS', statusNote: '',
  };
}
