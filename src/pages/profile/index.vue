<template>
  <view class="page">
    <!-- 品牌区：个人信息 -->
    <view class="hero">
      <view class="hero__overlay" />
      <app-nav-bar title="我的" :show-back="false" transparent theme="light" />
      <view class="hero__body">
        <view class="hero__avatar">
          <text class="hero__avatar-text">{{ user?.avatarText || (isMockMode() ? '张' : '') }}</text>
        </view>
        <view class="hero__main">
          <text class="hero__name">{{ user?.name || (isMockMode() ? '张老师' : '') }}</text>
          <text class="hero__org">{{ user?.title || (isMockMode() ? '教师' : '') }}<template v-if="user?.office"> | {{ user.office }}</template></text>
        </view>
      </view>
      <view class="hero__art">
        <campus-art variant="hero" tone="light" />
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu">
      <view v-for="(item, index) in MENU" :key="item.key">
        <view v-if="index > 0" class="menu__line" />
        <group-list-cell :title="item.title" :icon="item.icon" :tone="item.tone" @tap="onMenu(item)" />
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout">
      <view class="logout__btn" hover-class="logout__btn--hover" @tap="logoutVisible = true">
        <text class="logout__text">退出登录</text>
      </view>
    </view>

    <!-- 品牌页脚 -->
    <view class="brand">
      <text class="brand__title">立德树人 · 数据兴校</text>
      <text class="brand__sub">—— XX 大学 ——</text>
      <view class="brand__art">
        <campus-art variant="footer" tone="soft" />
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
import type { IconTone } from '@/types';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import { requestSubscribeMessage } from '@/services/subscribe';
import { usePageShare } from '@/services/share';
import { isMockMode } from '@/services/http';

usePageShare(() => ({ title: '教研室事务助手 · 教师端', path: '/pages/profile/index' }));

const APP_VERSION = 'v0.1.0';

interface MenuItem {
  key: string;
  title: string;
  icon: string;
  tone: IconTone;
  /** 页面路径（reLaunch / navigateTo） */
  url?: string;
  /** 是否为 tab 页 */
  tab?: boolean;
  /** 尚未实现的入口 */
  todo?: boolean;
}

const MENU: MenuItem[] = [
  { key: 'submissions', title: '我的提交记录', icon: 'list', tone: 'primary', url: '/pages/submissions/index' },
  { key: 'completed', title: '我的已完成任务', icon: 'checkmarkempty', tone: 'success', url: '/pages/tasks/index?filter=COMPLETED', tab: true },
  { key: 'help', title: '帮助中心', icon: 'help', tone: 'primary', todo: true },
  { key: 'feedback', title: '意见反馈', icon: 'compose', tone: 'primary', url: '/pages/feedback/index' },
  { key: 'about', title: '关于我们', icon: 'info', tone: 'primary' },
  { key: 'settings', title: '消息设置', icon: 'gear', tone: 'neutral' },
];

const userStore = useUserStore();

const logoutVisible = ref(false);
const user = computed(() => userStore.current);

onShow(async () => {
  await userStore.load();
});

function onMenu(item: MenuItem): void {
  if (item.key === 'about') {
    uni.showModal({
      title: '教研室事务助手',
      content: `版本 ${APP_VERSION}\n面向高校教研室事务协同的移动端应用。`,
      showCancel: false,
    });
    return;
  }
  if (item.key === 'help') { uni.showModal({ title: '帮助中心', content: '如何提交材料？进入任务详情并选择“去提交材料”。\n\n如何重新提交？在已驳回任务中查看审核意见并选择“修改并重新提交”。\n\n如何查看消息？点击底部“消息”查看通知和审核结果。', showCancel: false }); return; }
  if (item.key === 'settings') { void requestSubscribeMessage().then(() => uni.showToast({ title: '订阅设置已提交', icon: 'success' })).catch((error: Error) => uni.showToast({ title: error.message, icon: 'none' })); return; }
  if (item.todo) {
    uni.showToast({ title: `${item.title}功能开发中`, icon: 'none' });
    return;
  }
  if (!item.url) return;
  if (item.tab) {
    uni.reLaunch({ url: item.url });
    return;
  }
  uni.navigateTo({ url: item.url });
}

async function doLogout(): Promise<void> {
  logoutVisible.value = false;
  try { await useAuthStore().logout(); } catch { /* Local session is cleared in finally. */ }
  uni.reLaunch({ url: '/pages/login/index' });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 200rpx;
  @include safe-bottom(200rpx);
}

/* ---------- 品牌区 ---------- */
.hero {
  position: relative;
  overflow: hidden;
  background: $primary;
  /* 底部留出剪影带，头像与姓名区域不被遮挡 */
  padding-bottom: 192rpx;
}

.hero__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $hero-overlay;
}

.hero__body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8rpx 32rpx 0;
}

.hero__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $surface;
  @include flex-center;
  flex-shrink: 0;
}

.hero__avatar-text {
  font-size: 44rpx;
  font-weight: 600;
  color: $primary;
}

.hero__main {
  flex: 1;
  margin-left: 28rpx;
  min-width: 0;
}

.hero__name {
  display: block;
  font-size: $font-title;
  font-weight: 600;
  color: $white;
}

.hero__org {
  display: block;
  margin-top: 12rpx;
  font-size: $font-label;
  color: rgba(255, 255, 255, 0.86);
  @include ellipsis(1);
}

.hero__art {
  position: absolute;
  right: 24rpx;
  bottom: -6rpx;
  z-index: 1;
}

/* ---------- 功能列表 ---------- */
.menu {
  position: relative;
  z-index: 3;
  margin: -40rpx 32rpx 0;
  background: $surface;
  border-radius: $radius-card;
  overflow: hidden;
}

.menu__line {
  height: 1rpx;
  background: $border;
  margin-left: 28rpx;
}

/* ---------- 退出 ---------- */
.logout {
  padding: 32rpx 32rpx 0;
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

/* ---------- 品牌页脚 ---------- */
.brand {
  position: relative;
  overflow: hidden;
  margin: 32rpx 32rpx 0;
  padding: 40rpx 32rpx 0;
  background: $surface;
  border-radius: $radius-card;
  @include flex-center;
  flex-direction: column;
}

.brand__title {
  position: relative;
  z-index: 2;
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
  letter-spacing: 4rpx;
}

.brand__sub {
  position: relative;
  z-index: 2;
  margin-top: 12rpx;
  font-size: $font-tag;
  color: $text-3;
}

.brand__art {
  margin-top: 16rpx;
  opacity: 0.9;
}
</style>
