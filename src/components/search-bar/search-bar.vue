<template>
  <view class="search-bar">
    <uni-icons type="search" size="16" color="#86909C" />
    <input
      class="search-bar__input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      placeholder-class="search-bar__placeholder"
      confirm-type="search"
      @input="onInput"
      @confirm="onConfirm"
    />
    <view v-if="modelValue" class="search-bar__clear" hover-class="search-bar__clear--hover" @tap="onClear">
      <uni-icons type="closeempty" size="14" color="#86909C" />
    </view>
  </view>
</template>

<script setup lang="ts">
/** 搜索框（任务列表/提交记录共用） */
interface Props {
  modelValue: string;
  placeholder?: string;
}

withDefaults(defineProps<Props>(), {
  placeholder: '搜索',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'confirm', value: string): void;
  (e: 'clear'): void;
}>();

/** 兼容小程序（detail.value）与 H5（target.value）两种事件形态 */
function readValue(event: unknown): string {
  const payload = event as { detail?: { value?: unknown }; target?: { value?: unknown } };
  if (payload.detail && typeof payload.detail.value === 'string') return payload.detail.value;
  if (payload.target && typeof payload.target.value === 'string') return payload.target.value;
  return '';
}

function onInput(event: InputEvent | { detail: { value: string } }): void {
  emit('update:modelValue', readValue(event));
}

function onConfirm(event: InputEvent | { detail: { value: string } }): void {
  emit('confirm', readValue(event));
}

function onClear(): void {
  emit('update:modelValue', '');
  emit('clear');
}
</script>

<style lang="scss" scoped>
.search-bar {
  @include flex-row();
  height: 72rpx;
  padding: 0 20rpx;
  background: $surface;
  border: 1rpx solid $border;
  border-radius: $radius-input;
}

.search-bar__input {
  flex: 1;
  margin-left: 12rpx;
  height: 72rpx;
  font-size: $font-body;
  color: $text-1;
}

.search-bar__placeholder {
  color: $text-3;
}

.search-bar__clear {
  padding: 8rpx;
}

.search-bar__clear--hover {
  opacity: 0.6;
}
</style>
