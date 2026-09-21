<template>
  <view class="page">
    <app-nav-bar title="消息" :show-back="false" />

    <view class="header">
      <view class="header__left">
        <text class="header__title">工作通知</text>
        <text v-if="unreadCount" class="header__badge">{{ unreadCount }} 条未读</text>
      </view>
      <view class="header__action" hover-class="header__action--hover" @tap="markAll">
        <text class="header__action-text" :class="{ 'header__action-text--disabled': !unreadCount }">全部已读</text>
      </view>
    </view>

    <scroll-view class="chips" scroll-x :show-scrollbar="false">
      <view class="chips__inner">
        <filter-chip
          v-for="item in MESSAGE_FILTERS"
          :key="item.key"
          :label="item.label"
          :count="countOf(item.key)"
          :active="messageStore.filter === item.key"
          @tap="messageStore.setFilter(item.key)"
        />
      </view>
    </scroll-view>

    <view class="list">
      <loading-state v-if="messageStore.loading" />
      <error-state v-else-if="messageStore.error" :desc="messageStore.error" @retry="reload" />
      <empty-state v-else-if="!filtered.length" title="暂无消息" desc="任务提醒与审核结果会在这里通知你。" />
      <message-row
        v-for="message in filtered"
        v-else
        :key="message.id"
        :message="message"
        :action-label="actionLabelOf(message)"
        @tap="onMessageTap(message)"
        @action="onMessageAction(message)"
      />
    </view>

    <app-tab-bar current="messages" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { Message, MessageFilterKey } from '@/types';
import { MESSAGE_FILTERS, useMessageStore } from '@/stores/message';

const messageStore = useMessageStore();

const filtered = computed(() => messageStore.filtered);
const unreadCount = computed(() => messageStore.unreadCount);

onShow(async () => {
  await messageStore.loadMessages();
});

function countOf(key: MessageFilterKey): number {
  if (key === 'ALL') return messageStore.counts.ALL;
  if (key === 'TASK') return messageStore.counts.TASK;
  if (key === 'REVIEW') return messageStore.counts.REVIEW;
  return messageStore.counts.SYSTEM;
}

function actionLabelOf(message: Message): string {
  if (message.event === 'NEW_TASK' || message.event === 'DUE_SOON') return '去处理';
  if (message.event === 'REVIEW_REJECTED') return '去修改';
  if (message.event === 'SUBMITTED' || message.event === 'REVIEW_APPROVED') return '查看详情';
  return '';
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
  padding: 28rpx 32rpx 0;
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
  height: 60rpx;
  padding: 0 20rpx;
  border: 1rpx solid $border;
  border-radius: 30rpx;
  @include flex-center;
}

.header__action--hover {
  background: $bg;
}

.header__action-text {
  font-size: $font-tag;
  color: $text-2;
}

.header__action-text--disabled {
  color: $text-3;
}

.chips {
  margin-top: 24rpx;
  white-space: nowrap;
  width: 100%;
}

.chips__inner {
  display: inline-flex;
  flex-direction: row;
  padding: 0 32rpx 8rpx;
}

.list {
  padding: 24rpx 32rpx 0;
}
</style>
