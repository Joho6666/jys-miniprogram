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

/** 统计卡：首页四列数据区，保持图标、数值和标签的垂直节奏 */
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

const cardBg = computed(() => ICON_TONE_META[props.tone].bg);
const accentColor = computed(() => ICON_TONE_META[props.tone].color);

function onTap(): void {
  emit('tap');
}
</script>

<style lang="scss" scoped>
.stat-card {
  width: 100%;
  box-sizing: border-box;
  min-height: 174rpx;
  padding: 18rpx 14rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  border-top: 5rpx solid;
  border-radius: 16rpx;
  box-shadow: 0 7rpx 18rpx rgba(29, 33, 41, 0.055);
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
}

.stat-card--hover {
  opacity: 0.94;
  transform: scale(0.985);
  box-shadow: 0 2rpx 8rpx rgba(29, 33, 41, 0.035);
}

.stat-card__main {
  width: 100%;
  min-width: 0;
  margin-top: 12rpx;
}

.stat-card__value {
  display: block;
  font-size: 42rpx;
  font-weight: 700;
  letter-spacing: -1rpx;
  line-height: 1.1;
  color: $text-1;
}

.stat-card__label {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: $text-2;
  @include ellipsis(1);
}
</style>
