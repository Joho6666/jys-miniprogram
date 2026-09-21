<template>
  <view class="page">
    <app-nav-bar title="我的" :show-back="false" />

    <!-- 个人信息 -->
    <view class="profile">
      <view class="profile__avatar">
        <text class="profile__avatar-text">{{ user?.avatarText || '张' }}</text>
      </view>
      <view class="profile__main">
        <view class="profile__name-line">
          <text class="profile__name">{{ user?.name || '张老师' }}</text>
          <text class="profile__title">{{ user?.title || '教师' }}</text>
        </view>
        <text class="profile__org">{{ user?.college || '能源与建筑环境学院' }} · {{ user?.office || '工程管理教研室' }}</text>
      </view>
    </view>

    <view class="stats">
      <view class="stats__item" @tap="goTasks('ALL')">
        <text class="stats__value">{{ taskStore.tasks.length }}</text>
        <text class="stats__label">本学期任务</text>
      </view>
      <view class="stats__split" />
      <view class="stats__item" @tap="goTasks('COMPLETED')">
        <text class="stats__value stats__value--success">{{ stats.completed }}</text>
        <text class="stats__label">已完成</text>
      </view>
      <view class="stats__split" />
      <view class="stats__item" @tap="goTasks('DUE_SOON')">
        <text class="stats__value" :class="{ 'stats__value--danger': stats.overdue > 0 }">{{ stats.overdue }}</text>
        <text class="stats__label">已逾期</text>
      </view>
    </view>

    <view class="group">
      <text class="group__title">教研与学术事务</text>
      <view class="group__card">
        <group-list-cell icon-text="提" title="我的提交记录" @tap="goSubmissions('ALL')" />
        <view class="group__line" />
        <group-list-cell icon-text="完" title="我的已完成任务" @tap="goTasks('COMPLETED')" />
        <view class="group__line" />
        <group-list-cell icon-text="审" title="审核结果" @tap="goSubmissions('APPROVED')" />
      </view>
    </view>

    <view class="group">
      <text class="group__title">通用服务</text>
      <view class="group__card">
        <group-list-cell icon-text="文" title="文件记录" @tap="notReady('文件记录')" />
        <view class="group__line" />
        <group-list-cell icon-text="消" title="消息设置" @tap="notReady('消息设置')" />
        <view class="group__line" />
        <group-list-cell icon-text="帮" title="帮助与反馈" @tap="notReady('帮助与反馈')" />
        <view class="group__line" />
        <group-list-cell icon-text="关" title="关于系统" :value="APP_VERSION" @tap="onAbout" />
      </view>
    </view>

    <view class="logout">
      <view class="logout__btn" hover-class="logout__btn--hover" @tap="logoutVisible = true">
        <text class="logout__text">退出登录</text>
      </view>
    </view>

    <app-tab-bar current="profile" />

    <confirm-modal
      :visible="logoutVisible"
      title="确认退出登录？"
      content="退出后需要重新授权登录才能继续办理教研事务。"
      confirm-text="退出登录"
      danger
      @confirm="doLogout"
      @cancel="logoutVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useTaskStore } from '@/stores/task';
import { useUserStore } from '@/stores/user';

const APP_VERSION = 'v0.1.0';

const taskStore = useTaskStore();
const userStore = useUserStore();

const logoutVisible = ref(false);

const user = computed(() => userStore.current);
const stats = computed(() => taskStore.stats);

onShow(async () => {
  await Promise.all([userStore.load(), taskStore.loadTasks()]);
});

function goTasks(filter: string): void {
  uni.reLaunch({ url: `/pages/tasks/index?filter=${filter}` });
}

function goSubmissions(filter: string): void {
  uni.navigateTo({ url: `/pages/submissions/index?filter=${filter}` });
}

function notReady(name: string): void {
  uni.showToast({ title: `${name}功能开发中`, icon: 'none' });
}

function onAbout(): void {
  uni.showModal({
    title: '教研室事务助手',
    content: `版本 ${APP_VERSION}\n面向高校教研室事务协同的移动端应用。`,
    showCancel: false,
  });
}

function doLogout(): void {
  logoutVisible.value = false;
  uni.showToast({ title: '演示环境：已模拟退出登录', icon: 'none' });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 200rpx;
  @include safe-bottom(200rpx);
}

/* ---------- 个人信息 ---------- */
.profile {
  @include flex-row();
  padding: 40rpx 32rpx;
  background: $surface;
}

.profile__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $primary;
  @include flex-center;
  flex-shrink: 0;
}

.profile__avatar-text {
  font-size: 44rpx;
  font-weight: 600;
  color: $white;
}

.profile__main {
  flex: 1;
  margin-left: 28rpx;
  min-width: 0;
}

.profile__name-line {
  @include flex-row();
}

.profile__name {
  font-size: $font-title;
  font-weight: 600;
  color: $text-1;
}

.profile__title {
  margin-left: 16rpx;
  height: 40rpx;
  padding: 0 14rpx;
  border-radius: 8rpx;
  background: $primary-light;
  color: $primary;
  font-size: $font-xs;
  @include flex-center;
}

.profile__org {
  display: block;
  margin-top: 14rpx;
  font-size: $font-tag;
  color: $text-2;
  @include ellipsis(1);
}

/* ---------- 统计 ---------- */
.stats {
  display: flex;
  flex-direction: row;
  background: $surface;
  margin-top: 1rpx;
  padding: 24rpx 0 32rpx;
}

.stats__item {
  flex: 1;
  @include flex-center;
  flex-direction: column;
}

.stats__split {
  width: 1rpx;
  background: $border;
  margin: 8rpx 0;
}

.stats__value {
  font-size: 40rpx;
  font-weight: 600;
  color: $text-1;
}

.stats__value--success {
  color: $success;
}

.stats__value--danger {
  color: $danger;
}

.stats__label {
  margin-top: 8rpx;
  font-size: $font-tag;
  color: $text-3;
}

/* ---------- 分组 ---------- */
.group {
  margin: 24rpx 32rpx 0;
}

.group__title {
  display: block;
  padding: 0 4rpx 16rpx;
  font-size: $font-tag;
  color: $text-3;
}

.group__card {
  background: $surface;
  border-radius: $radius-card;
  overflow: hidden;
}

.group__line {
  height: 1rpx;
  background: $border;
  margin-left: 28rpx;
}

/* ---------- 退出 ---------- */
.logout {
  padding: 48rpx 32rpx 0;
}

.logout__btn {
  height: $btn-height;
  background: $surface;
  border-radius: $radius-card;
  @include flex-center;
}

.logout__btn--hover {
  background: $pressed;
}

.logout__text {
  font-size: $font-body;
  color: $danger;
}
</style>
