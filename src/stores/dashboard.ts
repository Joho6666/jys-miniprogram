import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchDashboard, type DashboardSummary } from '@/api/dashboard';
export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<DashboardSummary>({ todoCount: 0, dueSoonCount: 0, pendingReviewCount: 0, completedCount: 0, rejectedCount: 0, overdueCount: 0, urgentTasks: [], recentActivities: [] });
  const loading = ref(false); const error = ref(''); const loaded = ref(false);
  async function load(force = false): Promise<void> { if (loading.value || (!force && loaded.value)) return; loading.value = true; error.value = ''; try { data.value = await fetchDashboard(); loaded.value = true; } catch (e) { error.value = e instanceof Error ? e.message : '首页数据加载失败'; } finally { loading.value = false; } }
  function reset(): void { data.value = { todoCount: 0, dueSoonCount: 0, pendingReviewCount: 0, completedCount: 0, rejectedCount: 0, overdueCount: 0, urgentTasks: [], recentActivities: [] }; error.value = ''; loaded.value = false; }
  return { data, loading, error, load, reset };
});
