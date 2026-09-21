<template>
  <view class="timeline">
    <view v-for="(node, index) in nodes" :key="node.submissionId" class="timeline__item">
      <view class="timeline__axis">
        <view class="timeline__dot" :class="dotClass(node)" />
        <view v-if="index < nodes.length - 1" class="timeline__line" />
      </view>
      <view class="timeline__content">
        <view class="timeline__head">
          <text class="timeline__version">版本 V{{ node.version }}</text>
          <status-tag :status="bizStatusOf(node)" />
        </view>
        <text class="timeline__time">提交 {{ fullDateTime(node.submittedAt) }}</text>
        <text v-if="node.reviewedAt" class="timeline__time">
          审核 {{ fullDateTime(node.reviewedAt) }}{{ node.reviewerName ? ` · ${node.reviewerName}` : '' }}
        </text>
        <view v-if="node.opinion" class="timeline__opinion">
          <text class="timeline__opinion-text">{{ node.opinion }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { BizStatus, VersionNode } from '@/types';
import { fullDateTime } from '@/services/format';

/** 版本时间线（提交详情 / 审核结果） */
interface Props {
  nodes: VersionNode[];
}

defineProps<Props>();

function bizStatusOf(node: VersionNode): BizStatus {
  if (node.status === 'APPROVED') return 'APPROVED';
  if (node.status === 'REJECTED') return 'REJECTED';
  return 'PENDING_REVIEW';
}

function dotClass(node: VersionNode): string {
  if (node.status === 'APPROVED') return 'timeline__dot--success';
  if (node.status === 'REJECTED') return 'timeline__dot--danger';
  return 'timeline__dot--review';
}
</script>

<style lang="scss" scoped>
.timeline {
  padding: 8rpx 0;
}

.timeline__item {
  display: flex;
  flex-direction: row;
}

.timeline__axis {
  width: 40rpx;
  @include flex-center;
  flex-direction: column;
  padding-top: 8rpx;
}

.timeline__dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.timeline__dot--success {
  background: $success;
}

.timeline__dot--danger {
  background: $danger;
}

.timeline__dot--review {
  background: $review;
}

.timeline__line {
  flex: 1;
  width: 2rpx;
  background: $border;
  margin-top: 8rpx;
}

.timeline__content {
  flex: 1;
  padding: 0 0 32rpx 16rpx;
}

.timeline__head {
  @include flex-row();
}

.timeline__version {
  font-size: $font-body;
  font-weight: 500;
  color: $text-1;
  margin-right: 16rpx;
}

.timeline__time {
  display: block;
  margin-top: 8rpx;
  font-size: $font-tag;
  color: $text-3;
}

.timeline__opinion {
  margin-top: 14rpx;
  padding: 16rpx 20rpx;
  background: $bg;
  border-radius: 8rpx;
}

.timeline__opinion-text {
  font-size: $font-tag;
  color: $text-2;
  line-height: 1.6;
}
</style>
