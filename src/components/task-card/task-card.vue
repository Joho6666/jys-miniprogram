<template>
  <view class="task-card" hover-class="task-card--hover" @tap="onTap">
    <view class="task-card__head">
      <status-tag :status="task.bizStatus" />
      <text class="task-card__note">{{ task.statusNote }}</text>
    </view>

    <text class="task-card__title">{{ task.title }}</text>

    <view class="task-card__meta">
      <template v-if="task.rejectSummary">
        <text class="task-card__meta-label">审核意见</text>
        <text class="task-card__meta-reject">{{ task.rejectSummary }}</text>
      </template>
      <template v-else>
        <text class="task-card__meta-text">{{ task.category }}</text>
        <text class="task-card__meta-split">·</text>
        <text class="task-card__meta-text">负责人 {{ task.ownerName }}</text>
      </template>
    </view>

    <view class="task-card__foot">
      <text class="task-card__deadline">截止 {{ deadlineText(task.deadline) }}</text>
      <view class="task-card__action" hover-class="task-card__action--hover" @tap.stop="onAction">
        <text class="task-card__action-text">{{ action.shortLabel }}</text>
        <uni-icons type="right" size="12" color="#1677FF" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskView } from '@/types';
import { deadlineText } from '@/services/format';
import { primaryActionOf } from '@/services/domain';

/** 任务卡（列表 / 首页共用）：状态 + 剩余时间 / 名称 / 类型·负责人 / 截止 / 主操作 */
interface Props {
  task: TaskView;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'tap', task: TaskView): void;
  (e: 'action', task: TaskView): void;
}>();

const action = computed(() => primaryActionOf(props.task.bizStatus));

function onTap(): void {
  emit('tap', props.task);
}

function onAction(): void {
  emit('action', props.task);
}
</script>

<style lang="scss" scoped>
.task-card {
  background: $surface;
  border-radius: $radius-card;
  padding: 24rpx 32rpx;
  margin-bottom: 20rpx;
}

.task-card--hover {
  background: $pressed;
}

.task-card__head {
  @include flex-row(space-between);
}

.task-card__note {
  font-size: $font-tag;
  color: $text-3;
}

.task-card__title {
  display: block;
  margin-top: 12rpx;
  font-size: $font-md;
  font-weight: 500;
  color: $text-1;
  @include ellipsis(1);
}

.task-card__meta {
  @include flex-row();
  margin-top: 8rpx;
  min-width: 0;
}

.task-card__meta-text {
  font-size: $font-tag;
  color: $text-2;
}

.task-card__meta-split {
  font-size: $font-tag;
  color: $text-3;
  margin: 0 10rpx;
}

.task-card__meta-label {
  font-size: $font-tag;
  color: $danger;
  flex-shrink: 0;
  margin-right: 8rpx;
}

.task-card__meta-reject {
  flex: 1;
  font-size: $font-tag;
  color: $danger;
  @include ellipsis(1);
}

.task-card__foot {
  @include flex-row(space-between);
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid $border;
}

.task-card__deadline {
  font-size: $font-tag;
  color: $text-3;
}

/* 紧凑按钮：32px 高，符合设计规范的次要操作尺寸 */
.task-card__action {
  @include flex-row();
  height: 64rpx;
  padding: 0 22rpx;
  border: 1rpx solid $primary;
  border-radius: 32rpx;
}

.task-card__action--hover {
  background: $primary-light;
}

.task-card__action-text {
  font-size: $font-tag;
  color: $primary;
  margin-right: 4rpx;
}
</style>
