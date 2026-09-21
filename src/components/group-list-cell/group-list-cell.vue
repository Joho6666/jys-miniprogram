<template>
  <view class="cell" hover-class="cell--hover" @tap="onTap">
    <app-icon :name="icon" :tone="tone" variant="soft" size="md" />
    <text class="cell__title" :class="{ 'cell__title--danger': danger }">{{ title }}</text>
    <text v-if="value" class="cell__value">{{ value }}</text>
    <uni-icons v-if="showArrow" type="right" size="14" color="#86909C" />
  </view>
</template>

<script setup lang="ts">
import type { IconTone } from '@/types';

/** 分组行（「我的」页功能列表）：浅底彩色图标 + 标题 + 可选值 + 箭头 */
interface Props {
  title: string;
  /** uni-icons 图标名 */
  icon: string;
  tone?: IconTone;
  value?: string;
  showArrow?: boolean;
  danger?: boolean;
}

withDefaults(defineProps<Props>(), {
  tone: 'primary',
  value: '',
  showArrow: true,
  danger: false,
});

const emit = defineEmits<{ (e: 'tap'): void }>();

function onTap(): void {
  emit('tap');
}
</script>

<style lang="scss" scoped>
.cell {
  @include flex-row();
  height: $row-height;
  padding: 0 28rpx;
  background: $surface;
}

.cell--hover {
  background: $pressed;
}

.cell__title {
  flex: 1;
  margin-left: 20rpx;
  font-size: $font-body;
  color: $text-1;
}

.cell__title--danger {
  color: $danger;
}

.cell__value {
  font-size: $font-label;
  color: $text-3;
  margin-right: 12rpx;
}
</style>
