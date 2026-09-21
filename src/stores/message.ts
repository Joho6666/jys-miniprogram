import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Message, MessageFilterKey } from '@/types';
import { fetchMessages, markAllMessagesRead, markMessageRead } from '@/api/message';

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

  const unreadCount = computed(() => messages.value.filter((m) => !m.read).length);

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
      messages.value = await fetchMessages();
    } catch (e) {
      error.value = e instanceof Error ? e.message : '消息加载失败';
    } finally {
      loading.value = false;
    }
  }

  async function markRead(messageId: string): Promise<void> {
    await markMessageRead(messageId);
    const target = messages.value.find((m) => m.id === messageId);
    if (target) {
      target.read = true;
    }
  }

  async function markAllRead(): Promise<void> {
    await markAllMessagesRead();
    messages.value.forEach((m) => {
      m.read = true;
    });
  }

  function setFilter(next: MessageFilterKey): void {
    filter.value = next;
  }

  function getById(messageId: string): Message | undefined {
    return messages.value.find((m) => m.id === messageId);
  }

  return {
    messages,
    loading,
    error,
    filter,
    unreadCount,
    filtered,
    counts,
    recentActivities,
    loadMessages,
    markRead,
    markAllRead,
    setFilter,
    getById,
  };
});
