<template>
  <view v-if="visible" class="confirm-modal">
    <view class="confirm-modal__mask" @tap="onCancel" />
    <view class="confirm-modal__panel">
      <text class="confirm-modal__title">{{ title }}</text>
      <text class="confirm-modal__content">{{ content }}</text>
      <view class="confirm-modal__actions">
        <view
          class="confirm-modal__btn confirm-modal__btn--cancel"
          hover-class="confirm-modal__btn--hover"
          @tap="onCancel"
        >
          <text class="confirm-modal__btn-text">{{ cancelText }}</text>
        </view>
        <view
          class="confirm-modal__btn confirm-modal__btn--confirm"
          :class="{ 'confirm-modal__btn--danger': danger }"
          hover-class="confirm-modal__btn--hover"
          @tap="onConfirm"
        >
          <text class="confirm-modal__btn-text confirm-modal__btn-text--on-primary">{{ confirmText }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/** 二次确认弹窗（提交确认 / 删除确认 / 退出登录） */
interface Props {
  visible: boolean;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

withDefaults(defineProps<Props>(), {
  confirmText: '确认',
  cancelText: '取消',
  danger: false,
});

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

function onConfirm(): void {
  emit('confirm');
}

function onCancel(): void {
  emit('cancel');
}
</script>

<style lang="scss" scoped>
.confirm-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  @include flex-center;
}

.confirm-modal__mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $mask;
}

.confirm-modal__panel {
  position: relative;
  width: 560rpx;
  background: $surface;
  border-radius: 20rpx;
  padding: 48rpx 40rpx 32rpx;
  @include flex-center;
  flex-direction: column;
}

.confirm-modal__title {
  font-size: 34rpx;
  font-weight: 600;
  color: $text-1;
  text-align: center;
}

.confirm-modal__content {
  margin-top: 24rpx;
  font-size: $font-body;
  color: $text-2;
  line-height: 1.6;
  text-align: center;
}

.confirm-modal__actions {
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 48rpx;
}

.confirm-modal__btn {
  flex: 1;
  height: 84rpx;
  border-radius: $radius-btn;
  @include flex-center;
  margin: 0 10rpx;
}

.confirm-modal__btn--cancel {
  background: $surface;
  border: 1rpx solid $border;
}

.confirm-modal__btn--confirm {
  background: $primary;
}

.confirm-modal__btn--danger {
  background: $danger;
}

.confirm-modal__btn--hover {
  opacity: 0.85;
}

.confirm-modal__btn-text {
  font-size: 30rpx;
  color: $text-1;
}

.confirm-modal__btn-text--on-primary {
  color: $white;
}
</style>
