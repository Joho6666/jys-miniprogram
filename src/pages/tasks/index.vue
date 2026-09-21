<template>
  <view class="page">
    <app-nav-bar title="我的任务" :show-back="false" />

    <view class="toolbar">
      <search-bar
        :model-value="taskStore.keyword"
        placeholder="搜索任务名称或负责人"
        @update:model-value="taskStore.setKeyword"
        @clear="taskStore.clearKeyword()"
      />
      <scroll-view class="chips" scroll-x :show-scrollbar="false">
        <view class="chips__inner">
          <filter-chip
            v-for="item in TASK_FILTERS"
            :key="item.key"
            :label="item.label"
            :count="countOf(item.key)"
            :active="taskStore.filter === item.key"
            @tap="taskStore.setFilter(item.key)"
          />
        </view>
      </scroll-view>
    </view>

    <view class="list">
      <loading-state v-if="taskStore.loading" />
      <error-state v-else-if="taskStore.error" :desc="taskStore.error" @retry="reload" />
      <empty-state
        v-else-if="!filtered.length"
        :title="emptyTitle"
        :desc="emptyDesc"
        action-text="查看全部任务"
        @action="resetFilters"
      />
      <task-card
        v-for="task in filtered"
        v-else
        :key="task.id"
        :task="task"
        @tap="gotoTaskDetail(task.id)"
        @action="runTaskPrimaryAction(task)"
      />
    </view>

    <app-tab-bar current="tasks" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import type { TaskFilterKey } from '@/types';
import { TASK_FILTERS, useTaskStore } from '@/stores/task';
import { gotoTaskDetail, runTaskPrimaryAction } from '@/services/navigation';

const taskStore = useTaskStore();

const filtered = computed(() => taskStore.filtered);

const emptyTitle = computed(() => (taskStore.keyword.trim() ? '没有找到匹配的任务' : '当前分类暂无任务'));
const emptyDesc = computed(() => (taskStore.keyword.trim() ? '试试更换关键词或查看全部分类。' : '切换其他筛选条件看看。'));

onLoad((query) => {
  const preset = query && typeof query.filter === 'string' ? (query.filter as TaskFilterKey) : undefined;
  if (preset && TASK_FILTERS.some((f) => f.key === preset)) {
    taskStore.setFilter(preset);
  }
});

onShow(async () => {
  await taskStore.loadTasks();
});

function countOf(key: TaskFilterKey): number {
  const map: Record<TaskFilterKey, string[]> = {
    ALL: [],
    DUE_SOON: ['DUE_SOON', 'OVERDUE'],
    IN_PROGRESS: ['IN_PROGRESS', 'NOT_STARTED'],
    PENDING_REVIEW: ['PENDING_REVIEW'],
    REJECTED: ['REJECTED'],
    COMPLETED: ['COMPLETED', 'APPROVED'],
  };
  const statuses = map[key];
  if (!statuses.length) return taskStore.tasks.length;
  return taskStore.tasks.filter((t) => statuses.includes(t.bizStatus)).length;
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

.chips {
  margin-top: 24rpx;
  white-space: nowrap;
  width: 100%;
}

.chips__inner {
  display: inline-flex;
  flex-direction: row;
  padding-bottom: 8rpx;
}

.list {
  padding: 24rpx 32rpx 0;
}
</style>
