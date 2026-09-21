<template>
  <view class="app-nav" :class="{ 'app-nav--fixed': fixed }">
    <view class="app-nav__status" :style="{ height: metrics.statusBarHeight + 'px' }" />
    <view
      class="app-nav__bar"
      :class="{ 'app-nav__bar--border': border && !transparent }"
      :style="{ height: metrics.navHeight + 'px', background: transparent ? 'transparent' : bgColor }"
    >
      <view class="app-nav__left">
        <view v-if="showBack" class="app-nav__back" hover-class="app-nav__back--hover" @tap="onBack">
          <uni-icons type="left" size="20" :color="iconColor" />
        </view>
      </view>
      <text class="app-nav__title" :class="{ 'app-nav__title--light': theme === 'light' }" :style="titleInset">
        {{ title }}
      </text>
      <view class="app-nav__right" :style="{ width: metrics.capsuleRight + 'px' }">
        <slot name="right" />
      </view>
    </view>
  </view>
  <view v-if="fixed" class="app-nav__placeholder" :style="{ height: totalHeight + 'px' }" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getNavMetrics } from '@/services/nav';

/**
 * 全局自定义导航栏：状态栏高度 + 微信胶囊避让 + 返回。
 * 首页品牌区可用 transparent + theme="light" 叠加。
 */
interface Props {
  title?: string;
  showBack?: boolean;
  /** 是否固定顶部（默认固定，并自动占位） */
  fixed?: boolean;
  /** 透明（叠加在品牌区上） */
  transparent?: boolean;
  bgColor?: string;
  border?: boolean;
  /** light = 深色背景上的白字 */
  theme?: 'dark' | 'light';
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: true,
  fixed: true,
  transparent: false,
  bgColor: '#FFFFFF',
  border: true,
  theme: 'dark',
});

const emit = defineEmits<{ (e: 'back'): void }>();

const metrics = getNavMetrics();

const totalHeight = computed(() => metrics.statusBarHeight + metrics.navHeight);

const iconColor = computed(() => (props.theme === 'light' ? '#FFFFFF' : '#1D2129'));

/** 标题居中于「左右安全区之间」 */
const titleInset = computed(() => ({
  left: `${metrics.capsuleRight}px`,
  right: `${metrics.capsuleRight}px`,
}));

function onBack(): void {
  emit('back');
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.reLaunch({ url: '/pages/home/index' });
  }
}
</script>

<style lang="scss" scoped>
.app-nav__status {
  width: 100%;
}

.app-nav--fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.app-nav__placeholder {
  width: 100%;
}

.app-nav__bar {
  position: relative;
  @include flex-row(space-between);
  padding: 0 24rpx;
}

.app-nav__bar--border {
  border-bottom: 1rpx solid $border;
}

.app-nav__left,
.app-nav__right {
  @include flex-row();
  min-width: 64rpx;
  height: 100%;
}

.app-nav__right {
  justify-content: flex-end;
}

.app-nav__back {
  width: 64rpx;
  height: 64rpx;
  @include flex-center;
  border-radius: 50%;
}

.app-nav__back--hover {
  background: rgba(0, 0, 0, 0.04);
}

.app-nav__title {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  text-align: center;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-nav;
  font-weight: 600;
  color: $text-1;
  pointer-events: none;
}

.app-nav__title--light {
  color: $white;
}
</style>
