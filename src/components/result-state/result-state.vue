<template>
  <view class="result-state">
    <view class="result-state__badge" :class="badgeClass">
      <uni-icons :type="iconType" size="36" :color="iconColor" />
    </view>
    <text class="result-state__title">{{ title }}</text>
    <text v-if="desc" class="result-state__desc">{{ desc }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/** 结果态（审核通过 / 材料需要修改） */
interface Props {
  type: 'success' | 'reject';
  title: string;
  desc?: string;
}

const props = withDefaults(defineProps<Props>(), {
  desc: '',
});

const badgeClass = computed(() => (props.type === 'success' ? 'result-state__badge--success' : 'result-state__badge--danger'));
const iconType = computed(() => (props.type === 'success' ? 'checkmarkempty' : 'closeempty'));
const iconColor = computed(() => (props.type === 'success' ? '#52C41A' : '#FF4D4F'));
</script>

<style lang="scss" scoped>
.result-state {
  @include flex-center;
  flex-direction: column;
  padding: 64rpx 48rpx 40rpx;
}

.result-state__badge {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  @include flex-center;
}

.result-state__badge--success {
  background: $success-bg;
}

.result-state__badge--danger {
  background: $danger-bg;
}

.result-state__title {
  margin-top: 32rpx;
  font-size: $font-title;
  font-weight: 600;
  color: $text-1;
}

.result-state__desc {
  margin-top: 16rpx;
  font-size: $font-body;
  color: $text-2;
  text-align: center;
  line-height: 1.6;
}
</style>
