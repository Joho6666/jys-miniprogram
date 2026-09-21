<template>
  <view class="page">
    <app-nav-bar title="我的提交" />

    <scroll-view class="chips" scroll-x :show-scrollbar="false">
      <view class="chips__inner">
        <filter-chip
          v-for="item in SUBMISSION_FILTERS"
          :key="item.key"
          :label="item.label"
          :count="countOf(item.key)"
          :active="submissionStore.filter === item.key"
          @tap="submissionStore.setFilter(item.key)"
        />
      </view>
    </scroll-view>

    <view class="list">
      <loading-state v-if="submissionStore.loading" />
      <error-state v-else-if="submissionStore.error" :desc="submissionStore.error" @retry="reload" />
      <empty-state v-else-if="!filtered.length" title="暂无提交记录" desc="任务提交后，这里会保留全部版本记录。" />
      <view
        v-for="record in filtered"
        v-else
        :key="record.id"
        class="record"
        hover-class="record--hover"
        @tap="goDetail(record.id)"
      >
        <view class="record__head">
          <text class="record__title">{{ record.taskTitle }}</text>
          <status-tag :status="record.bizStatus" />
        </view>
        <view class="record__meta">
          <text class="record__meta-text">版本 V{{ record.version }}</text>
          <text class="record__meta-split">·</text>
          <text class="record__meta-text">提交于 {{ fullDateTime(record.submittedAt) }}</text>
        </view>
        <view class="record__foot">
          <text class="record__files">{{ record.files.length }} 个文件</text>
          <view class="record__action">
            <text class="record__action-text">查看详情</text>
            <uni-icons type="right" size="12" color="#1677FF" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { SUBMISSION_FILTERS, useSubmissionStore } from '@/stores/submission';
import type { SubmissionFilterKey } from '@/stores/submission';
import { fullDateTime } from '@/services/format';

const submissionStore = useSubmissionStore();

const filtered = computed(() => submissionStore.filtered);

onLoad((query) => {
  const preset = query && typeof query.filter === 'string' ? (query.filter as SubmissionFilterKey) : undefined;
  if (preset && SUBMISSION_FILTERS.some((f) => f.key === preset)) {
    submissionStore.setFilter(preset);
  }
});

onShow(async () => {
  await submissionStore.loadSubmissions();
});

function countOf(key: SubmissionFilterKey): number {
  if (key === 'ALL') return submissionStore.counts.ALL;
  if (key === 'PENDING_REVIEW') return submissionStore.counts.PENDING_REVIEW;
  if (key === 'APPROVED') return submissionStore.counts.APPROVED;
  return submissionStore.counts.REJECTED;
}

function reload(): void {
  void submissionStore.loadSubmissions(true);
}

function goDetail(submissionId: string): void {
  uni.navigateTo({ url: `/pages/submission-detail/index?submissionId=${submissionId}` });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 60rpx;
}

.chips {
  margin-top: 24rpx;
  white-space: nowrap;
  width: 100%;
}

.chips__inner {
  display: inline-flex;
  flex-direction: row;
  padding: 0 32rpx 8rpx;
}

.list {
  padding: 24rpx 32rpx 0;
}

.record {
  background: $surface;
  border-radius: $radius-card;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
}

.record--hover {
  background: $pressed;
}

.record__head {
  @include flex-row(space-between);
}

.record__title {
  flex: 1;
  margin-right: 16rpx;
  font-size: $font-md;
  font-weight: 500;
  color: $text-1;
  @include ellipsis(1);
}

.record__meta {
  @include flex-row();
  margin-top: 12rpx;
}

.record__meta-text {
  font-size: $font-tag;
  color: $text-3;
}

.record__meta-split {
  font-size: $font-tag;
  color: $text-3;
  margin: 0 10rpx;
}

.record__foot {
  @include flex-row(space-between);
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid $border;
}

.record__files {
  font-size: $font-tag;
  color: $text-3;
}

.record__action {
  @include flex-row();
}

.record__action-text {
  font-size: $font-tag;
  color: $primary;
  margin-right: 4rpx;
}
</style>
