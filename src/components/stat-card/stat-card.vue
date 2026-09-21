<template>
  <view class="stat-card" hover-class="stat-card--hover" @tap="onTap">
    <text class="stat-card__value" :class="valueClass">{{ value }}</text>
    <text class="stat-card__label">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

/** 统计卡（首页 2×2 数据区） */
interface Props {
  label: string;
  value: number | string;
  tone?: 'default' | 'primary' | 'warning' | 'danger' | 'success';
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'default',
});

const emit = defineEmits<{ (e: 'tap'): void }>();

const valueClass = computed(() => `stat-card__value--${props.tone}`);

function onTap(): void {
  emit('tap');
}
</script>

<style lang="scss" scoped>
.stat-card {
  flex: 1;
  background: $surface;
  border-radius: 12rpx;
  padding: 24rpx 16rpx;
  @include flex-center;
  flex-direction: column;
}

.stat-card--hover {
  background: $pressed;
}

.stat-card__value {
  font-size: 44rpx;
  font-weight: 600;
  line-height: 1.2;
  color: $text-1;
}

.stat-card__value--primary {
  color: $primary;
}

.stat-card__value--warning {
  color: $warning;
}

.stat-card__value--danger {
  color: $danger;
}

.stat-card__value--success {
  color: $success;
}

.stat-card__label {
  margin-top: 8rpx;
  font-size: $font-tag;
  color: $text-2;
}
</style>
