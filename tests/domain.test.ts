import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Submission, Task } from '@/types';
import {
  buildTaskView,
  buildVersionNodes,
  deriveBizStatus,
  primaryActionOf,
  remainShortText,
  taskBadgeOf,
  urgencyOf,
} from '@/services/domain';

const NOW = new Date('2026-09-23T08:00:00+08:00');

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: '教学材料提交',
    category: '材料归档',
    tags: ['材料归档'],
    ownerId: 'user-1',
    ownerName: '张老师',
    publisherId: 'user-2',
    publisherName: '李老师',
    publishedAt: '2026-09-20 08:00',
    deadline: '2026-09-24 08:00',
    description: '按要求提交材料',
    attachments: [],
    status: 'IN_PROGRESS',
    ...overrides,
  };
}

function submission(overrides: Partial<Submission> = {}): Submission {
  return {
    id: 'submission-1',
    taskId: 'task-1',
    taskTitle: '教学材料提交',
    version: 1,
    status: 'PENDING_REVIEW',
    files: [],
    note: '',
    submittedAt: '2026-09-22 08:00',
    ...overrides,
  };
}

describe('domain state derivation', () => {
  beforeEach(() => { vi.setSystemTime(NOW); });

  it('derives deadline states without persisting them', () => {
    expect(deriveBizStatus(task({ deadline: '2026-09-23 07:00' }))).toBe('OVERDUE');
    expect(deriveBizStatus(task({ deadline: '2026-09-26 08:00' }))).toBe('DUE_SOON');
    expect(deriveBizStatus(task({ deadline: '2026-09-27 08:01' }))).toBe('IN_PROGRESS');
  });

  it('keeps terminal and review states ahead of deadline derivation', () => {
    expect(deriveBizStatus(task({ status: 'COMPLETED', deadline: '2026-09-20 08:00' }))).toBe('COMPLETED');
    expect(deriveBizStatus(task({ status: 'REJECTED' }))).toBe('REJECTED');
    expect(deriveBizStatus(task({ status: 'PENDING_REVIEW' }))).toBe('PENDING_REVIEW');
  });

  it('derives urgency boundaries and task badge', () => {
    expect(urgencyOf('2026-09-25 08:00')).toBe('URGENT');
    expect(urgencyOf('2026-09-28 08:00')).toBe('SOON');
    expect(urgencyOf('2026-09-28 08:01')).toBe('NORMAL');

    const view = buildTaskView(task({ status: 'PENDING_REVIEW' }), [submission()]);
    expect(taskBadgeOf(view)).toEqual({ key: 'PENDING_REVIEW', label: '待审核' });
  });

  it('selects the expected primary action', () => {
    expect(primaryActionOf('REJECTED').action).toBe('resubmit');
    expect(primaryActionOf('PENDING_REVIEW').action).toBe('submission-detail');
    expect(primaryActionOf('COMPLETED').action).toBe('review-result');
    expect(primaryActionOf('OVERDUE').action).toBe('submit');
  });

  it('builds a sorted immutable version timeline', () => {
    const versions = [
      submission({ id: 'v2', version: 2, status: 'PENDING_REVIEW' }),
      submission({ id: 'v1', version: 1, status: 'REJECTED' }),
    ];
    const nodes = buildVersionNodes(versions);

    expect(nodes.map((node) => node.version)).toEqual([1, 2]);
    expect(nodes.find((node) => node.submissionId === 'v2')?.active).toBe(true);
    expect(versions.map((item) => item.version)).toEqual([2, 1]);
  });

  it('formats compact remaining time safely around the deadline', () => {
    expect(remainShortText('2026-09-23 10:00')).toBe('距截止 2 小时');
    expect(remainShortText('2026-09-22 08:00')).toBe('已逾期 1 天');
  });
});
