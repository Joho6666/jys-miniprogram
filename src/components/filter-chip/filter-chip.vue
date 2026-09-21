<template>
  <view
    class="filter-chip"
    :class="{ 'filter-chip--active': active }"
    hover-class="filter-chip--hover"
    @tap="onTap"
  >
    <text class="filter-chip__label" :class="{ 'filter-chip__label--active': active }">{{ label }}</text>
    <text v-if="count !== undefined" class="filter-chip__count" :class="{ 'filter-chip__count--active': active }">
      {{ count }}
    </text>
  </view>
</template>

<script setup lang="ts">
/** 横滚筛选 chip（任务/消息/提交记录共用） */
interface Props {
  label: string;
  active?: boolean;
  /** 可选计数角标 */
  count?: number;
}

withDefaults(defineProps<Props>(), {
  active: false,
  count: undefined,
});

const emit = defineEmits<{ (e: 'tap'): void }>();

function onTap(): void {
  emit('tap');
}
</script>

<style lang="scss" scoped>
.filter-chip {
  display: inline-flex;
  align-items: center;
  height: 60rpx;
  padding: 0 24rpx;
  margin-right: 16rpx;
  border-radius: 30rpx;
  background: $surface;
  border: 1rpx solid $border;
  flex-shrink: 0;
}

.filter-chip--active {
  background: $primary-light;
  border-color: $primary;
}

.filter-chip--hover {
  opacity: 0.75;
}

.filter-chip__label {
  font-size: $font-label;
  color: $text-2;
}

.filter-chip__label--active {
  color: $primary;
  font-weight: 500;
}

.filter-chip__count {
  margin-left: 6rpx;
  font-size: $font-tag;
  color: $text-3;
}

.filter-chip__count--active {
  color: $primary;
}
</style>
