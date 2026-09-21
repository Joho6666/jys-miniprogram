<template>
  <view class="page">
    <app-nav-bar title="审核结果" />

    <loading-state v-if="submissionStore.detailLoading" />
    <error-state v-else-if="!submission" desc="审核结果不存在。" @retry="reload" />

    <template v-else>
      <result-state
        :type="approved ? 'success' : 'reject'"
        :title="approved ? '审核通过' : '材料需要修改'"
        :desc="approved ? '材料已通过审核并归档，感谢配合。' : '请根据审核意见修改后重新提交。'"
      />

      <view class="block">
        <view class="row">
          <text class="row__label">关联任务</text>
          <text class="row__value">{{ submission.taskTitle }}</text>
        </view>
        <view class="row">
          <text class="row__label">提交版本</text>
          <text class="row__value">V{{ submission.version }}</text>
        </view>
        <view class="row">
          <text class="row__label">审核人</text>
          <text class="row__value">{{ submission.reviewerName || '—' }}</text>
        </view>
        <view class="row">
          <text class="row__label">审核时间</text>
          <text class="row__value">{{ submission.reviewedAt ? fullDateTime(submission.reviewedAt) : '—' }}</text>
        </view>
      </view>

      <view v-if="submission.reviewOpinion" class="opinion" :class="{ 'opinion--danger': !approved }">
        <text class="opinion__label">审核意见</text>
        <text class="opinion__text">{{ submission.reviewOpinion }}</text>
      </view>

      <view class="actions">
        <template v-if="approved">
          <view class="g-btn g-btn-primary" hover-class="actions__hover" @tap="goSubmission">
            <text class="actions__text-on-primary">查看提交材料</text>
          </view>
          <view class="g-btn g-btn-secondary actions__secondary" hover-class="actions__hover-plain" @tap="goTask">
            <text class="actions__text">返回任务详情</text>
          </view>
        </template>
        <template v-else>
          <view class="g-btn g-btn-primary" hover-class="actions__hover" @tap="goResubmit">
            <text class="actions__text-on-primary">修改并重新提交</text>
          </view>
          <view class="g-btn g-btn-secondary actions__secondary" hover-class="actions__hover-plain" @tap="goSubmission">
            <text class="actions__text">查看原提交材料</text>
          </view>
        </template>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useSubmissionStore } from '@/stores/submission';
import { fullDateTime } from '@/services/format';

const submissionStore = useSubmissionStore();

const submissionId = ref('');
const submission = computed(() => submissionStore.detail);
const approved = computed(() => submission.value?.status === 'APPROVED');

onLoad((query) => {
  const id = query && typeof query.submissionId === 'string' ? query.submissionId : '';
  submissionId.value = id;
  if (id) {
    void submissionStore.loadDetail(id);
  }
});

function reload(): void {
  if (submissionId.value) {
    void submissionStore.loadDetail(submissionId.value);
  }
}

function goSubmission(): void {
  uni.redirectTo({ url: `/pages/submission-detail/index?submissionId=${submissionId.value}` });
}

function goTask(): void {
  const taskId = submission.value?.taskId;
  if (taskId) {
    uni.navigateTo({ url: `/pages/task-detail/index?id=${taskId}` });
    return;
  }
  uni.reLaunch({ url: '/pages/tasks/index' });
}

function goResubmit(): void {
  const taskId = submission.value?.taskId;
  if (!taskId) return;
  uni.redirectTo({ url: `/pages/resubmit/index?taskId=${taskId}` });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 60rpx;
}

.block {
  margin: 20rpx 32rpx 0;
  padding: 12rpx 32rpx;
  background: $surface;
  border-radius: $radius-card;
}

.row {
  @include flex-row(space-between);
  padding: 24rpx 0;
  border-bottom: 1rpx solid $border;
}

.row:last-child {
  border-bottom: none;
}

.row__label {
  font-size: $font-body;
  color: $text-3;
  flex-shrink: 0;
}

.row__value {
  flex: 1;
  text-align: right;
  font-size: $font-body;
  color: $text-1;
  margin-left: 24rpx;
}

.opinion {
  margin: 20rpx 32rpx 0;
  padding: 28rpx 32rpx;
  background: $success-bg;
  border-radius: $radius-card;
}

.opinion--danger {
  background: $danger-bg;
}

.opinion__label {
  display: block;
  font-size: $font-xs;
  color: $text-2;
  margin-bottom: 10rpx;
}

.opinion__text {
  font-size: $font-body;
  color: $text-1;
  line-height: 1.7;
}

.actions {
  padding: 40rpx 32rpx 0;
}

.actions__secondary {
  margin-top: 24rpx;
}

.actions__hover {
  background: $primary-pressed;
}

.actions__hover-plain {
  background: $bg;
}

.actions__text-on-primary {
  font-size: 32rpx;
  font-weight: 500;
  color: $white;
}

.actions__text {
  font-size: 30rpx;
  color: $text-1;
}
</style>
