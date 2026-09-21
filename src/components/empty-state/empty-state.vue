<template>
  <view class="empty-state">
    <view class="empty-state__art">
      <view class="empty-state__paper">
        <view class="empty-state__line" />
        <view class="empty-state__line" />
        <view class="empty-state__line empty-state__line--short" />
      </view>
    </view>
    <text class="empty-state__title">{{ title }}</text>
    <text v-if="desc" class="empty-state__desc">{{ desc }}</text>
    <view v-if="actionText" class="empty-state__action" hover-class="empty-state__action--hover" @tap="onAction">
      <text class="empty-state__action-text">{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/** 空态（无数据 / 搜索无结果共用） */
interface Props {
  title: string;
  desc?: string;
  actionText?: string;
}

withDefaults(defineProps<Props>(), {
  desc: '',
  actionText: '',
});

const emit = defineEmits<{ (e: 'action'): void }>();

function onAction(): void {
  emit('action');
}
</script>

<style lang="scss" scoped>
.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: 120rpx 48rpx;
}

.empty-state__art {
  width: 160rpx;
  height: 160rpx;
  border-radius: 24rpx;
  background: $surface;
  border: 1rpx solid $border;
  @include flex-center;
}

.empty-state__paper {
  width: 88rpx;
}

.empty-state__line {
  height: 10rpx;
  border-radius: 5rpx;
  background: $border;
  margin-bottom: 12rpx;
}

.empty-state__line--short {
  width: 60%;
  margin-bottom: 0;
}

.empty-state__title {
  margin-top: 32rpx;
  font-size: $font-body;
  font-weight: 500;
  color: $text-2;
}

.empty-state__desc {
  margin-top: 12rpx;
  font-size: $font-label;
  color: $text-3;
  text-align: center;
  line-height: 1.6;
}

.empty-state__action {
  margin-top: 32rpx;
  height: 64rpx;
  padding: 0 32rpx;
  border-radius: 32rpx;
  border: 1rpx solid $primary;
  @include flex-center;
}

.empty-state__action--hover {
  background: $primary-light;
}

.empty-state__action-text {
  font-size: $font-label;
  color: $primary;
}
</style>
