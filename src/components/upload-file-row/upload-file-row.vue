<template>
  <view class="upload-row">
    <view class="upload-row__main" @tap="onPreview">
      <view class="upload-row__tile" :style="{ background: meta.bg, color: meta.color }">
        <text class="upload-row__tile-text">{{ meta.tile }}</text>
      </view>

      <view class="upload-row__info">
        <text class="upload-row__name">{{ item.name }}</text>
        <view class="upload-row__status">
          <text class="upload-row__status-text" :class="statusClass">{{ statusText }}</text>
          <text class="upload-row__size">{{ sizeText(item.sizeKB) }}</text>
        </view>

        <view v-if="item.state === 'UPLOADING'" class="upload-row__progress">
          <view class="upload-row__progress-bar" :style="{ width: item.progress + '%' }" />
        </view>
      </view>
    </view>

    <view class="upload-row__actions">
      <view v-if="item.state === 'FAILED'" class="upload-row__btn" hover-class="upload-row__btn--hover" @tap="onRetry">
        <text class="upload-row__btn-text upload-row__btn-text--primary">重新上传</text>
      </view>
      <template v-else-if="item.state === 'SUCCESS'">
        <view class="upload-row__btn" hover-class="upload-row__btn--hover" @tap="onPreview">
          <text class="upload-row__btn-text upload-row__btn-text--primary">预览</text>
        </view>
        <view class="upload-row__btn" hover-class="upload-row__btn--hover" @tap="onReplace">
          <text class="upload-row__btn-text">替换</text>
        </view>
        <view class="upload-row__btn" hover-class="upload-row__btn--hover" @tap="onRemove">
          <text class="upload-row__btn-text upload-row__btn-text--danger">删除</text>
        </view>
      </template>
      <view v-else-if="item.state === 'UPLOADING'" class="upload-row__btn" hover-class="upload-row__btn--hover" @tap="onRemove">
        <text class="upload-row__btn-text">取消</text>
      </view>
      <view v-else class="upload-row__btn" hover-class="upload-row__btn--hover" @tap="onRemove">
        <text class="upload-row__btn-text upload-row__btn-text--danger">删除</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UploadItem } from '@/types';
import { FORMAT_META } from '@/types';
import { sizeText } from '@/services/format';

/** 上传文件行：等待 / 上传中(进度) / 成功(预览·替换·删除) / 失败(重新上传) */
interface Props {
  item: UploadItem;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'remove', item: UploadItem): void;
  (e: 'retry', item: UploadItem): void;
  (e: 'preview', item: UploadItem): void;
  (e: 'replace', item: UploadItem): void;
}>();

const meta = computed(() => FORMAT_META[props.item.format]);

const statusText = computed(() => {
  switch (props.item.state) {
    case 'PENDING':
      return '等待上传';
    case 'UPLOADING':
      return `上传中 ${props.item.progress}%`;
    case 'SUCCESS':
      return '上传成功';
    case 'FAILED':
      return props.item.error || '上传失败';
    default:
      return '';
  }
});

const statusClass = computed(() => ({
  'upload-row__status-text--success': props.item.state === 'SUCCESS',
  'upload-row__status-text--danger': props.item.state === 'FAILED',
  'upload-row__status-text--primary': props.item.state === 'UPLOADING',
}));

function onRemove(): void {
  emit('remove', props.item);
}
function onRetry(): void {
  emit('retry', props.item);
}
function onPreview(): void {
  if (props.item.state === 'SUCCESS') {
    emit('preview', props.item);
  }
}
function onReplace(): void {
  emit('replace', props.item);
}
</script>

<style lang="scss" scoped>
.upload-row {
  padding: 24rpx 0;
  border-bottom: 1rpx solid $border;
}

.upload-row:last-child {
  border-bottom: none;
}

.upload-row__main {
  @include flex-row();
}

.upload-row__tile {
  width: 64rpx;
  height: 64rpx;
  border-radius: 10rpx;
  @include flex-center;
  flex-shrink: 0;
}

.upload-row__tile-text {
  font-size: 22rpx;
  font-weight: 600;
}

.upload-row__info {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.upload-row__name {
  display: block;
  font-size: $font-body;
  color: $text-1;
  @include ellipsis(1);
}

.upload-row__status {
  @include flex-row();
  margin-top: 8rpx;
}

.upload-row__status-text {
  font-size: $font-tag;
  color: $text-3;
  @include ellipsis(1);
}

.upload-row__status-text--success {
  color: $success;
}

.upload-row__status-text--danger {
  color: $danger;
}

.upload-row__status-text--primary {
  color: $primary;
}

.upload-row__size {
  font-size: $font-tag;
  color: $text-3;
  margin-left: 12rpx;
  flex-shrink: 0;
}

.upload-row__progress {
  margin-top: 12rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: $border;
  overflow: hidden;
}

.upload-row__progress-bar {
  height: 8rpx;
  border-radius: 4rpx;
  background: $primary;
  transition: width 0.2s linear;
}

.upload-row__actions {
  @include flex-row(flex-end);
  margin-top: 16rpx;
}

.upload-row__btn {
  height: 56rpx;
  padding: 0 20rpx;
  margin-left: 12rpx;
  border-radius: 28rpx;
  border: 1rpx solid $border;
  @include flex-center;
}

.upload-row__btn--hover {
  background: $bg;
}

.upload-row__btn-text {
  font-size: $font-tag;
  color: $text-2;
}

.upload-row__btn-text--primary {
  color: $primary;
}

.upload-row__btn-text--danger {
  color: $danger;
}
</style>
