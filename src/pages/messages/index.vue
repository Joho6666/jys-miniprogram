<template>
  <view class="page">
    <app-nav-bar title="消息提醒" :show-back="false" />

    <view class="header">
      <view class="header__left">
        <text class="header__title">工作通知</text>
        <text v-if="unreadCount" class="header__badge">{{ unreadCount }} 条未读</text>
      </view>
      <text
        class="header__action"
        :class="{ 'header__action--disabled': !unreadCount }"
        hover-class="header__action--hover"
        @tap="markAll"
      >
        全部已读
      </text>
    </view>

    <filter-tabs :items="tabs" :model-value="messageStore.filter" @change="onFilterChange" />

    <view class="list">
      <loading-state v-if="messageStore.loading" />
      <error-state v-else-if="messageStore.error && !messageStore.messages.length" :desc="messageStore.error" @retry="reload" />
      <empty-state v-else-if="!filtered.length" title="暂无消息" desc="任务通知与审核结果会在这里提醒你。" />
      <message-row
        v-for="message in filtered"
        v-else
        :key="message.id"
        :message="message"
        :action-label="actionLabelOf(message)"
        @tap="onMessageTap(message)"
        @action="onMessageAction(message)"
      />
      <view v-if="messageStore.loadingMore" class="list__footer">加载中…</view>
      <view v-else-if="messageStore.error && messageStore.messages.length" class="list__footer list__footer--retry" @tap="messageStore.loadMore()">加载失败，点击重试</view>
      <view v-else-if="!messageStore.hasMore && messageStore.messages.length" class="list__footer">没有更多了</view>
    </view>

    <app-tab-bar current="messages" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import type { Message, MessageFilterKey } from '@/types';
import { MESSAGE_FILTERS, useMessageStore } from '@/stores/message';
import { usePageShare } from '@/services/share';

usePageShare(() => ({ title: '消息提醒 · 教研室事务助手', path: '/pages/messages/index' }));

const messageStore = useMessageStore();

const filtered = computed(() => messageStore.filtered);
const unreadCount = computed(() => messageStore.unreadCount);

/** 标签页（含计数） */
const tabs = computed(() =>
  MESSAGE_FILTERS.map((item) => ({
    key: item.key,
    label: item.label,
    count: countOf(item.key),
  })),
);

onShow(async () => {
  await messageStore.loadMessages();
});
onPullDownRefresh(async () => { await messageStore.loadMessages(true); uni.stopPullDownRefresh(); });
onReachBottom(() => { void messageStore.loadMore(); });

function countOf(key: MessageFilterKey): number {
  if (key === 'ALL') return messageStore.counts.ALL;
  if (key === 'TASK') return messageStore.counts.TASK;
  if (key === 'REVIEW') return messageStore.counts.REVIEW;
  return messageStore.counts.SYSTEM;
}

function onFilterChange(key: string): void {
  messageStore.setFilter(key as MessageFilterKey);
}

function actionLabelOf(message: Message): string {
  if (message.event === 'NEW_TASK' || message.event === 'DUE_SOON') return '去处理';
  if (message.event === 'REVIEW_REJECTED') return '去修改';
  return '查看详情';
}

function reload(): void {
  void messageStore.loadMessages(true);
}

async function markAll(): Promise<void> {
  if (!unreadCount.value) {
    uni.showToast({ title: '暂无未读消息', icon: 'none' });
    return;
  }
  await messageStore.markAllRead();
  uni.showToast({ title: '已全部标记为已读', icon: 'none' });
}

async function onMessageTap(message: Message): Promise<void> {
  if (!message.read) {
    await messageStore.markRead(message.id);
  }
  if (message.event === 'NOTICE') {
    return;
  }
  if (message.submissionId) {
    uni.navigateTo({ url: `/pages/submission-detail/index?submissionId=${message.submissionId}` });
    return;
  }
  if (message.taskId) {
    uni.navigateTo({ url: `/pages/task-detail/index?id=${message.taskId}` });
  }
}

async function onMessageAction(message: Message): Promise<void> {
  if (!message.read) {
    await messageStore.markRead(message.id);
  }
  if (message.event === 'REVIEW_REJECTED' && message.taskId) {
    uni.navigateTo({ url: `/pages/resubmit/index?taskId=${message.taskId}` });
    return;
  }
  if (message.event === 'NEW_TASK' || message.event === 'DUE_SOON') {
    if (message.taskId) {
      uni.navigateTo({ url: `/pages/task-detail/index?id=${message.taskId}` });
    }
    return;
  }
  if (message.submissionId) {
    uni.navigateTo({ url: `/pages/submission-detail/index?submissionId=${message.submissionId}` });
    return;
  }
  if (message.taskId) {
    uni.navigateTo({ url: `/pages/task-detail/index?id=${message.taskId}` });
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 200rpx;
  @include safe-bottom(200rpx);
}

.header {
  @include flex-row(space-between);
  padding: 28rpx 32rpx;
  background: $surface;
}

.header__left {
  @include flex-row();
}

.header__title {
  font-size: $font-title;
  font-weight: 600;
  color: $text-1;
}

.header__badge {
  margin-left: 16rpx;
  height: 40rpx;
  padding: 0 14rpx;
  border-radius: 20rpx;
  background: $danger-bg;
  color: $danger;
  font-size: $font-xs;
  @include flex-center;
}

.header__action {
  font-size: $font-label;
  color: $primary;
  padding: 8rpx 0 8rpx 16rpx;
}

.header__action--disabled {
  color: $text-3;
}

.header__action--hover {
  opacity: 0.6;
}

.list {
  padding: 24rpx 32rpx 0;
}
.list__footer { padding: 28rpx; text-align: center; color: $text-3; font-size: $font-tag; }
.list__footer--retry { color: $primary; }
</style>
