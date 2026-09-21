import type { TaskView } from '@/types';
import { db, findTask, submissionsOfTask } from '@/mock/handlers';
import { buildTaskView } from '@/services/domain';
import { mockCopy, mockFail } from '@/services/request';

/** 全部任务视图（含派生态） */
export function fetchTasks(): Promise<TaskView[]> {
  const views = db.tasks.map((task) => buildTaskView(task, submissionsOfTask(task.id)));
  return mockCopy(views);
}

/** 任务详情 */
export function fetchTaskDetail(taskId: string): Promise<TaskView> {
  const task = findTask(taskId);
  if (!task) {
    return mockFail('任务不存在或已下架');
  }
  return mockCopy(buildTaskView(task, submissionsOfTask(task.id)));
}
