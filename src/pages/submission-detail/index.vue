<template>
  <view class="page">
    <app-nav-bar title="提交详情" />

    <loading-state v-if="submissionStore.detailLoading" />
    <error-state v-else-if="!submission" desc="提交记录不存在或已删除。" @retry="reload" />

    <template v-else>
      <view class="head">
        <view class="head__top">
          <status-tag :status="submission.bizStatus" />
          <text class="head__version">当前版本 V{{ submission.version }}</text>
        </view>
        <text class="head__title">{{ submission.taskTitle }}</text>
        <text class="head__time">提交时间 {{ fullDateTime(submission.submittedAt) }}</text>
      </view>

      <view class="block">
        <text class="block__title">提交说明</text>
        <text v-if="submission.note" class="block__text">{{ submission.note }}</text>
        <text v-else class="block__text block__text--muted">未填写提交说明</text>
      </view>

      <view class="block">
        <text class="block__title">提交材料（{{ submission.files.length }}）</text>
        <file-row
          v-for="file in submission.files"
          :key="file.id"
          :name="file.name"
          :format="file.format"
          :size-kb="file.sizeKB"
          :sub="`上传于 ${fullDateTime(file.uploadedAt)}`"
          @tap="onPreview(file.name)"
        />
      </view>

      <view class="block">
        <text class="block__title">审核状态</text>
        <view v-if="submission.status === 'PENDING_REVIEW'" class="audit-status">
          <text class="audit-status__text">材料已提交，等待教研室审核。</text>
        </view>
        <template v-else>
          <view class="row">
            <text class="row__label">审核结果</text>
            <text class="row__value" :class="{ 'row__value--danger': isRejected, 'row__value--success': !isRejected }">
              {{ isRejected ? '已驳回' : '已通过' }}
            </text>
          </view>
          <view class="row">
            <text class="row__label">审核人</text>
            <text class="row__value">{{ submission.reviewerName || '—' }}</text>
          </view>
          <view class="row">
            <text class="row__label">审核时间</text>
            <text class="row__value">{{ submission.reviewedAt ? fullDateTime(submission.reviewedAt) : '—' }}</text>
          </view>
          <view class="opinion" :class="{ 'opinion--danger': isRejected }">
            <text class="opinion__label">审核意见</text>
            <text class="opinion__text">{{ submission.reviewOpinion || '—' }}</text>
          </view>
        </template>
      </view>

      <view class="block">
        <text class="block__title">版本记录</text>
        <timeline :nodes="submission.versions" />
      </view>

      <!-- 模拟审核（演示用，接入真实后端后由管理端操作） -->
      <view v-if="submission.status === 'PENDING_REVIEW'" class="audit">
        <view class="audit__head">
          <text class="audit__title">模拟审核</text>
          <text class="audit__hint">演示功能</text>
        </view>
        <text class="audit__desc">正式环境由教研室内审人操作，演示阶段可在此驱动审核闭环。</text>
        <textarea
          v-model="opinion"
          class="audit__input"
          maxlength="200"
          :placeholder="opinionPlaceholder"
          placeholder-class="audit__placeholder"
        />
        <view class="audit__actions">
          <view class="audit__btn audit__btn--reject" hover-class="audit__btn--hover" @tap="doReview(false)">
            <text class="audit__btn-text">驳回</text>
          </view>
          <view class="audit__btn audit__btn--approve" hover-class="audit__btn--hover" @tap="doReview(true)">
            <text class="audit__btn-text audit__btn-text--on-primary">通过</text>
          </view>
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
const opinion = ref('');
const reviewing = ref(false);

const submission = computed(() => submissionStore.detail);
const isRejected = computed(() => submission.value?.status === 'REJECTED');
const opinionPlaceholder = computed(() => '填写审核意见（驳回时必填，通过时选填）');

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

function onPreview(name: string): void {
  uni.showToast({ title: `预览 ${name}（演示）`, icon: 'none' });
}

