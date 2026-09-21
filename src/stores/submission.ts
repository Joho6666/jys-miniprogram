import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { SubmissionView, SubmittedFile } from '@/types';
import {
  fetchSubmissionDetail,
  fetchSubmissions,
  reviewSubmission,
  submitMaterials,
  resubmitMaterials,
} from '@/api/submission';
import { useMessageStore } from './message';
import { useTaskStore } from './task';

/** 我的提交记录状态筛选 */
export type SubmissionFilterKey = 'ALL' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export const SUBMISSION_FILTERS: Array<{ key: SubmissionFilterKey; label: string }> = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING_REVIEW', label: '待审核' },
  { key: 'APPROVED', label: '已通过' },
  { key: 'REJECTED', label: '已驳回' },
];

export const useSubmissionStore = defineStore('submission', () => {
  const submissions = ref<SubmissionView[]>([]);
  const detail = ref<SubmissionView | null>(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const submitting = ref(false);
  const error = ref('');
  const filter = ref<SubmissionFilterKey>('ALL');

  const filtered = computed(() => {
    if (filter.value === 'ALL') return submissions.value;
    return submissions.value.filter((s) => s.status === filter.value);
  });

  const counts = computed(() => ({
    ALL: submissions.value.length,
    PENDING_REVIEW: submissions.value.filter((s) => s.status === 'PENDING_REVIEW').length,
    APPROVED: submissions.value.filter((s) => s.status === 'APPROVED').length,
    REJECTED: submissions.value.filter((s) => s.status === 'REJECTED').length,
  }));

  async function loadSubmissions(force = false): Promise<void> {
    if (submissions.value.length && !force) return;
    loading.value = true;
    error.value = '';
    try {
      submissions.value = await fetchSubmissions();
    } catch (e) {
      error.value = e instanceof Error ? e.message : '提交记录加载失败';
    } finally {
      loading.value = false;
    }
  }

  async function loadDetail(submissionId: string): Promise<void> {
    detailLoading.value = true;
    detail.value = null;
    error.value = '';
    try {
      detail.value = await fetchSubmissionDetail(submissionId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : '提交详情加载失败';
    } finally {
      detailLoading.value = false;
    }
  }

  function setFilter(next: SubmissionFilterKey): void {
    filter.value = next;
  }

  /** 提交材料（首次） */
  async function submit(taskId: string, files: SubmittedFile[], note: string): Promise<string> {
    submitting.value = true;
    try {
      const submission = await submitMaterials({ taskId, files, note });
      await refreshRelated(taskId);
      return submission.id;
    } finally {
      submitting.value = false;
    }
  }

  /** 驳回后重新提交 */
  async function resubmit(taskId: string, files: SubmittedFile[], note: string): Promise<string> {
    submitting.value = true;
    try {
      const submission = await resubmitMaterials({ taskId, files, note });
      await refreshRelated(taskId);
      return submission.id;
    } finally {
      submitting.value = false;
    }
  }

  /** 模拟审核（通过 / 驳回） */
  async function review(submissionId: string, approved: boolean, opinion: string): Promise<void> {
    const result = await reviewSubmission({ submissionId, approved, opinion });
    await refreshRelated(result.taskId);
  }

  /** 状态变更后同步任务与消息（保证跨页数据一致） */
  async function refreshRelated(taskId: string): Promise<void> {
    const taskStore = useTaskStore();
    const messageStore = useMessageStore();
    await Promise.all([taskStore.loadTasks(true), loadSubmissions(true), messageStore.loadMessages(true)]);
    if (taskStore.detail && taskStore.detail.id === taskId) {
      await taskStore.loadDetail(taskId);
    }
    if (detail.value && detail.value.taskId === taskId) {
      await loadDetail(detail.value.id);
    }
  }

  return {
    submissions,
    detail,
    loading,
    detailLoading,
    submitting,
    error,
    filter,
    filtered,
    counts,
    loadSubmissions,
    loadDetail,
    setFilter,
    submit,
    resubmit,
    review,
  };
});
