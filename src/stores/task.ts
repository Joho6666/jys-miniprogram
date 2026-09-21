import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { TaskFilterKey, TaskView } from '@/types';
import { fetchTaskDetail, fetchTasks } from '@/api/task';
import { urgencyOf } from '@/services/domain';

/** 「我的待办」标签页（设计规范：全部 / 紧急 / 即将截止 / 待审核 / 已驳回 / 已完成） */
export const TASK_FILTERS: Array<{ key: TaskFilterKey; label: string }> = [
  { key: 'ALL', label: '全部' },
  { key: 'URGENT', label: '紧急' },
  { key: 'DUE_SOON', label: '即将截止' },
  { key: 'PENDING_REVIEW', label: '待审核' },
  { key: 'REJECTED', label: '已驳回' },
  { key: 'COMPLETED', label: '已完成' },
];

/** 需要教师本人推进的状态（待审核已提交、已完成均已终态，不参与紧急度筛选） */
const ACTIONABLE: string[] = ['NOT_STARTED', 'IN_PROGRESS', 'DUE_SOON', 'OVERDUE', 'REJECTED'];
/** 终态（列表沉底） */
const CLOSED: string[] = ['COMPLETED', 'APPROVED'];

const FILTER_PREDICATES: Record<TaskFilterKey, (task: TaskView) => boolean> = {
  ALL: () => true,
  URGENT: (t) => ACTIONABLE.includes(t.bizStatus) && urgencyOf(t.deadline) === 'URGENT',
  DUE_SOON: (t) => ACTIONABLE.includes(t.bizStatus) && urgencyOf(t.deadline) === 'SOON',
  PENDING_REVIEW: (t) => t.bizStatus === 'PENDING_REVIEW',
  REJECTED: (t) => t.bizStatus === 'REJECTED',
  COMPLETED: (t) => CLOSED.includes(t.bizStatus),
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
    const predicate = FILTER_PREDICATES[filter.value];
    const kw = keyword.value.trim();
    return tasks.value
      .filter((t) => predicate(t))
      .filter((t) => (kw ? t.title.includes(kw) || t.ownerName.includes(kw) || t.category.includes(kw) : true))
      .sort((a, b) => {
        const ca = CLOSED.includes(a.bizStatus) ? 1 : 0;
        const cb = CLOSED.includes(b.bizStatus) ? 1 : 0;
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

  /** 各标签页计数（角标用） */
  const filterCounts = computed(() => {
    const counts = {} as Record<TaskFilterKey, number>;
    TASK_FILTERS.forEach((item) => {
      counts[item.key] = tasks.value.filter((t) => FILTER_PREDICATES[item.key](t)).length;
    });
    return counts;
  });

  /** 首页统计（全部由列表数据计算，不写死） */
  const stats = computed(() => {
    const actionable = tasks.value.filter((t) => ACTIONABLE.includes(t.bizStatus));
    return {
      todo: actionable.length,
      dueSoon: tasks.value.filter((t) => t.bizStatus === 'DUE_SOON').length,
      pendingReview: tasks.value.filter((t) => t.bizStatus === 'PENDING_REVIEW').length,
      completed: tasks.value.filter((t) => CLOSED.includes(t.bizStatus)).length,
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
    filterCounts,
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
