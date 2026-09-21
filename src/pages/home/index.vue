<template>
  <view class="page">
    <!-- 品牌区 -->
    <view class="hero">
      <view class="hero__overlay" />
      <view class="hero__circle hero__circle--lg" />
      <view class="hero__circle hero__circle--sm" />
      <app-nav-bar title="" :show-back="false" transparent theme="light" />
      <view class="hero__body">
        <view class="hero__brand">
          <text class="hero__brand-name">教研室事务助手</text>
          <text class="hero__brand-tag">教师端</text>
        </view>
        <text class="hero__greeting">{{ greetingText }}，{{ displayName }}！</text>
        <text class="hero__sub">今天是{{ dateText }}，{{ todoHint }}</text>
      </view>
      <view class="hero__art">
        <campus-art variant="hero" tone="light" />
      </view>
    </view>

    <!-- 2×2 统计 -->
    <view class="stats">
      <view class="stats__row">
        <stat-card label="我的待办" :value="stats.todo" tone="primary" icon="list" @tap="goTasks('ALL')" />
        <stat-card label="即将截止" :value="stats.dueSoon" tone="warning" icon="calendar" @tap="goTasks('DUE_SOON')" />
      </view>
      <view class="stats__row">
        <stat-card label="已完成" :value="stats.completed" tone="success" icon="checkmarkempty" @tap="goTasks('COMPLETED')" />
        <stat-card label="逾期任务" :value="stats.overdue" tone="danger" icon="info" @tap="goTasks('URGENT')" />
      </view>
    </view>

    <view class="page__body">
      <!-- 驳回提醒 -->
      <view v-if="rejectedTask" class="alert" hover-class="alert--hover" @tap="goRejected(rejectedTask)">
        <app-icon name="info" tone="danger" variant="soft" size="md" radius="circle" />
        <view class="alert__main">
          <text class="alert__title">{{ rejectedCount }} 项材料需要修改</text>
          <text class="alert__desc">{{ rejectedTask.rejectSummary || '请查看审核意见后重新提交。' }}</text>
        </view>
        <text class="alert__action">查看意见</text>
      </view>

      <!-- 即将截止 -->
      <template v-if="urgentTasks.length">
        <section-header title="即将截止" more-text="我的待办" @more="goTasks('ALL')" />
        <view class="page__section">
          <task-card v-for="task in urgentTasks" :key="task.id" :task="task" @tap="goDetail(task)" />
        </view>
      </template>

      <!-- 常用功能 -->
      <section-header title="常用功能" more-text="全部服务" @more="goTasks('ALL')" />
      <view class="page__section">
        <view class="grid">
          <view
            v-for="entry in ENTRIES"
            :key="entry.key"
            class="grid__item"
            hover-class="grid__item--hover"
            @tap="goEntry(entry)"
          >
            <app-icon :name="entry.icon" :tone="entry.tone" variant="soft" size="lg" radius="circle" />
            <text class="grid__label">{{ entry.label }}</text>
          </view>
        </view>
      </view>

      <!-- 最近动态 -->
      <template v-if="activities.length">
        <section-header title="最近动态" more-text="消息提醒" @more="goEntry(MESSAGE_ENTRY)" />
        <view class="page__section">
          <view class="activity">
            <view
              v-for="item in activities"
              :key="item.id"
              class="activity__row"
              hover-class="activity__row--hover"
              @tap="goMessage(item)"
            >
              <text class="activity__title">{{ item.title }}</text>
              <text class="activity__time">{{ relativeTime(item.time) }}</text>
            </view>
          </view>
        </view>
      </template>

      <!-- 教研心语 -->
      <view class="page__section quote">
        <quote-card />
      </view>
    </view>

    <app-tab-bar current="home" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { IconTone, Message, TaskView } from '@/types';
