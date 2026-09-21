<template>
  <view class="cell" hover-class="cell--hover" @tap="onTap">
    <view class="cell__icon" :class="iconClass">
      <text class="cell__icon-text">{{ iconText }}</text>
    </view>
    <text class="cell__title" :class="{ 'cell__title--danger': danger }">{{ title }}</text>
    <text v-if="value" class="cell__value">{{ value }}</text>
    <uni-icons v-if="showArrow" type="right" size="14" color="#86909C" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/** 微信式分组行（「我的」页功能列表） */
interface Props {
  title: string;
  /** 图标文字（单字，零图片依赖） */
  iconText: string;
  value?: string;
  showArrow?: boolean;
  danger?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  showArrow: true,
  danger: false,
});

const emit = defineEmits<{ (e: 'tap'): void }>();

const iconClass = computed(() => (props.danger ? 'cell__icon--danger' : 'cell__icon--primary'));

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

.cell__icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 12rpx;
  @include flex-center;
  flex-shrink: 0;
}

.cell__icon--primary {
  background: $primary-light;
}

.cell__icon--danger {
  background: $danger-bg;
}

.cell__icon-text {
  font-size: 26rpx;
  font-weight: 600;
}

.cell__icon--primary .cell__icon-text {
  color: $primary;
}

.cell__icon--danger .cell__icon-text {
  color: $danger;
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
