<template>
  <view class="campus" :class="[`campus--${variant}`, `campus--${tone}`]">
    <view class="campus__building campus__building--side">
      <view v-for="n in 6" :key="`l${n}`" class="campus__window" />
    </view>
    <view class="campus__building campus__building--main">
      <view class="campus__roof" />
      <view v-for="n in 8" :key="`c${n}`" class="campus__window" />
    </view>
    <view class="campus__building campus__building--side campus__building--right">
      <view v-for="n in 6" :key="`r${n}`" class="campus__window" />
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 校园剪影：纯 CSS 绘制的抽象教学楼（楼体 + 窗格 + 檐口），零图片依赖。
 * 后续如需替换为实景照片，只需替换本组件内部实现，页面无需改动。
 */
interface Props {
  /** hero：品牌区右下角大剪影；card：卡片内嵌；footer：整宽页脚 */
  variant?: 'hero' | 'card' | 'footer';
  /** light：深色底上的白色剪影；soft：浅色底上的品牌浅蓝剪影 */
  tone?: 'light' | 'soft';
}

withDefaults(defineProps<Props>(), {
  variant: 'card',
  tone: 'soft',
});
</script>

<style lang="scss" scoped>
.campus {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
}

/* ---------- 楼体 ---------- */
.campus__building {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-end;
  justify-content: center;
  padding: 0 10rpx 6rpx;
  border-radius: 6rpx 6rpx 0 0;
  position: relative;
}

.campus__building--side {
  width: 96rpx;
  height: 104rpx;
}

.campus__building--main {
  width: 132rpx;
  height: 148rpx;
  margin: 0 12rpx;
}

.campus__roof {
  position: absolute;
  top: -14rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 24rpx;
  height: 14rpx;
  border-radius: 4rpx 4rpx 0 0;
}

/* ---------- 窗格 ---------- */
.campus__window {
  width: 12rpx;
  height: 12rpx;
  margin: 5rpx;
  border-radius: 2rpx;
}

/* ---------- 浅色底（卡片 / 页脚） ---------- */
.campus--soft .campus__building {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.78), rgba(22, 119, 255, 0.16));
  border: 1rpx solid rgba(255, 255, 255, 0.62);
}

.campus--soft .campus__roof {
  background: rgba(22, 119, 255, 0.18);
}

.campus--soft .campus__window {
  background: rgba(22, 119, 255, 0.24);
}

.campus--soft .campus__building--main .campus__window {
  background: rgba(22, 119, 255, 0.34);
}

/* ---------- 深色底（品牌区） ---------- */
.campus--light .campus__building {
  background: rgba(255, 255, 255, 0.22);
}

.campus--light .campus__roof {
  background: rgba(255, 255, 255, 0.22);
}

.campus--light .campus__window {
  background: rgba(255, 255, 255, 0.6);
}

/* ---------- 变体尺寸 ---------- */
.campus--hero {
  opacity: 1;
}

/* 中间主楼高、两侧配楼矮，形成天际线层次而非等高方块 */
.campus--hero .campus__building--side {
  width: 108rpx;
  height: 96rpx;
}

.campus--hero .campus__building--side.campus__building--right {
  height: 112rpx;
}

.campus--hero .campus__building--main {
  width: 168rpx;
  height: 170rpx;
  margin: 0 24rpx;
}

.campus--hero .campus__window {
  width: 10rpx;
  height: 10rpx;
  margin: 6rpx;
  background: rgba(255, 255, 255, 0.42);
}

.campus--hero .campus__building--main .campus__window {
  background: rgba(255, 255, 255, 0.6);
}

.campus--card {
  transform: scale(0.9);
  transform-origin: right bottom;
}

.campus--footer .campus__building--side {
  width: 120rpx;
  height: 96rpx;
}

.campus--footer .campus__building--main {
  width: 168rpx;
  height: 140rpx;
  margin: 0 32rpx;
}
</style>
