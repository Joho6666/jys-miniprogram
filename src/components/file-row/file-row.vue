<template>
  <view class="file-row" hover-class="file-row--hover" @tap="onTap">
    <view class="file-row__tile" :style="{ background: meta.bg, color: meta.color }">
      <text class="file-row__tile-text">{{ meta.tile }}</text>
    </view>

    <view class="file-row__main">
      <text class="file-row__name">{{ name }}</text>
      <text class="file-row__sub">{{ subText }}</text>
    </view>

    <view class="file-row__op">
      <text v-if="downloadable" class="file-row__action">{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FileFormat } from '@/types';
import { FORMAT_META } from '@/types';
import { sizeText } from '@/services/format';

/** 附件行（任务模板附件 / 已提交文件）：色块 + 名称 + 规格 + 右侧「下载」 */
interface Props {
  name: string;
  format: FileFormat;
  sizeKB: number;
  /** 副标题，默认「格式 · 大小」 */
  sub?: string;
  downloadable?: boolean;
  /** 右侧操作文案 */
  actionText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  sub: '',
  downloadable: true,
  actionText: '下载',
});

const emit = defineEmits<{ (e: 'tap'): void }>();

const meta = computed(() => FORMAT_META[props.format]);
const subText = computed(() => props.sub || `${props.format} · ${sizeText(props.sizeKB)}`);

function onTap(): void {
  emit('tap');
}
</script>

<style lang="scss" scoped>
.file-row {
  @include flex-row();
  padding: 20rpx 0;
}

.file-row--hover {
  background: $pressed;
}

.file-row__tile {
  width: 64rpx;
  height: 64rpx;
  border-radius: 10rpx;
  @include flex-center;
  flex-shrink: 0;
}

.file-row__tile-text {
  font-size: 22rpx;
  font-weight: 600;
}

.file-row__main {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.file-row__name {
  display: block;
  font-size: $font-body;
  color: $text-1;
  @include ellipsis(1);
}

.file-row__sub {
  display: block;
  margin-top: 6rpx;
  font-size: $font-tag;
  color: $text-3;
  @include ellipsis(1);
}

.file-row__op {
  padding-left: 20rpx;
  @include flex-center;
  flex-shrink: 0;
}

.file-row__action {
  font-size: $font-label;
  color: $primary;
}
</style>
