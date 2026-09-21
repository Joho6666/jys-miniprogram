import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { User } from '@/types';
import { fetchCurrentUser } from '@/api/user';

export const useUserStore = defineStore('user', () => {
  const current = ref<User | null>(null);
  const loading = ref(false);
  const error = ref('');

  /** 是否已装载（页面可直接渲染） */
  const ready = computed(() => current.value !== null);

  async function load(force = false): Promise<void> {
    if (current.value && !force) return;
    loading.value = true;
    error.value = '';
    try {
      current.value = await fetchCurrentUser();
    } catch (e) {
      error.value = e instanceof Error ? e.message : '用户信息加载失败';
    } finally {
      loading.value = false;
    }
  }

  return { current, loading, error, ready, load };
});
