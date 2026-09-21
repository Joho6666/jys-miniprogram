<template>
  <view class="page">
    <app-nav-bar title="提交成功" :show-back="false" />

    <loading-state v-if="loading" />

    <template v-else>
      <result-state type="success" title="提交成功" desc="材料已成功提交，审核结果将通过消息通知您。" />

      <view class="block">
        <view class="row">
          <text class="row__label">任务名称</text>
          <text class="row__value">{{ submission?.taskTitle || '—' }}</text>
        </view>
        <view class="row">
          <text class="row__label">提交状态</text>
          <text class="row__value row__value--primary">待审核</text>
        </view>
        <view class="row">
          <text class="row__label">提交版本</text>
          <text class="row__value">V{{ submission?.version || 1 }}</text>
        </view>
        <view class="row">
          <text class="row__label">提交时间</text>
          <text class="row__value">{{ submission ? fullDateTime(submission.submittedAt) : '—' }}</text>
        </view>
        <view class="row">
          <text class="row__label">文件数量</text>
          <text class="row__value">{{ submission?.files.length || 0 }} 个</text>
        </view>
      </view>

      <view class="actions">
        <view class="g-btn g-btn-primary" hover-class="actions__btn--hover" @tap="goDetail">
          <text class="actions__btn-text">查看提交详情</text>
        </view>
        <view class="g-btn g-btn-secondary actions__secondary" hover-class="actions__btn--hover-plain" @tap="goTasks">
          <text class="actions__btn-text-plain">返回我的任务</text>
        </view>
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
const loading = ref(true);

const submission = computed(() => submissionStore.detail);

onLoad(async (query) => {
  const id = query && typeof query.submissionId === 'string' ? query.submissionId : '';
  submissionId.value = id;
  if (id) {
    await submissionStore.loadDetail(id);
  }
  loading.value = false;
});

function goDetail(): void {
  if (!submissionId.value) return;
  uni.redirectTo({ url: `/pages/submission-detail/index?submissionId=${submissionId.value}` });
}

function goTasks(): void {
  uni.reLaunch({ url: '/pages/tasks/index' });
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

.row__value--primary {
  color: $primary;
}

.actions {
  padding: 40rpx 32rpx 0;
}

.actions__secondary {
  margin-top: 24rpx;
}

.actions__btn--hover {
  background: $primary-pressed;
}

.actions__btn--hover-plain {
  background: $bg;
}

.actions__btn-text {
  font-size: 32rpx;
  font-weight: 500;
  color: $white;
}

.actions__btn-text-plain {
  font-size: 30rpx;
  color: $text-1;
}
</style>
