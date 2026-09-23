import { describe, expect, it } from 'vitest';
import { toTaskView } from '@/api/mappers/task.mapper';

describe('task DTO mapper', () => {
  it('retains publisher, owner, attachments, department and assignment data', () => {
    const task = toTaskView({
      id: 'task-1', title: '课程申报', category: '项目申报', description: '说明', deadline: '2026-09-27T10:00:00Z',
      priority: 'HIGH', publishedAt: '2026-09-20T09:00:00Z', publisher: { id: 'u2', name: '王老师' }, owner: { id: 'u1', name: '张老师' },
      department: { id: 'd1', name: '工程管理教研室' }, attachments: [{ id: 'f1', fileName: '模板.docx', size: 2048, extension: 'docx' }],
      assignment: { id: 'a1', status: 'REJECTED', latestSubmission: { id: 's1', version: 2, status: 'REJECTED', reviewOpinion: '补充签字' } },
      allowLateSubmission: false, requireReview: true, statusNote: '请尽快补正',
    });
    expect(task).toMatchObject({ id: 'task-1', ownerId: 'u1', ownerName: '张老师', publisherId: 'u2', publisherName: '王老师', departmentId: 'd1', departmentName: '工程管理教研室', assignmentId: 'a1', assignmentStatus: 'REJECTED', latestSubmissionId: 's1', latestVersion: 2, statusNote: '请尽快补正', allowLateSubmission: false, rejectSummary: '补充签字' });
    expect(task.attachments[0]).toMatchObject({ id: 'f1', name: '模板.docx', format: 'DOCX', sizeKB: 2 });
  });
});
