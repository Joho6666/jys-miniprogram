import type { BizStatus, Submission, SubmissionView } from '@/types';
import {
  db,
  findSubmission,
  findTask,
  handleResubmit,
  handleReview,
  handleSubmit,
  resetDb,
  submissionsOfTask,
} from '@/mock/handlers';
import type { ReviewPayload, SubmitPayload } from '@/mock/handlers';
import { buildVersionNodes } from '@/services/domain';
import { mockCopy, mockFail, mockOk } from '@/services/request';
import { apiRequest, get, post, isMockMode } from '@/services/http';
import type { PageResult } from '@/types';
import { toSubmissionView } from './mappers/submission.mapper';
import { fetchTaskDetail } from './task';

function submissionBizStatus(submission: Submission): BizStatus {
  if (submission.status === 'APPROVED') return 'APPROVED';
  if (submission.status === 'REJECTED') return 'REJECTED';
  return 'PENDING_REVIEW';
}

function toView(submission: Submission): SubmissionView {
  return {
    ...submission,
    bizStatus: submissionBizStatus(submission),
    versions: buildVersionNodes(submissionsOfTask(submission.taskId)),
  };
}

/** 我的提交记录（按提交时间倒序，同一时刻保持插入顺序） */
export function fetchSubmissions(): Promise<SubmissionView[]> {
  if (!isMockMode()) return get<PageResult<Record<string, unknown>>>('/submissions', { page: 1, pageSize: 20 }).then((page) => page.items.map((item) => toSubmissionView(item as never)));
  const list = db.submissions
    .map((submission, index) => ({ submission, index }))
    .sort((a, b) => {
      if (a.submission.submittedAt === b.submission.submittedAt) return a.index - b.index;
      return a.submission.submittedAt < b.submission.submittedAt ? 1 : -1;
    })
    .map((item) => item.submission);
  return mockCopy(list.map(toView));
}

/** 某任务最新一次提交（不存在时返回 undefined） */
export function fetchSubmissionOfTask(taskId: string): Promise<SubmissionView | undefined> {
  if (!isMockMode()) return getTaskSubmission(taskId);
  const list = submissionsOfTask(taskId);
  if (!list.length) {
    return mockCopy(undefined);
  }
  return mockCopy(toView(list[list.length - 1]));
}

async function getTaskSubmission(taskId: string): Promise<SubmissionView | undefined> {
  const task = await fetchTaskDetail(taskId);
  if (!task.latestSubmissionId) return undefined;
  return fetchSubmissionDetail(task.latestSubmissionId);
}

/** 提交单详情（含版本时间线） */
export function fetchSubmissionDetail(submissionId: string): Promise<SubmissionView> {
  if (!isMockMode()) return get<Record<string, unknown>>(`/submissions/${submissionId}`).then((dto) => toSubmissionView(dto as never, ((dto.versions as Array<Record<string, unknown>> | undefined) ?? []).map((v) => v as never)));
  const submission = findSubmission(submissionId);
  if (!submission) {
    return mockFail('提交记录不存在');
  }
  return mockCopy(toView(submission));
}

/** 首次提交材料 */
export function submitMaterials(payload: SubmitPayload & { assignmentId?: string }): Promise<Submission> {
  if (!isMockMode()) return post<Record<string, unknown>>(`/tasks/${payload.taskId}/submissions`, { assignmentId: payload.assignmentId, fileIds: payload.files.map((file) => file.id), note: payload.note }).then((s) => ({ id: String(s.id), taskId: payload.taskId, taskTitle: '', assignmentId: s.assignmentId ? String(s.assignmentId) : payload.assignmentId, version: Number(s.version ?? 1), status: String(s.status ?? 'PENDING_REVIEW') as Submission['status'], files: payload.files, note: String(s.note ?? payload.note), submittedAt: String(s.submittedAt ?? new Date().toISOString()) }));
  try {
    return mockCopy(handleSubmit(payload));
  } catch (error) {
    return mockFail(error instanceof Error ? error.message : '提交失败，请重试');
  }
}

/** 驳回后重新提交（版本自动 +1） */
export function resubmitMaterials(payload: SubmitPayload & { assignmentId?: string }): Promise<Submission> {
  if (!isMockMode()) return submitMaterials(payload);
  try {
    return mockCopy(handleResubmit(payload));
  } catch (error) {
    return mockFail(error instanceof Error ? error.message : '重新提交失败，请重试');
  }
}

/** 模拟审核（通过 / 驳回） */
export function reviewSubmission(payload: ReviewPayload): Promise<Submission> {
  if (!isMockMode()) return post<Record<string, unknown>>(`/submissions/${payload.submissionId}/review`, { approved: payload.approved, comment: payload.opinion }).then((s) => ({ id: String(s.id), taskId: String(s.taskId ?? ''), taskTitle: '', version: Number(s.version ?? 1), status: String(s.status) as Submission['status'], files: [], note: String(s.note ?? ''), submittedAt: String(s.submittedAt ?? '') }));
  try {
    return mockCopy(handleReview(payload));
  } catch (error) {
    return mockFail(error instanceof Error ? error.message : '审核失败，请重试');
  }
}

/** 关联任务标题（结果页展示用） */
export function fetchSubmissionTaskTitle(submissionId: string): Promise<string> {
  const submission = findSubmission(submissionId);
  const task = submission ? findTask(submission.taskId) : undefined;
  return mockCopy(task?.title ?? '');
}

/** 重置本地数据（开发调试用） */
export function resetMockData(): Promise<void> {
  resetDb();
  return mockOk(0);
}