async function doReview(approved: boolean): Promise<void> {
  if (reviewing.value || !submission.value) return;
  if (!approved && !opinion.value.trim()) {
    uni.showToast({ title: '请填写驳回意见', icon: 'none' });
    return;
  }
  reviewing.value = true;
  try {
    await submissionStore.review(submission.value.id, approved, opinion.value.trim());
    opinion.value = '';
    uni.redirectTo({ url: `/pages/review-result/index?submissionId=${submissionId.value}` });
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '操作失败，请重试', icon: 'none' });
  } finally {
    reviewing.value = false;
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 60rpx;
}

.head {
  background: $surface;
  padding: 32rpx;
}

.head__top {
  @include flex-row(space-between);
}

.head__version {
  font-size: $font-tag;
  color: $text-3;
}

.head__title {
  display: block;
  margin-top: 20rpx;
  font-size: $font-title;
  font-weight: 600;
  color: $text-1;
  line-height: 1.4;
}

.head__time {
  display: block;
  margin-top: 16rpx;
  font-size: $font-tag;
  color: $text-3;
}

.block {
  margin: 20rpx 32rpx 0;
  padding: 28rpx 32rpx;
  background: $surface;
  border-radius: $radius-card;
}

.block__title {
  display: block;
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
  margin-bottom: 16rpx;
}

.block__text {
  font-size: $font-body;
  color: $text-2;
  line-height: 1.7;
}

.block__text--muted {
  color: $text-3;
}

.row {
  @include flex-row(space-between);
  padding: 14rpx 0;
}

.row__label {
  font-size: $font-label;
  color: $text-3;
}

.row__value {
  font-size: $font-label;
  color: $text-1;
}

.row__value--danger {
  color: $danger;
}

.row__value--success {
  color: $success;
}

.audit-status {
  padding: 20rpx 0 8rpx;
}

.audit-status__text {
  font-size: $font-body;
  color: $text-2;
}

.opinion {
  margin-top: 16rpx;
  padding: 20rpx;
  background: $success-bg;
  border-radius: 8rpx;
}

.opinion--danger {
  background: $danger-bg;
}

.opinion__label {
  display: block;
  font-size: $font-xs;
  color: $text-2;
  margin-bottom: 8rpx;
}

.opinion__text {
  font-size: $font-label;
  color: $text-1;
  line-height: 1.6;
}

/* ---------- 模拟审核 ---------- */
.audit {
  margin: 20rpx 32rpx 0;
  padding: 28rpx 32rpx;
  background: $surface;
  border: 1rpx dashed $border;
  border-radius: $radius-card;
}

.audit__head {
  @include flex-row(space-between);
}

.audit__title {
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
}

.audit__hint {
  font-size: $font-xs;
  color: $text-3;
}

.audit__desc {
  display: block;
  margin-top: 12rpx;
  font-size: $font-tag;
  color: $text-3;
  line-height: 1.6;
}

.audit__input {
  width: 100%;
  height: 140rpx;
  margin-top: 20rpx;
  padding: 20rpx;
  box-sizing: border-box;
  background: $bg;
  border-radius: $radius-input;
  font-size: $font-label;
  color: $text-1;
  line-height: 1.6;
}

.audit__placeholder {
  color: $text-3;
  font-size: $font-label;
}

.audit__actions {
  display: flex;
  flex-direction: row;
  margin-top: 24rpx;
}

.audit__btn {
  flex: 1;
  height: 76rpx;
  border-radius: $radius-btn;
  @include flex-center;
  margin: 0 10rpx;
}

.audit__btn--reject {
  background: $danger-bg;
  border: 1rpx solid $danger-border;
}

.audit__btn--approve {
  background: $primary;
}

.audit__btn--hover {
  opacity: 0.85;
}

.audit__btn-text {
  font-size: $font-body;
  color: $danger;
}

.audit__btn-text--on-primary {
  color: $white;
}
</style>
