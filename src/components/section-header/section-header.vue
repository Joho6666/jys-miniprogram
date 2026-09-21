<template>
  <view class="section-header">
    <view class="section-header__left">
      <view class="section-header__bar" />
      <view class="section-header__main">
        <text class="section-header__title">{{ title }}</text>
        <text v-if="desc" class="section-header__desc">{{ desc }}</text>
      </view>
    </view>
    <view v-if="moreText" class="section-header__more" hover-class="section-header__more--hover" @tap="onMore">
      <text class="section-header__more-text">{{ moreText }}</text>
      <uni-icons type="right" size="12" color="#86909C" />
    </view>
  </view>
</template>

<script setup lang="ts">
/** 模块标题：左侧品牌色竖条 + 标题（可选副标题说明），右侧可选「更多」入口 */
interface Props {
  title: string;
  /** 副标题：模块级说明文案 */
  desc?: string;
  moreText?: string;
}

withDefaults(defineProps<Props>(), {
  desc: '',
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

.section-header__main {
  flex: 1;
  min-width: 0;
}

.section-header__title {
  display: block;
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
}

.section-header__desc {
  display: block;
  margin-top: 8rpx;
  font-size: $font-tag;
  color: $text-3;
  line-height: 1.5;
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
