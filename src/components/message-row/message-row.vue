<template>
  <view class="msg-row" hover-class="msg-row--hover" @tap="onTap">
    <view class="msg-row__head">
      <view class="msg-row__tile" :style="{ background: meta.bg, color: meta.color }">
        <text class="msg-row__tile-text">{{ meta.tile }}</text>
      </view>
      <view class="msg-row__head-main">
        <view class="msg-row__title-line">
          <text class="msg-row__title">{{ message.title }}</text>
          <view v-if="!message.read" class="msg-row__dot" />
        </view>
        <text class="msg-row__time">{{ relativeTime(message.time) }}</text>
      </view>
    </view>

    <text class="msg-row__body">{{ message.body }}</text>

    <view v-if="message.opinion" class="msg-row__opinion">
      <text class="msg-row__opinion-label">审核意见</text>
      <text class="msg-row__opinion-text">{{ message.opinion }}</text>
    </view>

    <view class="msg-row__foot">
      <text class="msg-row__source">{{ message.source }}</text>
      <view v-if="actionLabel" class="msg-row__action" hover-class="msg-row__action--hover" @tap.stop="onAction">
        <text class="msg-row__action-text">{{ actionLabel }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '@/types';
import { MESSAGE_TYPE_META } from '@/types';
import { relativeTime } from '@/services/format';

/** 消息行：类型色块 + 未读红点 + 正文 + 来源 + 业务操作 */
interface Props {
  message: Message;
  /** 业务操作文案（无则不显示按钮） */
  actionLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  actionLabel: '',
});

const emit = defineEmits<{
  (e: 'tap', message: Message): void;
  (e: 'action', message: Message): void;
}>();

const meta = computed(() => MESSAGE_TYPE_META[props.message.type]);

function onTap(): void {
  emit('tap', props.message);
}

function onAction(): void {
  emit('action', props.message);
}
</script>

<style lang="scss" scoped>
.msg-row {
  background: $surface;
  border-radius: $radius-card;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.msg-row--hover {
  background: $pressed;
}

.msg-row__head {
  @include flex-row();
}

.msg-row__tile {
  width: 64rpx;
  height: 64rpx;
  border-radius: 10rpx;
  @include flex-center;
  flex-shrink: 0;
}

.msg-row__tile-text {
  font-size: 24rpx;
  font-weight: 600;
}

.msg-row__head-main {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.msg-row__title-line {
  @include flex-row();
}

.msg-row__title {
  font-size: $font-md;
  font-weight: 500;
  color: $text-1;
  @include ellipsis(1);
}

.msg-row__dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: $danger;
  margin-left: 12rpx;
  flex-shrink: 0;
}

.msg-row__time {
  display: block;
  margin-top: 8rpx;
  font-size: $font-tag;
  color: $text-3;
}

.msg-row__body {
  display: block;
  margin-top: 16rpx;
  font-size: $font-body;
  color: $text-2;
  line-height: 1.6;
  @include ellipsis(2);
}

.msg-row__opinion {
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  background: $danger-bg;
  border-radius: 8rpx;
}

.msg-row__opinion-label {
  display: block;
  font-size: $font-xs;
  color: $danger;
  margin-bottom: 6rpx;
}

.msg-row__opinion-text {
  font-size: $font-tag;
  color: $text-1;
  line-height: 1.5;
}

.msg-row__foot {
  @include flex-row(space-between);
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid $border;
}

.msg-row__source {
  font-size: $font-tag;
  color: $text-3;
  flex: 1;
  @include ellipsis(1);
}

.msg-row__action {
  height: 56rpx;
  padding: 0 24rpx;
  margin-left: 16rpx;
  border-radius: 28rpx;
  border: 1rpx solid $primary;
  @include flex-center;
  flex-shrink: 0;
}

.msg-row__action--hover {
  background: $primary-light;
}

.msg-row__action-text {
  font-size: $font-tag;
  color: $primary;
}
</style>
