import { beforeEach, describe, expect, it } from 'vitest';
import { authApi } from '@/api/auth';
import { fetchDashboard } from '@/api/dashboard';
import { fetchSubmissionOfTask, resetMockData } from '@/api/submission';
import { buildTaskView } from '@/services/domain';
import { db, handleResubmit, handleReview, handleSubmit, submissionsOfTask } from '@/mock/handlers';

describe('Mock Golden Path adapter flow', () => {
  beforeEach(() => resetMockData());

  it('logs in, submits V1, receives rejection, resubmits V2 and completes', async () => {
    const session = await authApi().login({ username: 'user-001', password: 'demo' });
    expect(session.user.name).toBe('张老师');
    const taskId = 'task-001';
    const first = handleSubmit({ taskId, files: [{ id: 'file-v1', name: 'v1.pdf', format: 'PDF', sizeKB: 10, uploadedAt: '2026-09-23' }], note: 'V1' });
    handleReview({ submissionId: first.id, approved: false, opinion: '请补齐签字' });
    const latest = await fetchSubmissionOfTask(taskId);
    expect(latest?.reviewOpinion).toBe('请补齐签字');
    const second = handleResubmit({ taskId, files: [{ id: 'file-v2', name: 'v2.pdf', format: 'PDF', sizeKB: 12, uploadedAt: '2026-09-23' }], note: 'V2' });
    expect(second.version).toBe(2);
    handleReview({ submissionId: second.id, approved: true, opinion: '通过' });
    expect(submissionsOfTask(taskId).map((item) => item.status)).toEqual(['REJECTED', 'APPROVED']);
    expect(buildTaskView(db.tasks.find((task) => task.id === taskId)!, submissionsOfTask(taskId)).bizStatus).toBe('COMPLETED');
    const dashboard = await fetchDashboard();
    expect(dashboard.completedCount).toBeGreaterThan(0);
    expect(db.messages.some((message) => message.event === 'REVIEW_REJECTED')).toBe(true);
    expect(db.messages.some((message) => message.event === 'REVIEW_APPROVED')).toBe(true);
  });
});
