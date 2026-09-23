import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { PageResult, TaskView } from '@/types';

const api = vi.hoisted(() => ({ fetchTasks: vi.fn(), fetchTaskDetail: vi.fn() }));
vi.mock('@/api/task', () => api);
vi.mock('@/services/http', () => ({ isMockMode: () => false }));
import { useTaskStore } from '@/stores/task';

function view(id: string, bizStatus: TaskView['bizStatus'] = 'IN_PROGRESS'): TaskView { return { id, title: id, category: '教学建设', tags: ['教学建设'], ownerId: 'u1', ownerName: '教师', publisherId: 'u2', publisherName: '秘书', publishedAt: '', deadline: '2026-12-01', description: '', attachments: [], status: 'IN_PROGRESS', bizStatus, statusNote: '' }; }
function page(items: TaskView[], number: number, hasMore: boolean): PageResult<TaskView> { return { items, page: number, pageSize: 20, total: 40, hasMore }; }

describe('task store server filtering and pagination', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.clearAllMocks(); });
  it('requests each business filter from page one and appends later pages', async () => {
    api.fetchTasks.mockResolvedValueOnce(page([view('reject', 'REJECTED')], 1, true)).mockResolvedValueOnce(page([view('reject-2', 'REJECTED')], 2, false));
    const store = useTaskStore();
    await store.setFilter('REJECTED');
    expect(api.fetchTasks).toHaveBeenNthCalledWith(1, { page: 1, size: 20, keyword: '', status: 'REJECTED' });
    expect(store.filtered.map((task) => task.id)).toEqual(['reject']);
    await store.loadMore();
    expect(store.tasks.map((task) => task.id)).toEqual(['reject', 'reject-2']);
    expect(store.hasMore).toBe(false);
  });
  it('keeps the loaded page when load-more fails and resets the page state', async () => {
    api.fetchTasks.mockResolvedValueOnce(page([view('first')], 1, true)).mockRejectedValueOnce(new Error('offline'));
    const store = useTaskStore();
    await store.loadTasks(true);
    await store.loadMore();
    expect(store.tasks.map((task) => task.id)).toEqual(['first']);
    expect(store.error).toBe('offline');
    store.reset();
    expect(store.tasks).toEqual([]);
    expect(store.page).toBe(1);
    expect(store.hasMore).toBe(true);
  });
});
