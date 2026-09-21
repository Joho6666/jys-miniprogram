<template>
  <view class="page">
    <!-- 品牌区 -->
    <view class="hero">
      <app-nav-bar title="" :show-back="false" transparent theme="light" />
      <view class="hero__body">
        <text class="hero__greeting">{{ greetingText }}，{{ displayName }}！</text>
        <text class="hero__sub">{{ dateText }} · 共 {{ stats.todo }} 项事务待处理</text>
      </view>
    </view>

    <!-- 统计 -->
    <view class="stats">
      <view class="stats__card">
        <stat-card label="待办" :value="stats.todo" tone="primary" @tap="goTasks('ALL')" />
        <view class="stats__split" />
        <stat-card label="即将截止" :value="stats.dueSoon" tone="warning" @tap="goTasks('DUE_SOON')" />
        <view class="stats__split" />
        <stat-card label="待审核" :value="stats.pendingReview" tone="warning" @tap="goTasks('PENDING_REVIEW')" />
        <view class="stats__split" />
        <stat-card label="已完成" :value="stats.completed" tone="success" @tap="goTasks('COMPLETED')" />
      </view>
    </view>

    <view class="page__body">
      <!-- 驳回提醒 -->
      <view v-if="rejectedTask" class="alert" @tap="goRejected(rejectedTask)">
        <view class="alert__bar" />
        <view class="alert__main">
          <text class="alert__title">{{ rejectedCount }} 项材料需要修改</text>
          <text class="alert__desc">{{ rejectedTask.rejectSummary || '请查看审核意见后重新提交。' }}</text>
        </view>
        <text class="alert__action">查看意见</text>
      </view>

      <!-- 即将截止 -->
      <template v-if="urgentTasks.length">
        <section-header title="即将截止" more-text="全部任务" @more="goTasks('ALL')" />
        <view class="page__section">
          <task-card
            v-for="task in urgentTasks"
            :key="task.id"
            :task="task"
            @tap="goDetail(task)"
            @action="goDetail(task)"
          />
        </view>
      </template>

      <!-- 常用功能 -->
      <section-header title="常用功能" />
      <view class="page__section">
        <view class="grid">
          <view v-for="entry in ENTRIES" :key="entry.key" class="grid__item" hover-class="grid__item--hover" @tap="goEntry(entry)">
            <view class="grid__icon">
              <text class="grid__icon-text">{{ entry.iconText }}</text>
            </view>
            <text class="grid__label">{{ entry.label }}</text>
          </view>
        </view>
      </view>

      <!-- 最近动态 -->
      <template v-if="activities.length">
        <section-header title="最近动态" more-text="消息通知" @more="goEntry(ENTRIES[2])" />
        <view class="page__section">
          <view class="activity">
            <view v-for="item in activities" :key="item.id" class="activity__row" hover-class="activity__row--hover" @tap="goMessage(item)">
              <text class="activity__title">{{ item.title }}</text>
              <text class="activity__time">{{ relativeTime(item.time) }}</text>
            </view>
          </view>
        </view>
      </template>
    </view>

    <app-tab-bar current="home" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { Message, TaskView } from '@/types';
import { useMessageStore } from '@/stores/message';
import { useTaskStore } from '@/stores/task';
import { useUserStore } from '@/stores/user';
import { greeting, relativeTime, todayText } from '@/services/format';

interface EntryItem {
  key: string;
  label: string;
  iconText: string;
  url: string;
}

const ENTRIES: EntryItem[] = [
  { key: 'tasks', label: '我的任务', iconText: '任', url: '/pages/tasks/index' },
  { key: 'submissions', label: '提交记录', iconText: '提', url: '/pages/submissions/index' },
  { key: 'messages', label: '消息通知', iconText: '消', url: '/pages/messages/index' },
  { key: 'profile', label: '个人中心', iconText: '我', url: '/pages/profile/index' },
];

const taskStore = useTaskStore();
const messageStore = useMessageStore();
const userStore = useUserStore();

const stats = computed(() => taskStore.stats);
const urgentTasks = computed(() => taskStore.urgentTasks.slice(0, 2));
const rejectedTask = computed(() => taskStore.rejectedTasks[0]);
const rejectedCount = computed(() => taskStore.rejectedTasks.length);
const activities = computed(() => messageStore.recentActivities);

const displayName = computed(() => userStore.current?.name ?? '张老师');
const greetingText = computed(() => greeting());
const dateText = computed(() => todayText());

