<template>
  <view class="stat-card" :style="{ background: cardBg }" hover-class="stat-card--hover" @tap="onTap">
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

const cardBg = computed(() => ICON_TONE_META[props.tone].bg);

function onTap(): void {
  emit('tap');
}
</script>

<style lang="scss" scoped>
.stat-card {
  flex: 1;
  @include flex-row();
  padding: 24rpx 20rpx;
  border-radius: 12rpx;
}

.stat-card--hover {
  opacity: 0.85;
}

.stat-card__main {
  flex: 1;
  margin-left: 16rpx;
  min-width: 0;
}

.stat-card__value {
  display: block;
  font-size: 44rpx;
  font-weight: 600;
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
