<template>
  <view class="page">
    <app-nav-bar title="我的待办" :show-back="false" />

    <filter-tabs :items="tabs" :model-value="taskStore.filter" @change="onFilterChange" />

    <view class="toolbar">
      <search-bar
        :model-value="taskStore.keyword"
        placeholder="搜索任务名称或负责人"
        @update:model-value="taskStore.setKeyword"
        @clear="taskStore.clearKeyword()"
      />
    </view>

    <view class="list">
      <loading-state v-if="taskStore.loading" />
      <error-state v-else-if="taskStore.error" :desc="taskStore.error" @retry="reload" />
      <empty-state
        v-else-if="!filtered.length"
        :title="emptyTitle"
        :desc="emptyDesc"
        action-text="查看全部待办"
        @action="resetFilters"
      />
      <task-card v-for="task in filtered" v-else :key="task.id" :task="task" @tap="gotoTaskDetail(task.id)" />
    </view>

    <app-tab-bar current="tasks" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import type { TaskFilterKey } from '@/types';
import { TASK_FILTERS, useTaskStore } from '@/stores/task';
import { gotoTaskDetail } from '@/services/navigation';
import { usePageShare } from '@/services/share';

usePageShare(() => ({ title: '我的待办 · 教研室事务助手', path: '/pages/tasks/index' }));

const taskStore = useTaskStore();

const filtered = computed(() => taskStore.filtered);

/** 标签页（含计数） */
const tabs = computed(() =>
  TASK_FILTERS.map((item) => ({
    key: item.key,
    label: item.label,
    count: taskStore.filterCounts[item.key],
  })),
);

const emptyTitle = computed(() => (taskStore.keyword.trim() ? '没有找到匹配的任务' : '当前分类暂无待办'));
const emptyDesc = computed(() => (taskStore.keyword.trim() ? '试试更换关键词或查看全部分类。' : '切换其他标签看看。'));

onLoad((query) => {
  const preset = query && typeof query.filter === 'string' ? (query.filter as TaskFilterKey) : undefined;
  if (preset && TASK_FILTERS.some((f) => f.key === preset)) {
    taskStore.setFilter(preset);
  }
});

onShow(async () => {
  await taskStore.loadTasks();
});

function onFilterChange(key: string): void {
  taskStore.setFilter(key as TaskFilterKey);
}

function reload(): void {
  void taskStore.loadTasks(true);
}

function resetFilters(): void {
  taskStore.setFilter('ALL');
  taskStore.clearKeyword();
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 200rpx;
  @include safe-bottom(200rpx);
}

.toolbar {
  padding: 24rpx 32rpx 0;
}

.list {
  padding: 24rpx 32rpx 0;
}
</style>
