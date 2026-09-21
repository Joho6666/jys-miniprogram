<template>
  <view class="tabs">
    <scroll-view class="tabs__scroll" scroll-x :show-scrollbar="false">
      <view class="tabs__inner">
        <view
          v-for="item in items"
          :key="item.key"
          class="tabs__item"
          hover-class="tabs__item--hover"
          @tap="select(item.key)"
        >
          <view class="tabs__line">
            <text class="tabs__label" :class="{ 'tabs__label--active': item.key === modelValue }">
              {{ item.label }}
            </text>
            <text v-if="item.count !== undefined" class="tabs__count" :class="{ 'tabs__count--active': item.key === modelValue }">
              {{ item.count }}
            </text>
          </view>
          <view class="tabs__indicator" :class="{ 'tabs__indicator--active': item.key === modelValue }" />
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
/** 下划线标签页（我的待办 / 消息提醒 / 提交记录共用） */
export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

interface Props {
  items: TabItem[];
  modelValue: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', key: string): void;
  (e: 'change', key: string): void;
}>();

function select(key: string): void {
  emit('update:modelValue', key);
  emit('change', key);
}
</script>

<style lang="scss" scoped>
.tabs {
  background: $surface;
  border-bottom: 1rpx solid $border;
}

.tabs__scroll {
  width: 100%;
  white-space: nowrap;
}

.tabs__inner {
  display: inline-flex;
  flex-direction: row;
  padding: 0 16rpx;
}

.tabs__item {
  @include flex-center;
  flex-direction: column;
  height: $tabs-height;
  padding: 0 24rpx;
  flex-shrink: 0;
}

.tabs__item--hover {
  opacity: 0.7;
}

.tabs__line {
  @include flex-row();
}

.tabs__label {
  font-size: $font-body;
  color: $text-2;
}

.tabs__label--active {
  color: $primary;
  font-weight: 600;
}

.tabs__count {
  margin-left: 6rpx;
  font-size: $font-tag;
  color: $text-3;
}

.tabs__count--active {
  color: $primary;
}

.tabs__indicator {
  width: $tabs-indicator-width;
  height: $tabs-indicator-height;
  margin-top: 8rpx;
  border-radius: 3rpx;
  background: transparent;
}

.tabs__indicator--active {
  background: $primary;
}
</style>
