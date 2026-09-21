import type { Submission, SubmittedFile } from '@/types';
import { at } from './db';
import { MOCK_TASKS } from './tasks';

/** 具名提交单（与任务状态严格对应） */
const NAMED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-002-v1',
    taskId: 'task-002',
    taskTitle: '2026年秋季教学进度表提交',
    version: 1,
    status: 'APPROVED',
    files: [{ id: 'f-002-1', name: '工程管理教研室2026秋季教学进度表.xlsx', format: 'XLSX', sizeKB: 96, uploadedAt: at(-12, '15:10') }],
    note: '已按人才培养方案学时分配核对。',
    submittedAt: at(-12, '15:10'),
    reviewedAt: at(-11, '10:15'),
    reviewerName: '李主任',
    reviewOpinion: '材料齐全，审核通过。',
  },
  {
    id: 'sub-003-v1',
    taskId: 'task-003',
    taskTitle: '课程教学大纲提交',
    version: 1,
    status: 'REJECTED',
    files: [{ id: 'f-003-1', name: '工程管理课程教学大纲.pdf', format: 'PDF', sizeKB: 1850, uploadedAt: at(-5, '14:20') }],
    note: '第一版修订稿。',
    submittedAt: at(-5, '14:20'),
    reviewedAt: at(-4, '09:15'),
    reviewerName: '李主任',
    reviewOpinion: '大纲格式与模板不符，请按最新模板修订后重新提交。',
  },
  {
    id: 'sub-003-v2',
    taskId: 'task-003',
    taskTitle: '课程教学大纲提交',
    version: 2,
    status: 'APPROVED',
    files: [
      { id: 'f-003-2', name: '工程管理课程教学大纲_终版.pdf', format: 'PDF', sizeKB: 1920, uploadedAt: at(-2, '16:20') },
      { id: 'f-003-3', name: '大纲修订说明.docx', format: 'DOCX', sizeKB: 210, uploadedAt: at(-2, '16:20') },
    ],
    note: '已按最新模板重新排版，并补充毕业要求支撑关系矩阵。',
    submittedAt: at(-2, '16:20'),
    reviewedAt: at(-1, '10:15'),
    reviewerName: '王老师',
    reviewOpinion: '材料填写完整，审核通过。',
  },
  {
    id: 'sub-004-v1',
    taskId: 'task-004',
    taskTitle: '青年教师听课记录提交',
    version: 1,
    status: 'REJECTED',
    files: [{ id: 'f-004-1', name: '听课记录表_李老师.pdf', format: 'PDF', sizeKB: 860, uploadedAt: at(-3, '11:02') }],
    note: '共 4 次听课记录。',
    submittedAt: at(-3, '11:02'),
    reviewedAt: at(-2, '16:30'),
    reviewerName: '李主任',
    reviewOpinion: '缺少院系领导盖章页，请补充后重新提交。',
  },
  {
    id: 'sub-005-v1',
    taskId: 'task-005',
    taskTitle: '教学质量检查材料',
    version: 1,
    status: 'PENDING_REVIEW',
    files: [
      { id: 'f-005-1', name: '教学质量检查自查表.docx', format: 'DOCX', sizeKB: 640, uploadedAt: at(-1, '14:32') },
      { id: 'f-005-2', name: '试卷抽查情况汇总.xlsx', format: 'XLSX', sizeKB: 380, uploadedAt: at(-1, '14:32') },
    ],
    note: '已按要求完成自查，详见附件，请审核。',
    submittedAt: at(-1, '14:32'),
  },
  {
    id: 'sub-009-v1',
    taskId: 'task-009',
    taskTitle: '实验室建设方案论证',
    version: 1,
    status: 'APPROVED',
    files: [{ id: 'f-009-1', name: '实验室建设方案论证报告.pdf', format: 'PDF', sizeKB: 2400, uploadedAt: at(-14, '10:20') }],
    note: '含设备清单与安全评估。',
    submittedAt: at(-14, '10:20'),
    reviewedAt: at(-13, '09:40'),
    reviewerName: '李主任',
    reviewOpinion: '论证方案完整，同意备案。',
  },
  {
    id: 'sub-010-v1',
    taskId: 'task-010',
    taskTitle: '教研活动总结',
    version: 1,
    status: 'APPROVED',
    files: [{ id: 'f-010-1', name: '上学期教研活动总结.docx', format: 'DOCX', sizeKB: 320, uploadedAt: at(-18, '16:00') }],
    note: '',
    submittedAt: at(-18, '16:00'),
    reviewedAt: at(-17, '10:30'),
    reviewerName: '王老师',
    reviewOpinion: '总结内容完整，审核通过。',
  },
  {
    id: 'sub-011-v1',
    taskId: 'task-011',
    taskTitle: '学生评教结果确认表',
    version: 1,
    status: 'APPROVED',
    files: [{ id: 'f-011-1', name: '学生评教结果确认表.pdf', format: 'PDF', sizeKB: 420, uploadedAt: at(-8, '15:40') }],
    note: '评教结果无异议。',
    submittedAt: at(-8, '15:40'),
    reviewedAt: at(-7, '11:05'),
    reviewerName: '王老师',
    reviewOpinion: '结果确认无误。',
  },
];

/** 历史归档任务的 V1 已通过提交单 */
function buildHistorySubmissions(): Submission[] {
  const namedTaskIds = new Set(NAMED_SUBMISSIONS.map((s) => s.taskId));
  return MOCK_TASKS.filter((t) => !namedTaskIds.has(t.id) && t.status === 'COMPLETED').map((task, i) => {
    const template = task.attachments[0];
    const course = task.title.replace('《', '').split('》')[0];
    const kind = template.name.split('_')[1]?.replace('模板', '') ?? '材料';
    const ext = template.name.split('.').pop() ?? 'pdf';
    const file: SubmittedFile = {
      id: `f-${task.id}-1`,
      name: `${course}_${kind}.${ext}`,
      format: template.format,
      sizeKB: template.sizeKB + 120,
      uploadedAt: at(-21 + i, '15:00'),
    };
    return {
      id: `sub-${task.id.slice(5)}-v1`,
      taskId: task.id,
      taskTitle: task.title,
      version: 1,
      status: 'APPROVED' as const,
      files: [file],
      note: '',
      submittedAt: at(-21 + i, '15:00'),
      reviewedAt: at(-20 + i, '10:00'),
      reviewerName: '王老师',
      reviewOpinion: '材料齐全，审核通过。',
    };
  });
}

/** 全部提交单（按提交时间倒序） */
export const MOCK_SUBMISSIONS: Submission[] = [...NAMED_SUBMISSIONS, ...buildHistorySubmissions()].sort((a, b) =>
  a.submittedAt < b.submittedAt ? 1 : -1,
);
