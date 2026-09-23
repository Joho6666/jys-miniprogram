import { describe, expect, it } from 'vitest';
import { toSubmissionView } from '@/api/mappers/submission.mapper';

describe('submission DTO mapper', () => {
  it('maps files, review details and the V1 to V2 history', () => {
    const view = toSubmissionView({ id: 's2', taskId: 't1', taskTitle: '材料申报', assignmentId: 'a1', userId: 'u1', version: 2, status: 'PENDING_REVIEW', note: '已补充', submittedAt: '2026-09-23', files: [{ fileId: 'f2', fileName: '材料.pdf', size: 4096, extension: 'pdf' }], versions: [
      { submissionId: 's1', version: 1, status: 'REJECTED', submittedAt: '2026-09-20', reviewedAt: '2026-09-21', reviewerName: '李主任', reviewOpinion: '缺签字' },
      { submissionId: 's2', version: 2, status: 'PENDING_REVIEW', submittedAt: '2026-09-23', active: true },
    ] });
    expect(view.files[0]).toMatchObject({ id: 'f2', name: '材料.pdf', sizeKB: 4, format: 'PDF' });
    expect(view.versions.map(({ version, status }) => [version, status])).toEqual([[1, 'REJECTED'], [2, 'PENDING_REVIEW']]);
    expect(view.versions[0].opinion).toBe('缺签字');
    expect(view.versions[1].active).toBe(true);
  });
});
