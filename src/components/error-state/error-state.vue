<template>
  <view class="error-state">
    <view class="error-state__art">
      <uni-icons type="info" size="40" color="#FF4D4F" />
    </view>
    <text class="error-state__title">{{ title }}</text>
    <text v-if="desc" class="error-state__desc">{{ desc }}</text>
    <view class="error-state__action" hover-class="error-state__action--hover" @tap="onRetry">
      <text class="error-state__action-text">{{ retryText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/** 错误态（加载失败，可重试） */
interface Props {
  title?: string;
  desc?: string;
  retryText?: string;
}

withDefaults(defineProps<Props>(), {
  title: '加载失败',
  desc: '网络异常或服务暂不可用，请稍后重试。',
  retryText: '重新加载',
});

const emit = defineEmits<{ (e: 'retry'): void }>();

function onRetry(): void {
  emit('retry');
}
</script>

<style lang="scss" scoped>
.error-state {
  @include flex-center;
  flex-direction: column;
  padding: 120rpx 48rpx;
}

.error-state__art {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: $danger-bg;
  @include flex-center;
}

.error-state__title {
  margin-top: 28rpx;
  font-size: $font-body;
  font-weight: 500;
  color: $text-1;
}

.error-state__desc {
  margin-top: 12rpx;
  font-size: $font-label;
  color: $text-3;
  text-align: center;
  line-height: 1.6;
}

.error-state__action {
  margin-top: 32rpx;
  height: 72rpx;
  padding: 0 40rpx;
  border-radius: 36rpx;
  background: $primary;
  @include flex-center;
}

.error-state__action--hover {
  background: $primary-pressed;
}

.error-state__action-text {
  font-size: $font-label;
  color: $white;
}
</style>
