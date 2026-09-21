<template>
  <view class="loading-state">
    <view class="loading-state__spinner" />
    <text class="loading-state__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
/** 加载态 */
interface Props {
  text?: string;
}

withDefaults(defineProps<Props>(), {
  text: '加载中…',
});
</script>

<style lang="scss" scoped>
.loading-state {
  @include flex-center;
  flex-direction: column;
  padding: 96rpx 32rpx;
}

.loading-state__spinner {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 4rpx solid $border;
  border-top-color: $primary;
  animation: loading-spin 0.8s linear infinite;
}

@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state__text {
  margin-top: 20rpx;
  font-size: $font-label;
  color: $text-3;
}
</style>
