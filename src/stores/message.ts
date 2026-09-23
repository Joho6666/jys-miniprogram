import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Message, MessageFilterKey } from '@/types';
import { fetchMessages, fetchUnreadCount, markAllMessagesRead, markMessageRead } from '@/api/message';
import { isMockMode } from '@/services/http';

export const MESSAGE_FILTERS: Array<{ key: MessageFilterKey; label: string }> = [
  { key: 'ALL', label: '全部' },
  { key: 'TASK', label: '任务通知' },
  { key: 'REVIEW', label: '审核结果' },
  { key: 'SYSTEM', label: '系统消息' },
];

export const useMessageStore = defineStore('message', () => {
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const error = ref('');
  const filter = ref<MessageFilterKey>('ALL');
  const page = ref(1); const pageSize = ref(20); const hasMore = ref(true); const loadingMore = ref(false); const serverUnreadCount = ref<number | null>(null);

  const unreadCount = computed(() => serverUnreadCount.value ?? messages.value.filter((m) => !m.read).length);

  const filtered = computed(() => {
    if (filter.value === 'ALL') return messages.value;
    return messages.value.filter((m) => m.type === filter.value);
  });

  /** 各分类计数（用于 chips 角标） */
  const counts = computed(() => ({
    ALL: messages.value.length,
    TASK: messages.value.filter((m) => m.type === 'TASK').length,
    REVIEW: messages.value.filter((m) => m.type === 'REVIEW').length,
    SYSTEM: messages.value.filter((m) => m.type === 'SYSTEM').length,
  }));

  /** 首页「最近动态」：最新两条业务动态（跳过系统通知） */
  const recentActivities = computed(() => messages.value.filter((m) => m.type !== 'SYSTEM').slice(0, 2));

  async function loadMessages(force = false): Promise<void> {
    if (messages.value.length && !force) return;
    loading.value = true;
    error.value = '';
    try {
      const result = await fetchMessages(1, pageSize.value); messages.value = result.items; page.value = 1; hasMore.value = result.hasMore;
      await loadUnreadCount();
    } catch (e) {
      error.value = e instanceof Error ? e.message : '消息加载失败';
    } finally {
      loading.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (loadingMore.value || !hasMore.value) return; loadingMore.value = true;
    try { const nextPage = page.value + 1; const result = await fetchMessages(nextPage, pageSize.value); messages.value = [...messages.value, ...result.items]; page.value = result.page; hasMore.value = result.hasMore; }
    catch (e) { error.value = e instanceof Error ? e.message : '加载更多失败'; }
    finally { loadingMore.value = false; }
  }

  async function loadUnreadCount(): Promise<void> { try { serverUnreadCount.value = await fetchUnreadCount(); } catch { if (!isMockMode()) serverUnreadCount.value = null; } }

  async function markRead(messageId: string): Promise<void> {
    const target = messages.value.find((m) => m.id === messageId);
    if (target) {
      target.read = true;
      if (serverUnreadCount.value !== null) serverUnreadCount.value = Math.max(0, serverUnreadCount.value - 1);
    }
    await markMessageRead(messageId);
  }

  async function markAllRead(): Promise<void> {
    messages.value.forEach((m) => {
      m.read = true;
    });
    serverUnreadCount.value = 0;
    await markAllMessagesRead();
  }

  function setFilter(next: MessageFilterKey): void {
    filter.value = next;
  }

  function getById(messageId: string): Message | undefined {
    return messages.value.find((m) => m.id === messageId);
  }

  function reset(): void { messages.value = []; filter.value = 'ALL'; page.value = 1; hasMore.value = true; serverUnreadCount.value = 0; error.value = ''; }

  return {
    messages,
    loading,
    error,
    filter,
    page, pageSize, hasMore, loadingMore,
    unreadCount,
    filtered,
    counts,
    recentActivities,
    loadMessages,
    loadMore, loadUnreadCount,
    markRead,
    markAllRead,
    setFilter,
    getById,
    reset,
  };
});
