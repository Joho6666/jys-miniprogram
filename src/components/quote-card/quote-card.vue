<template>
  <view class="quote-card">
    <text class="quote-card__mark">“</text>
    <view class="quote-card__body">
      <text class="quote-card__text">{{ text }}</text>
      <text class="quote-card__author">—— {{ author }}</text>
    </view>
    <view class="quote-card__art">
      <campus-art variant="card" tone="soft" />
    </view>
  </view>
</template>

<script setup lang="ts">
/** 教研心语卡（首页）：左侧文案 + 右侧校园剪影 */
interface Props {
  text?: string;
  author?: string;
}

withDefaults(defineProps<Props>(), {
  text: '教而不研则浅，研而不教则空',
  author: '叶圣陶',
});
</script>

<style lang="scss" scoped>
.quote-card {
  position: relative;
  overflow: hidden;
  background: $surface;
  border-radius: $radius-card;
  padding: 32rpx;
  min-height: 168rpx;
}

/* 装饰引号：浅品牌色，衬出「心语」语义 */
.quote-card__mark {
  position: absolute;
  top: -26rpx;
  left: 16rpx;
  font-size: 140rpx;
  font-weight: 600;
  color: rgba(22, 119, 255, 0.08);
  line-height: 1;
}

.quote-card__body {
  position: relative;
  z-index: 2;
  width: 62%;
}

.quote-card__text {
  display: block;
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
  line-height: 1.5;
}

.quote-card__author {
  display: block;
  margin-top: 14rpx;
  font-size: $font-tag;
  color: $text-3;
}

.quote-card__art {
  position: absolute;
  right: -12rpx;
  bottom: -8rpx;
  z-index: 1;
}
</style>
