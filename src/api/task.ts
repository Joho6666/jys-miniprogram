import type { TaskCategory, TaskView } from '@/types';
import { db, findTask, submissionsOfTask } from '@/mock/handlers';
import { buildTaskView } from '@/services/domain';
import { mockCopy, mockFail } from '@/services/request';
import { apiRequest, get, isMockMode } from '@/services/http';

export interface TaskListQuery { page?: number; size?: number; keyword?: string; status?: string; sort?: string }

/** 全部任务视图（含派生态） */
export function fetchTasks(query: TaskListQuery = {}): Promise<TaskView[]> {
  if (!isMockMode()) return get<{ items: Array<Record<string, unknown>> }>('/tasks', { page: query.page, pageSize: query.size ?? 20, keyword: query.keyword, status: query.status, sort: query.sort }).then((page) => page.items.map(toTaskView));
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
  const assignment = (task.assignment ?? task.currentAssignment) as Record<string, unknown> | undefined;
  const status = String(assignment?.status ?? task.status ?? task.lifecycleStatus ?? 'NOT_STARTED');
  const submission = assignment?.latestSubmission as Record<string, unknown> | undefined;
  return {
    id: String(task.id), title: String(task.title), category: String(task.category) as TaskCategory,
    tags: [String(task.category)], ownerId: '', ownerName: '', publisherId: '', publisherName: '',
    publishedAt: String(task.publishedAt ?? task.createdAt ?? ''), deadline: String(task.deadline), description: String(task.description ?? ''), attachments: [],
    status: status as TaskView['status'], bizStatus: String(assignment?.derivedStatus ?? 'IN_PROGRESS') as TaskView['bizStatus'], statusNote: '',
    assignmentId: assignment?.id ? String(assignment.id) : undefined, assignmentStatus: status as TaskView['assignmentStatus'],
    submissionStatus: submission?.status as TaskView['submissionStatus'], latestSubmissionId: submission?.id ? String(submission.id) : undefined,
    latestVersion: submission?.version ? Number(submission.version) : undefined,
    priority: task.priority as TaskView['priority'], assignmentType: task.assignmentType as TaskView['assignmentType'], allowLateSubmission: Boolean(task.allowLateSubmission ?? true), requireReview: Boolean(task.requireReview ?? true),
  };
}
