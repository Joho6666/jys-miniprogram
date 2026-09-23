import type { FileFormat, Submission, Task, TaskAttachment, TaskAssignment, TaskCategory, TaskView } from '@/types';
import { deriveBizStatus, statusNoteOf } from '@/services/domain';

type TaskDto = {
  id: string; title: string; category: string; description?: string; priority?: Task['priority']; deadline: string;
  publishedAt?: string; createdAt?: string; owner?: { id?: string; name?: string }; ownerId?: string; ownerName?: string;
  publisher?: { id?: string; name?: string }; publisherId?: string; publisherName?: string;
  department?: { id?: string; name?: string }; departmentId?: string; departmentName?: string;
  attachments?: Array<{ id: string; name?: string; fileName?: string; format?: string; extension?: string; size?: number; sizeKB?: number; note?: string }>;
  assignment?: { id: string; taskId?: string; userId?: string; status: TaskAssignment['status']; required?: boolean; createdAt?: string; updatedAt?: string; latestSubmission?: { id: string; version?: number; status?: TaskView['submissionStatus']; reviewOpinion?: string } };
  currentAssignment?: TaskDto['assignment']; assignmentStatus?: TaskAssignment['status']; status?: Task['status']; lifecycleStatus?: Task['status'];
  statusNote?: string; bizStatus?: TaskView['bizStatus']; latestSubmission?: { id: string; version?: number; status?: TaskView['submissionStatus']; reviewOpinion?: string };
  latestVersion?: number; allowLateSubmission?: boolean; requireReview?: boolean; assignmentType?: Task['assignmentType'];
};
const asFormat = (raw: string): FileFormat => {
  const ext = raw.replace(/^\./, '').toUpperCase();
  const accepted: FileFormat[] = ['PDF','DOC','DOCX','XLS','XLSX','PPT','PPTX','JPG','PNG'];
  return (accepted.includes(ext as FileFormat) ? ext : 'PDF') as FileFormat;
};
export function toTaskView(value: Record<string, unknown>): TaskView {
  const dto = value as unknown as TaskDto;
  const assignment = dto.assignment ?? dto.currentAssignment;
  const latest = assignment?.latestSubmission ?? dto.latestSubmission;
  const status = assignment?.status ?? dto.assignmentStatus ?? dto.status ?? dto.lifecycleStatus ?? 'NOT_STARTED';
  const category = dto.category as TaskCategory;
  const task: Task = {
    id: dto.id, title: dto.title, category, tags: [category], ownerId: dto.owner?.id ?? dto.ownerId ?? '', ownerName: dto.owner?.name ?? dto.ownerName ?? '当前教师',
    publisherId: dto.publisher?.id ?? dto.publisherId ?? '', publisherName: dto.publisher?.name ?? dto.publisherName ?? '未提供',
    publishedAt: dto.publishedAt ?? dto.createdAt ?? '', deadline: dto.deadline, description: dto.description ?? '',
    attachments: (dto.attachments ?? []).map((file): TaskAttachment => ({ id: file.id, name: file.name ?? file.fileName ?? '', format: asFormat(file.format ?? file.extension ?? (file.name ?? file.fileName ?? '').split('.').pop() ?? ''), sizeKB: file.sizeKB ?? Math.ceil((file.size ?? 0) / 1024), note: file.note ?? '' })),
    status, priority: dto.priority, assignmentType: dto.assignmentType, allowLateSubmission: dto.allowLateSubmission ?? true, requireReview: dto.requireReview ?? true,
    departmentId: dto.department?.id ?? dto.departmentId, departmentName: dto.department?.name ?? dto.departmentName,
  };
  const rawBizStatus = dto.bizStatus ?? (assignment as { derivedStatus?: TaskView['bizStatus'] } | undefined)?.derivedStatus;
  const latestDomain = latest ? ({ status: latest.status } as Submission) : undefined;
  const derived = deriveBizStatus(task, latestDomain);
  const normalized = rawBizStatus && ['NOT_STARTED','IN_PROGRESS','PENDING_REVIEW','COMPLETED','REJECTED','DUE_SOON','OVERDUE','APPROVED'].includes(rawBizStatus) ? rawBizStatus : derived;
  return { ...task, bizStatus: normalized, statusNote: dto.statusNote ?? statusNoteOf(normalized, task.deadline), assignmentId: assignment?.id, assignmentStatus: status,
    assignment: assignment ? { id: assignment.id, taskId: assignment.taskId ?? dto.id, userId: assignment.userId ?? task.ownerId, status: assignment.status, required: assignment.required ?? true, createdAt: assignment.createdAt, updatedAt: assignment.updatedAt } : undefined,
    submissionStatus: latest?.status, latestSubmissionId: latest?.id, latestVersion: latest?.version ?? dto.latestVersion, rejectSummary: latest?.reviewOpinion };
}
