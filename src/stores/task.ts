import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { TaskFilterKey, TaskView } from '@/types';
import { fetchTaskDetail, fetchTasks } from '@/api/task';

/** 任务列表筛选键（与界面 chip 一一对应） */
export const TASK_FILTERS: Array<{ key: TaskFilterKey; label: string }> = [
  { key: 'ALL', label: '全部' },
  { key: 'DUE_SOON', label: '即将截止' },
  { key: 'IN_PROGRESS', label: '进行中' },
  { key: 'PENDING_REVIEW', label: '待审核' },
  { key: 'REJECTED', label: '已驳回' },
  { key: 'COMPLETED', label: '已完成' },
];

const FILTER_MAP: Record<TaskFilterKey, string[]> = {
  ALL: [],
  DUE_SOON: ['DUE_SOON', 'OVERDUE'],
  IN_PROGRESS: ['IN_PROGRESS', 'NOT_STARTED'],
  PENDING_REVIEW: ['PENDING_REVIEW'],
  REJECTED: ['REJECTED'],
  COMPLETED: ['COMPLETED', 'APPROVED'],
};

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<TaskView[]>([]);
  const detail = ref<TaskView | null>(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref('');

  const filter = ref<TaskFilterKey>('ALL');
  const keyword = ref('');

  /** 列表（筛选 + 搜索）：待办优先、按紧急度排序；已完成沉底、按最近截止排序 */
  const filtered = computed(() => {
    const closed = ['COMPLETED', 'APPROVED'];
    const statuses = FILTER_MAP[filter.value];
    const kw = keyword.value.trim();
    return tasks.value
      .filter((t) => (statuses.length ? statuses.includes(t.bizStatus) : true))
      .filter((t) => (kw ? t.title.includes(kw) || t.ownerName.includes(kw) || t.category.includes(kw) : true))
      .sort((a, b) => {
        const ca = closed.includes(a.bizStatus) ? 1 : 0;
        const cb = closed.includes(b.bizStatus) ? 1 : 0;
        if (ca !== cb) return ca - cb;
        if (a.deadline === b.deadline) return 0;
        return ca === 1
          ? a.deadline < b.deadline
            ? 1
            : -1
          : a.deadline < b.deadline
            ? -1
            : 1;
      });
  });

  /** 首页统计（全部由列表数据计算，不写死） */
  const stats = computed(() => {
    const active = tasks.value.filter((t) => ['NOT_STARTED', 'IN_PROGRESS', 'DUE_SOON', 'REJECTED', 'OVERDUE'].includes(t.bizStatus));
    return {
      todo: active.length,
      dueSoon: tasks.value.filter((t) => t.bizStatus === 'DUE_SOON').length,
      pendingReview: tasks.value.filter((t) => t.bizStatus === 'PENDING_REVIEW').length,
      completed: tasks.value.filter((t) => t.bizStatus === 'COMPLETED' || t.bizStatus === 'APPROVED').length,
      rejected: tasks.value.filter((t) => t.bizStatus === 'REJECTED').length,
      overdue: tasks.value.filter((t) => t.bizStatus === 'OVERDUE').length,
    };
  });

  /** 需要尽快处理：即将截止 + 已逾期（按截止时间升序） */
  const urgentTasks = computed(() =>
    tasks.value
      .filter((t) => t.bizStatus === 'DUE_SOON' || t.bizStatus === 'OVERDUE')
      .sort((a, b) => (a.deadline < b.deadline ? -1 : 1)),
  );

  /** 被驳回、需要修改的任务 */
  const rejectedTasks = computed(() => tasks.value.filter((t) => t.bizStatus === 'REJECTED'));

  /** 待审核任务 */
  const pendingTasks = computed(() => tasks.value.filter((t) => t.bizStatus === 'PENDING_REVIEW'));

  async function loadTasks(force = false): Promise<void> {
    if (tasks.value.length && !force) return;
    loading.value = true;
    error.value = '';
    try {
      tasks.value = await fetchTasks();
    } catch (e) {
      error.value = e instanceof Error ? e.message : '任务加载失败';
    } finally {
      loading.value = false;
    }
  }

  async function loadDetail(taskId: string): Promise<void> {
    detailLoading.value = true;
    error.value = '';
    detail.value = null;
    try {
      detail.value = await fetchTaskDetail(taskId);
    } catch (e) {
      error.value = e instanceof Error ? e.message : '任务详情加载失败';
    } finally {
      detailLoading.value = false;
    }
  }

  function getById(taskId: string): TaskView | undefined {
    return tasks.value.find((t) => t.id === taskId);
  }

  function setFilter(next: TaskFilterKey): void {
    filter.value = next;
  }

  function setKeyword(next: string): void {
    keyword.value = next;
  }

  function clearKeyword(): void {
    keyword.value = '';
  }

  return {
    tasks,
    detail,
    loading,
    detailLoading,
    error,
    filter,
    keyword,
    filtered,
    stats,
    urgentTasks,
    rejectedTasks,
    pendingTasks,
    loadTasks,
    loadDetail,
    getById,
    setFilter,
    setKeyword,
    clearKeyword,
  };
});