onShow(async () => {
  await Promise.all([userStore.load(), taskStore.loadTasks(), messageStore.loadMessages()]);
});

function goTasks(filter: string): void {
  uni.reLaunch({ url: `/pages/tasks/index?filter=${filter}` });
}

function goRejected(task: TaskView): void {
  if (task.bizStatus === 'REJECTED') {
    uni.navigateTo({ url: `/pages/resubmit/index?taskId=${task.id}` });
    return;
  }
  uni.reLaunch({ url: '/pages/tasks/index?filter=REJECTED' });
}

function goDetail(task: TaskView): void {
  uni.navigateTo({ url: `/pages/task-detail/index?id=${task.id}` });
}

function goEntry(entry: EntryItem): void {
  if (entry.key === 'profile' || entry.key === 'tasks' || entry.key === 'messages') {
    uni.reLaunch({ url: entry.url });
    return;
  }
  uni.navigateTo({ url: entry.url });
}

function goMessage(message: Message): void {
  if (message.submissionId) {
    uni.navigateTo({ url: `/pages/submission-detail/index?submissionId=${message.submissionId}` });
    return;
  }
  if (message.taskId) {
    uni.navigateTo({ url: `/pages/task-detail/index?id=${message.taskId}` });
    return;
  }
  uni.reLaunch({ url: '/pages/messages/index' });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 160rpx;
  @include safe-bottom(160rpx);
}

/* ---------- 品牌区 ---------- */
.hero {
  background: $primary;
  padding-bottom: 120rpx;
}

.hero__body {
  padding: 8rpx 32rpx 0;
}

.hero__greeting {
  display: block;
  font-size: 44rpx;
  font-weight: 600;
  color: $white;
}

.hero__sub {
  display: block;
  margin-top: 16rpx;
  font-size: $font-label;
  color: rgba(255, 255, 255, 0.85);
}

/* ---------- 统计 ---------- */
.stats {
  padding: 0 32rpx;
  margin-top: -88rpx;
}

.stats__card {
  display: flex;
  flex-direction: row;
  background: $surface;
  border-radius: $radius-card;
  padding: 28rpx 8rpx;
}

.stats__split {
  width: 1rpx;
  background: $border;
  margin: 8rpx 0;
}

/* ---------- 主体 ---------- */
.page__body {
  padding-bottom: 20rpx;
}

.page__section {
  padding: 0 32rpx;
}

/* ---------- 驳回提醒 ---------- */
.alert {
  @include flex-row();
  margin: 24rpx 32rpx 0;
  padding: 24rpx;
  background: $danger-bg;
  border-radius: $radius-card;
}

.alert__bar {
  width: 6rpx;
  height: 100%;
  min-height: 64rpx;
  border-radius: 4rpx;
  background: $danger;
  flex-shrink: 0;
}

.alert__main {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.alert__title {
  display: block;
  font-size: $font-body;
  font-weight: 500;
  color: $danger;
}

.alert__desc {
  display: block;
  margin-top: 8rpx;
  font-size: $font-tag;
  color: $text-2;
  @include ellipsis(2);
}

.alert__action {
  font-size: $font-tag;
  color: $danger;
  margin-left: 16rpx;
  flex-shrink: 0;
}

/* ---------- 常用功能 ---------- */
.grid {
  display: flex;
  flex-direction: row;
  background: $surface;
  border-radius: $radius-card;
  padding: 28rpx 0;
}

.grid__item {
  flex: 1;
  @include flex-center;
  flex-direction: column;
}

.grid__item--hover {
  background: $pressed;
}

.grid__icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: $primary-light;
  @include flex-center;
}

.grid__icon-text {
  font-size: 30rpx;
  font-weight: 600;
  color: $primary;
}

.grid__label {
  margin-top: 14rpx;
  font-size: $font-tag;
  color: $text-2;
}

/* ---------- 最近动态 ---------- */
.activity {
  background: $surface;
  border-radius: $radius-card;
  padding: 0 28rpx;
}

.activity__row {
  @include flex-row(space-between);
  height: 96rpx;
}

.activity__row--hover {
  background: $pressed;
}

.activity__title {
  flex: 1;
  font-size: $font-body;
  color: $text-1;
  @include ellipsis(1);
}

.activity__time {
  font-size: $font-tag;
  color: $text-3;
  margin-left: 16rpx;
  flex-shrink: 0;
}
</style>
