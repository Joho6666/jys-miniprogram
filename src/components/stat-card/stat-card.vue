<template>
  <view class="stat-card" :style="{ background: cardBg, borderTopColor: accentColor }" hover-class="stat-card--hover" @tap="onTap">
    <app-icon :name="icon" :tone="tone" variant="solid" size="md" />
    <view class="stat-card__main">
      <text class="stat-card__value">{{ value }}</text>
      <text class="stat-card__label">{{ label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IconTone } from '@/types';
import { ICON_TONE_META } from '@/types';

/** 统计卡（首页 2×2 数据区）：实心图标 + 数值 + 标签，卡片底色取图标色调的浅色 */
interface Props {
  label: string;
  value: number | string;
  tone?: IconTone;
  /** uni-icons 图标名 */
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'primary',
  icon: 'list',
});

const emit = defineEmits<{ (e: 'tap'): void }>();

const cardBg = computed(() => '#FFFFFF');
const accentColor = computed(() => ICON_TONE_META[props.tone].color);

function onTap(): void {
  emit('tap');
}
</script>

<style lang="scss" scoped>
.stat-card {
  width: 100%;
  box-sizing: border-box;
  @include flex-row();
  min-height: 132rpx;
  padding: 22rpx 20rpx;
  border: 1rpx solid $border;
  border-top-width: 5rpx;
  border-radius: 18rpx;
  box-shadow: 0 6rpx 18rpx rgba(29, 33, 41, 0.035);
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
}

.stat-card--hover {
  opacity: 0.94;
  transform: scale(0.985);
  box-shadow: 0 2rpx 8rpx rgba(29, 33, 41, 0.035);
}

.stat-card__main {
  flex: 1;
  margin-left: 16rpx;
  min-width: 0;
}

.stat-card__value {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  letter-spacing: -1rpx;
  line-height: 1.1;
  color: $text-1;
}

.stat-card__label {
  display: block;
  margin-top: 6rpx;
  font-size: $font-tag;
  color: $text-2;
  @include ellipsis(1);
}
</style>
