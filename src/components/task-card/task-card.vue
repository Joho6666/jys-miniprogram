<template>
  <view class="task-card" hover-class="task-card--hover" @tap="onTap">
    <view class="task-card__head">
      <status-tag :status="badge.key" :label="badge.label" />
      <text class="task-card__remain" :class="{ 'task-card__remain--danger': isUrgent }">{{ remain }}</text>
    </view>

    <text class="task-card__title">{{ task.title }}</text>

    <view class="task-card__tags">
      <text
        v-for="(tag, index) in task.tags"
        :key="tag"
        class="task-card__tag"
        :class="{ 'task-card__tag--main': index === 0 }"
      >
        {{ tag }}
      </text>
    </view>

    <view v-if="task.rejectSummary" class="task-card__reject">
      <text class="task-card__reject-text">审核意见：{{ task.rejectSummary }}</text>
    </view>

    <view class="task-card__foot">
      <view class="task-card__meta">
        <app-icon name="person" tone="neutral" variant="plain" size="sm" />
        <text class="task-card__meta-text">{{ task.ownerName }}</text>
      </view>
      <view class="task-card__meta">
        <app-icon name="calendar" tone="neutral" variant="plain" size="sm" />
        <text class="task-card__meta-text">{{ shortDate(task.deadline) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskView } from '@/types';
import { shortDate } from '@/services/format';
import { remainShortText, taskBadgeOf, urgencyOf } from '@/services/domain';

/** 任务卡（首页 / 我的待办共用）：紧急度徽标 + 距截止 + 标题 + 两枚标签 + 负责人·截止日期 */
interface Props {
  task: TaskView;
}

const props = defineProps<Props>();

const emit = defineEmits<{ (e: 'tap', task: TaskView): void }>();

const badge = computed(() => taskBadgeOf(props.task));
const remain = computed(() => remainShortText(props.task.deadline));
const isUrgent = computed(() => urgencyOf(props.task.deadline) === 'URGENT');

function onTap(): void {
  emit('tap', props.task);
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

.task-card__remain {
  font-size: $font-tag;
  color: $text-3;
}

.task-card__remain--danger {
  color: $danger;
}

.task-card__title {
  display: block;
  margin-top: 16rpx;
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
  line-height: 1.45;
  @include ellipsis(1);
}

.task-card__tags {
  @include flex-row();
  margin-top: 12rpx;
}

.task-card__tag {
  height: 40rpx;
  padding: 0 12rpx;
  margin-right: 12rpx;
  border-radius: $radius-tag;
  background: $bg;
  color: $text-2;
  font-size: $font-xs;
  @include flex-center;
}

/* 第一枚为分类标签：品牌浅底，建立标签层级 */
.task-card__tag--main {
  background: $primary-light;
  color: $primary;
}

.task-card__reject {
  margin-top: 12rpx;
}

.task-card__reject-text {
  font-size: $font-tag;
  color: $danger;
  @include ellipsis(1);
}

.task-card__foot {
  @include flex-row(space-between);
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid $border;
}

.task-card__meta {
  @include flex-row();
}

.task-card__meta-text {
  margin-left: 6rpx;
  font-size: $font-tag;
  color: $text-3;
}
</style>
