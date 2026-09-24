<template>
  <view class="page">
    <!-- 品牌区 -->
    <view class="hero">
      <view class="hero__overlay" />
      <view class="hero__circle hero__circle--lg" />
      <view class="hero__circle hero__circle--sm" />
      <app-nav-bar title="" :show-back="false" transparent theme="dark" />
      <view class="hero__body">
        <view class="hero__brand">
          <text class="hero__brand-name">教研室事务助手</text>
          <text class="hero__brand-tag">教师端</text>
        </view>
        <text class="hero__brand-sub">高效处理教研事务 · 助力教学发展</text>
        <view class="hero__greeting">
          <text>{{ greetingText }}，</text><text class="hero__name">{{ displayName }}</text><text>！</text>
        </view>
        <text class="hero__date">{{ dateText }}</text>
        <view class="hero__sub">
          <text>今天有 </text><text class="hero__count">{{ stats.todo }}</text><text> 项事务待处理，继续加油！</text>
        </view>
      </view>
      <view class="hero__art">
        <campus-art variant="hero" tone="soft" />
      </view>
    </view>

    <!-- 四列统计 -->
    <view class="stats">
      <view class="stats__row">
        <view class="stats__cell"><stat-card label="我的待办" :value="stats.todo" tone="primary" icon="list" @tap="goTasks('ALL')" /></view>
        <view class="stats__cell"><stat-card label="即将截止" :value="stats.dueSoon" tone="warning" icon="calendar" @tap="goTasks('DUE_SOON')" /></view>
        <view class="stats__cell"><stat-card label="已完成" :value="stats.completed" tone="success" icon="checkmarkempty" @tap="goTasks('COMPLETED')" /></view>
        <view class="stats__cell"><stat-card label="逾期任务" :value="stats.overdue" tone="danger" icon="info" @tap="goTasks('OVERDUE')" /></view>
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
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { IconTone, Message, TaskView } from '@/types';
import { useMessageStore } from '@/stores/message';
import { useUserStore } from '@/stores/user';
import { useDashboardStore } from '@/stores/dashboard';
import { isMockMode } from '@/services/http';
import { fetchTasks } from '@/api/task';
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

const messageStore = useMessageStore();
const userStore = useUserStore();
const dashboard = useDashboardStore();

const stats = computed(() => ({ todo: dashboard.data.todoCount, dueSoon: dashboard.data.dueSoonCount, pendingReview: dashboard.data.pendingReviewCount, completed: dashboard.data.completedCount, rejected: dashboard.data.rejectedCount, overdue: dashboard.data.overdueCount }));
const urgentTasks = computed(() => dashboard.data.urgentTasks.slice(0, 2));
const rejectedTask = ref<TaskView | null>(null);
const rejectedCount = computed(() => dashboard.data.rejectedCount);
const activities = computed(() => dashboard.data.recentActivities.length ? dashboard.data.recentActivities : messageStore.recentActivities);

const displayName = computed(() => userStore.current?.name ?? (isMockMode() ? '张老师' : ''));
const greetingText = computed(() => greeting());
const dateText = computed(() => todayText());
onShow(async () => {
  const results = await Promise.all([userStore.load(), dashboard.load(), messageStore.loadMessages(), fetchTasks({ page: 1, size: 1, status: 'REJECTED' })]);
  rejectedTask.value = results[3].items[0] ?? null;
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
  background:
    radial-gradient(circle at 82% 20%, rgba(255, 255, 255, 0.82), transparent 25%),
    linear-gradient(145deg, #f1f9ff 0%, #dcefff 58%, #edf7ff 100%);
  /* 底部留出剪影带的高度，文案与剪影互不重叠 */
  padding-bottom: 196rpx;
}

.hero__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(105deg, rgba(255, 255, 255, 0.2), transparent 64%);
}

/* 装饰圆：同色系白色透明度，不引入新色相 */
.hero__circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.32);
}

.hero__circle--lg {
  width: 320rpx;
  height: 320rpx;
  top: -140rpx;
  right: -70rpx;
  border: 1rpx solid rgba(22, 119, 255, 0.08);
  box-shadow: 0 0 0 34rpx rgba(255, 255, 255, 0.26), 0 0 0 72rpx rgba(255, 255, 255, 0.16);
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
  font-size: 30rpx;
  font-weight: 600;
  color: $text-1;
  letter-spacing: 2rpx;
}

.hero__brand-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  letter-spacing: 1rpx;
  color: $text-2;
}

.hero__brand-tag {
  margin-left: 14rpx;
  height: 34rpx;
  padding: 0 14rpx;
  border-radius: 17rpx;
  border: 1rpx solid rgba(22, 119, 255, 0.18);
  background: rgba(255, 255, 255, 0.58);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.7);
  font-size: 20rpx;
  color: $primary;
  line-height: 32rpx;
}

.hero__greeting {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  margin-top: 30rpx;
  font-size: 46rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
  color: $text-1;
}

.hero__name,
.hero__count {
  color: $primary;
  font-weight: 700;
}

.hero__date {
  display: block;
  margin-top: 14rpx;
  font-size: 25rpx;
  color: $text-2;
}

.hero__sub {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: $text-2;
}

/* 剪影贴在品牌区底边，占满整条底带（与设计稿的校园底图构图一致） */
.hero__art {
  position: absolute;
  right: 24rpx;
  bottom: -6rpx;
  z-index: 1;
  opacity: 0.84;
  transform: scale(1.06);
  transform-origin: right bottom;
}

/* ---------- 统计 ---------- */
.stats {
  position: relative;
  z-index: 3;
  padding: 16rpx;
  margin: -30rpx 20rpx 0;
  border: 1rpx solid rgba(229, 231, 235, 0.9);
  border-radius: 26rpx;
  background: $surface;
  box-shadow: 0 14rpx 38rpx rgba(29, 33, 41, 0.075);
}

.stats__row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.stats__cell {
  flex: 1;
  min-width: 0;
}

.stats__cell + .stats__cell {
  margin-left: 12rpx;
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
  margin: 28rpx 32rpx 0;
  padding: 22rpx 24rpx;
  border: 1rpx solid $danger-border;
  border-left-width: 6rpx;
  background: $danger-bg;
  border-radius: 18rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 77, 79, 0.06);
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
  border: 1rpx solid $border;
  border-radius: 20rpx;
  padding: 24rpx 0;
  box-shadow: 0 8rpx 24rpx rgba(29, 33, 41, 0.035);
}

.grid__item {
  flex: 1;
  @include flex-center;
  flex-direction: column;
}

.grid__item + .grid__item {
  border-left: 1rpx solid $border;
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
  border: 1rpx solid $border;
  border-radius: 20rpx;
  padding: 0 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(29, 33, 41, 0.035);
}

.activity__row {
  @include flex-row(space-between);
  height: 96rpx;
}

.activity__row + .activity__row {
  border-top: 1rpx solid $border;
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
