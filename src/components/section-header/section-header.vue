<template>
  <view class="section-header">
    <view class="section-header__left">
      <view class="section-header__bar" />
      <text class="section-header__title">{{ title }}</text>
    </view>
    <view v-if="moreText" class="section-header__more" hover-class="section-header__more--hover" @tap="onMore">
      <text class="section-header__more-text">{{ moreText }}</text>
      <uni-icons type="right" size="12" color="#86909C" />
    </view>
  </view>
</template>

<script setup lang="ts">
/** 模块标题：左侧品牌色竖条 + 标题，右侧可选「更多」入口 */
interface Props {
  title: string;
  moreText?: string;
}

withDefaults(defineProps<Props>(), {
  moreText: '',
});

const emit = defineEmits<{ (e: 'more'): void }>();

function onMore(): void {
  emit('more');
}
</script>

<style lang="scss" scoped>
.section-header {
  @include flex-row(space-between);
  padding: 28rpx 32rpx 20rpx;
}

.section-header__left {
  @include flex-row();
}

.section-header__bar {
  width: 6rpx;
  height: 28rpx;
  border-radius: 4rpx;
  background: $primary;
  margin-right: 12rpx;
}

.section-header__title {
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
}

.section-header__more {
  @include flex-row();
  padding: 4rpx 0 4rpx 16rpx;
}

.section-header__more--hover {
  opacity: 0.6;
}

.section-header__more-text {
  font-size: $font-tag;
  color: $text-3;
  margin-right: 4rpx;
}
</style>