import { useMessageStore } from '@/stores/message';
import { useTaskStore } from '@/stores/task';
import { useUserStore } from '@/stores/user';
import { greeting, relativeTime, todayText } from '@/services/format';
import { usePageShare } from '@/services/share';

usePageShare(() => ({ title: '教研室事务助手 · 教师端', path: '/pages/home/index' }));

interface EntryItem {
  key: string;
  label: string;
  icon: string;
  tone: IconTone;
  url: string;
  /** 主 tab 页需用 reLaunch 切换 */
  tab?: boolean;
}

const ENTRIES: EntryItem[] = [
  { key: 'tasks', label: '任务中心', icon: 'list', tone: 'primary', url: '/pages/tasks/index', tab: true },
  { key: 'submissions', label: '材料上传', icon: 'cloud-upload', tone: 'success', url: '/pages/submissions/index' },
  { key: 'messages', label: '消息通知', icon: 'notification', tone: 'warning', url: '/pages/messages/index', tab: true },
  { key: 'profile', label: '办事指南', icon: 'paperplane', tone: 'primary', url: '/pages/profile/index', tab: true },
];

const MESSAGE_ENTRY = ENTRIES[2];

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
const todoHint = computed(() =>
  stats.value.todo > 0 ? `有 ${stats.value.todo} 项事务待处理，继续加油！` : '暂无待办事务，一切顺利！',
);

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
  if (entry.tab) {
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
  position: relative;
  overflow: hidden;
  background: $primary;
  padding-bottom: 108rpx;
}

.hero__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $hero-overlay;
}

/* 装饰圆：同色系白色透明度，不引入新色相 */
.hero__circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.hero__circle--lg {
  width: 320rpx;
  height: 320rpx;
  top: -140rpx;
  right: -70rpx;
}

.hero__circle--sm {
  width: 140rpx;
  height: 140rpx;
  top: 130rpx;
  left: -60rpx;
}

.hero__body {
  position: relative;
  z-index: 2;
  padding: 8rpx 32rpx 0;
}

.hero__brand {
  @include flex-row();
}

.hero__brand-name {
  font-size: $font-label;
  font-weight: 600;
  color: $white;
  letter-spacing: 2rpx;
}

.hero__brand-tag {
  margin-left: 14rpx;
  height: 34rpx;
  padding: 0 14rpx;
  border-radius: 17rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.55);
  font-size: 20rpx;
  color: $white;
  line-height: 32rpx;
}

.hero__greeting {
  display: block;
  margin-top: 28rpx;
  font-size: 48rpx;
  font-weight: 600;
  color: $white;
}

.hero__sub {
  display: block;
  margin-top: 16rpx;
  font-size: $font-label;
  color: rgba(255, 255, 255, 0.86);
}

.hero__art {
  position: absolute;
  right: 20rpx;
  bottom: 96rpx;
  z-index: 1;
  opacity: 0.9;
}

/* ---------- 统计 ---------- */
.stats {
  position: relative;
  z-index: 3;
  padding: 0 32rpx;
  margin-top: -76rpx;
}

.stats__row {
  display: flex;
  flex-direction: row;
  margin-bottom: 16rpx;
}

.stats__row .stat-card + .stat-card {
  margin-left: 16rpx;
}

/* ---------- 主体 ---------- */
.page__body {
  padding-bottom: 20rpx;
}

.page__section {
  padding: 0 32rpx;
}

.quote {
  margin-top: 24rpx;
}

/* ---------- 驳回提醒 ---------- */
.alert {
  @include flex-row();
  margin: 24rpx 32rpx 0;
  padding: 24rpx;
  background: $danger-bg;
  border-radius: $radius-card;
}

.alert--hover {
  opacity: 0.9;
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
  padding: 32rpx 0;
}

.grid__item {
  flex: 1;
  @include flex-center;
  flex-direction: column;
}

.grid__item--hover {
  opacity: 0.75;
}

.grid__label {
  margin-top: 16rpx;
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
