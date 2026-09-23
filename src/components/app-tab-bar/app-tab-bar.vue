<template>
  <view class="tabbar">
    <view class="tabbar__inner">
      <view
        v-for="tab in TABS"
        :key="tab.key"
        class="tabbar__item"
        hover-class="tabbar__item--hover"
        @tap="switchTo(tab)"
      >
        <view class="tabbar__icon">
          <uni-icons
            :type="current === tab.key ? tab.activeIcon : tab.icon"
            size="22"
            :color="current === tab.key ? '#1677FF' : '#86909C'"
          />
          <view v-if="tab.badge && unreadCount > 0" class="tabbar__badge">
            <text class="tabbar__badge-text">{{ unreadCount > 99 ? '99+' : unreadCount }}</text>
          </view>
        </view>
        <text class="tabbar__label" :class="{ 'tabbar__label--active': current === tab.key }">
          {{ tab.label }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useMessageStore } from '@/stores/message';

type TabKey = 'home' | 'tasks' | 'messages' | 'profile';

interface TabItem {
  key: TabKey;
  label: string;
  icon: string;
  activeIcon: string;
  url: string;
  badge?: boolean;
}

/** 自定义底部导航（pages.json 未声明原生 tabBar） */
interface Props {
  current: TabKey;
}

defineProps<Props>();

const TABS: TabItem[] = [
  { key: 'home', label: '首页', icon: 'home', activeIcon: 'home-filled', url: '/pages/home/index' },
  { key: 'tasks', label: '任务', icon: 'list', activeIcon: 'list', url: '/pages/tasks/index' },
  {
    key: 'messages',
    label: '消息',
    icon: 'chat',
    activeIcon: 'chat-filled',
    url: '/pages/messages/index',
    badge: true,
  },
  { key: 'profile', label: '我的', icon: 'person', activeIcon: 'person-filled', url: '/pages/profile/index' },
];

const messageStore = useMessageStore();
const unreadCount = computed(() => messageStore.unreadCount);
onShow(() => { void messageStore.loadUnreadCount(); });

function switchTo(tab: TabItem): void {
  if (tab.key === 'home' || tab.key === 'tasks' || tab.key === 'messages' || tab.key === 'profile') {
    uni.reLaunch({ url: tab.url });
  }
}
</script>

<style lang="scss" scoped>
.tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: $surface;
  border-top: 1rpx solid $border;
  @include safe-bottom();
}

.tabbar__inner {
  display: flex;
  flex-direction: row;
  height: $tabbar-height;
}

.tabbar__item {
  flex: 1;
  @include flex-center;
  flex-direction: column;
}

.tabbar__item--hover {
  background: $pressed;
}

.tabbar__icon {
  position: relative;
  height: 44rpx;
  @include flex-center;
}

.tabbar__badge {
  position: absolute;
  top: -6rpx;
  left: 26rpx;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  border-radius: 14rpx;
  background: $danger;
  @include flex-center;
}

.tabbar__badge-text {
  font-size: 20rpx;
  color: $white;
  line-height: 1;
}

.tabbar__label {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: $text-3;
}

.tabbar__label--active {
  color: $primary;
  font-weight: 500;
}
</style>
