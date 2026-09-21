import type { Message, Submission, SubmittedFile, Task } from '@/types';
import { deepCopy, nowText, uid } from './db';
import { MOCK_MESSAGES } from './messages';
import { MOCK_SUBMISSIONS } from './submissions';
import { MOCK_TASKS } from './tasks';
import { findUser } from './users';

/**
 * Mock 内存数据库 —— 本阶段唯一可变状态源。
 * 页面/组件不得直接修改，全部通过 services/api 层的函数进行流转。
 */
const SEED = {
  tasks: deepCopy(MOCK_TASKS),
  submissions: deepCopy(MOCK_SUBMISSIONS),
  messages: deepCopy(MOCK_MESSAGES),
};

export const db = {
  tasks: deepCopy(MOCK_TASKS),
  submissions: deepCopy(MOCK_SUBMISSIONS),
  messages: deepCopy(MOCK_MESSAGES),
};

/** 恢复初始数据（开发调试用） */
export function resetDb(): void {
  db.tasks = deepCopy(SEED.tasks);
  db.submissions = deepCopy(SEED.submissions);
  db.messages = deepCopy(SEED.messages);
}

/* ----------------------------- 查询辅助 ----------------------------- */

export function findTask(taskId: string): Task | undefined {
  return db.tasks.find((t) => t.id === taskId);
}

export function findSubmission(submissionId: string): Submission | undefined {
  return db.submissions.find((s) => s.id === submissionId);
}

/** 某任务的全部提交单（版本升序） */
export function submissionsOfTask(taskId: string): Submission[] {
  return db.submissions.filter((s) => s.taskId === taskId).sort((a, b) => a.version - b.version);
}

/** 某任务最新一次提交 */
export function latestSubmissionOfTask(taskId: string): Submission | undefined {
  const list = submissionsOfTask(taskId);
  return list.length ? list[list.length - 1] : undefined;
}

/** 消息按时间倒序（同一时刻保持插入顺序，新消息在前） */
export function messagesSorted(): Message[] {
  return db.messages
    .map((message, index) => ({ message, index }))
    .sort((a, b) => {
      if (a.message.time === b.message.time) return a.index - b.index;
      return a.message.time < b.message.time ? 1 : -1;
    })
    .map((item) => item.message);
}

/* ----------------------------- 状态流转 ----------------------------- */

function pushMessage(message: Omit<Message, 'id' | 'time' | 'read'>): void {
  db.messages.unshift({
    ...message,
    id: uid('msg'),
    time: nowText(),
    read: false,
  });
}

export interface SubmitPayload {
  taskId: string;
  files: SubmittedFile[];
  note: string;
}

function createSubmission(payload: SubmitPayload): Submission {
  const task = findTask(payload.taskId);
  if (!task) {
    throw new Error('任务不存在或已下架');
  }

  const history = submissionsOfTask(task.id);
  const version = history.length ? history[history.length - 1].version + 1 : 1;
  const time = nowText();

  const submission: Submission = {
    id: `sub-${task.id.slice(5)}-v${version}`,
    taskId: task.id,
    taskTitle: task.title,
    version,
    status: 'PENDING_REVIEW',
    files: payload.files,
    note: payload.note,
    submittedAt: time,
  };

  db.submissions.unshift(submission);
  task.status = 'PENDING_REVIEW';

  pushMessage({
    type: 'TASK',
    event: 'SUBMITTED',
    title: `${task.title}已提交`,
    body: `您提交的材料（V${version}）已进入审核流程，审核结果将通过消息通知您。`,
    source: '教研室事务助手 · 提交确认',
    taskId: task.id,
    submissionId: submission.id,
  });

  return submission;
}

/** 首次提交（材料提交） */
export function handleSubmit(payload: SubmitPayload): Submission {
  return createSubmission(payload);
}

/** 驳回后重新提交（版本号自动 +1） */
export function handleResubmit(payload: SubmitPayload): Submission {
  return createSubmission(payload);
}

export interface ReviewPayload {
  submissionId: string;
  approved: boolean;
  opinion: string;
  /** 审核人，默认李主任 */
  reviewerId?: string;
}

/** 审核（通过 / 驳回）—— Mock 阶段由页面上的「模拟审核」面板驱动 */
export function handleReview(payload: ReviewPayload): Submission {
  const submission = findSubmission(payload.submissionId);
  if (!submission) {
    throw new Error('提交单不存在');
  }
  const task = findTask(submission.taskId);
  if (!task) {
    throw new Error('任务不存在或已下架');
  }

  const reviewer = findUser(payload.reviewerId ?? 'user-007');
  const time = nowText();
  const opinion = payload.opinion.trim() || (payload.approved ? '材料齐全，审核通过。' : '材料不符合要求，请修改后重新提交。');

  submission.status = payload.approved ? 'APPROVED' : 'REJECTED';
  submission.reviewedAt = time;
  submission.reviewOpinion = opinion;
  submission.reviewerName = reviewer?.name ?? '李主任';

  task.status = payload.approved ? 'COMPLETED' : 'REJECTED';

  pushMessage({
    type: 'REVIEW',
    event: payload.approved ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED',
    title: payload.approved ? `${task.title}已审核通过` : `${task.title}已被驳回`,
    body: payload.approved
      ? `您提交的材料（V${submission.version}）已通过审核，相关文件已归档。`
      : `您提交的材料（V${submission.version}）未通过审核，请查看审核意见并及时修改后重新提交。`,
    source: '工程管理教研室 · 业务审核',
    taskId: task.id,
    submissionId: submission.id,
    opinion: payload.approved ? undefined : opinion,
  });

  return submission;
}

/* ----------------------------- 消息 ----------------------------- */

export function handleMarkRead(messageId: string): void {
  const message = db.messages.find((m) => m.id === messageId);
  if (message) {
    message.read = true;
  }
}

export function handleMarkAllRead(): void {
  db.messages.forEach((m) => {
    m.read = true;
  });
}
