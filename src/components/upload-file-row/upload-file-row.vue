<template>
  <view class="upload-row">
    <view class="upload-row__main" @tap="onPreview">
      <view class="upload-row__tile" :style="{ background: meta.bg, color: meta.color }">
        <text class="upload-row__tile-text">{{ meta.tile }}</text>
      </view>

      <view class="upload-row__info">
        <text class="upload-row__name">{{ item.name }}</text>
        <view class="upload-row__sub">
          <text class="upload-row__size">{{ sizeText(item.sizeKB) }}</text>
          <view class="upload-row__state">
            <app-icon
              v-if="item.state === 'SUCCESS'"
              name="checkmarkempty"
              tone="success"
              variant="plain"
              size="sm"
            />
            <text class="upload-row__state-text" :class="statusClass">{{ statusText }}</text>
          </view>
        </view>

        <view v-if="item.state === 'UPLOADING'" class="upload-row__progress">
          <view class="upload-row__progress-bar" :style="{ width: item.progress + '%' }" />
        </view>
      </view>
    </view>

    <view class="upload-row__actions">
      <text v-if="item.state === 'FAILED'" class="upload-row__link" hover-class="upload-row__link--hover" @tap="onRetry">
        重新上传
      </text>
      <text v-else-if="item.state === 'SUCCESS'" class="upload-row__link" hover-class="upload-row__link--hover" @tap="onReplace">
        替换
      </text>
      <view class="upload-row__close" hover-class="upload-row__close--hover" @tap="onRemove">
        <app-icon name="closeempty" tone="neutral" variant="plain" size="sm" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UploadItem } from '@/types';
import { FORMAT_META } from '@/types';
import { sizeText } from '@/services/format';

/** 上传文件行：等待 / 上传中(进度) / 成功(✓ 可预览·替换) / 失败(重新上传)，右侧 × 移除 */
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
  'upload-row__state-text--success': props.item.state === 'SUCCESS',
  'upload-row__state-text--danger': props.item.state === 'FAILED',
  'upload-row__state-text--primary': props.item.state === 'UPLOADING',
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
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid $border;
}

.upload-row:last-child {
  border-bottom: none;
}

.upload-row__main {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  min-width: 0;
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

.upload-row__sub {
  @include flex-row();
  margin-top: 8rpx;
}

.upload-row__size {
  font-size: $font-tag;
  color: $text-3;
  flex-shrink: 0;
}

.upload-row__state {
  @include flex-row();
  margin-left: 16rpx;
  min-width: 0;
}

.upload-row__state-text {
  margin-left: 4rpx;
  font-size: $font-tag;
  color: $text-3;
  @include ellipsis(1);
}

.upload-row__state-text--success {
  color: $success;
}

.upload-row__state-text--danger {
  color: $danger;
}

.upload-row__state-text--primary {
  color: $primary;
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
  flex-shrink: 0;
  margin-left: 16rpx;
}

.upload-row__link {
  font-size: $font-label;
  color: $primary;
  margin-right: 20rpx;
}

.upload-row__link--hover {
  opacity: 0.6;
}

.upload-row__close {
  width: 48rpx;
  height: 48rpx;
  @include flex-center;
  border-radius: 50%;
}

.upload-row__close--hover {
  background: $pressed;
}
</style>
