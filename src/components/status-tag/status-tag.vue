<template>
  <view
    class="status-tag"
    :style="{ background: meta.bg, color: meta.color, borderColor: meta.border }"
  >
    <text class="status-tag__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BizStatus } from '@/types';
import { STATUS_META } from '@/types';

/**
 * 全系统唯一状态颜色渲染组件。
 * 任何页面/组件不得自行定义状态配色，一律通过本组件输出。
 */
interface Props {
  status: BizStatus;
  /** 覆盖文案（默认取状态标准名称） */
  label?: string;
}

const props = defineProps<Props>();

const meta = computed(() => STATUS_META[props.status]);
const text = computed(() => (props.label ? props.label : meta.value.label));
</script>

<style lang="scss" scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40rpx;
  padding: 0 12rpx;
  border-radius: $radius-tag;
  border-width: 1rpx;
  border-style: solid;
}

.status-tag__text {
  font-size: $font-xs;
  line-height: 1;
  font-weight: 500;
}
</style>
