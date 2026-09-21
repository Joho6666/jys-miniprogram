<template>
  <view class="msg-row" hover-class="msg-row--hover" @tap="onTap">
    <view class="msg-row__icon">
      <app-icon :name="iconMeta.icon" :tone="iconMeta.tone" variant="solid" size="lg" radius="circle" />
      <view v-if="!message.read" class="msg-row__unread" />
    </view>

    <view class="msg-row__main">
      <view class="msg-row__head">
        <text class="msg-row__title">{{ message.title }}</text>
        <text class="msg-row__time">{{ relativeTime(message.time) }}</text>
      </view>

      <text class="msg-row__body">{{ message.body }}</text>

      <view v-if="message.opinion" class="msg-row__opinion">
        <text class="msg-row__opinion-text">{{ message.opinion }}</text>
      </view>

      <view class="msg-row__foot">
        <text class="msg-row__source">{{ message.source }}</text>
        <view class="msg-row__link" hover-class="msg-row__link--hover" @tap.stop="onAction">
          <text class="msg-row__link-text">{{ linkText }}</text>
          <uni-icons type="right" size="11" color="#1677FF" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '@/types';
import { MESSAGE_EVENT_META } from '@/types';
import { relativeTime } from '@/services/format';

/** 消息行：圆形事件图标 + 标题/时间 + 正文 + 来源 + 「查看详情」入口 */
interface Props {
  message: Message;
  /** 业务操作文案（默认「查看详情」） */
  actionLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  actionLabel: '',
});

const emit = defineEmits<{
  (e: 'tap', message: Message): void;
  (e: 'action', message: Message): void;
}>();

const iconMeta = computed(() => MESSAGE_EVENT_META[props.message.event]);
const linkText = computed(() => props.actionLabel || '查看详情');

function onTap(): void {
  emit('tap', props.message);
}

function onAction(): void {
  emit('action', props.message);
}
</script>

<style lang="scss" scoped>
.msg-row {
  display: flex;
  flex-direction: row;
  background: $surface;
  border-radius: $radius-card;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.msg-row--hover {
  background: $pressed;
}

.msg-row__icon {
  position: relative;
  flex-shrink: 0;
}

.msg-row__unread {
  position: absolute;
  top: 0;
  right: 0;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: $danger;
  border: 2rpx solid $surface;
}

.msg-row__main {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.msg-row__head {
  @include flex-row(space-between);
}

.msg-row__title {
  flex: 1;
  font-size: $font-md;
  font-weight: 500;
  color: $text-1;
  @include ellipsis(1);
}

.msg-row__time {
  margin-left: 16rpx;
  font-size: $font-tag;
  color: $text-3;
  flex-shrink: 0;
}

.msg-row__body {
  display: block;
  margin-top: 12rpx;
  font-size: $font-label;
  color: $text-2;
  line-height: 1.6;
  @include ellipsis(2);
}

.msg-row__opinion {
  margin-top: 14rpx;
  padding: 16rpx 20rpx;
  background: $danger-bg;
  border-radius: 8rpx;
}

.msg-row__opinion-text {
  font-size: $font-tag;
  color: $text-1;
  line-height: 1.5;
}

.msg-row__foot {
  @include flex-row(space-between);
  margin-top: 16rpx;
}

.msg-row__source {
  flex: 1;
  font-size: $font-tag;
  color: $text-3;
  @include ellipsis(1);
}

.msg-row__link {
  @include flex-row();
  margin-left: 16rpx;
  flex-shrink: 0;
}

.msg-row__link--hover {
  opacity: 0.6;
}

.msg-row__link-text {
  font-size: $font-tag;
  color: $primary;
  margin-right: 4rpx;
}
</style>
