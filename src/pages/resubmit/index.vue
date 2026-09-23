<template>
  <view class="page">
    <app-nav-bar title="重新提交" />

    <loading-state v-if="loading" />

    <template v-else>
      <view class="alert">
        <text class="alert__title">材料需要修改</text>
        <text class="alert__desc">请根据审核意见修改后重新提交，重新提交将生成 V{{ nextVersion }}。</text>
      </view>

      <view v-if="rejectOpinion" class="opinion">
        <text class="opinion__label">审核意见</text>
        <text class="opinion__text">{{ rejectOpinion }}</text>
        <text v-if="reviewerName" class="opinion__meta">{{ reviewerName }} · {{ reviewedAt }}</text>
      </view>

      <view v-if="task" class="task">
        <text class="task__label">关联任务</text>
        <text class="task__title">{{ task.title }}</text>
        <text class="task__deadline">截止 {{ deadlineText(task.deadline) }} · {{ task.statusNote }}</text>
      </view>

      <view class="block">
        <text class="block__title">原提交材料（{{ existingCount }}）</text>
        <upload-file-row
          v-for="item in existingItems"
          :key="item.id"
          :item="item"
          @remove="onRemove"
          @preview="onPreview"
          @replace="onReplace"
        />
        <view class="upload" hover-class="upload--hover" @tap="chooseFiles">
          <uni-icons type="plus" size="22" color="#1677FF" />
          <text class="upload__text">继续添加文件</text>
        </view>
      </view>

      <view v-if="newItems.length" class="block">
        <text class="block__title">本次新增（{{ newItems.length }}）</text>
        <upload-file-row
          v-for="item in newItems"
          :key="item.id"
          :item="item"
          @remove="onRemove"
          @retry="onRetry"
          @preview="onPreview"
          @replace="onReplace"
        />
      </view>

      <view class="block">
        <view class="note__head">
          <text class="block__title">提交说明</text>
          <text class="note__count">{{ note.length }}/500</text>
        </view>
        <textarea
          v-model="note"
          class="note__input"
          maxlength="500"
          placeholder="说明本次修改内容（选填）"
          placeholder-class="note__placeholder"
        />
      </view>
    </template>

    <view class="footer">
      <view class="footer__inner">
        <view class="g-btn g-btn-primary" hover-class="footer__btn--hover" @tap="onSubmit">
          <text class="footer__btn-text">重新提交</text>
        </view>
      </view>
    </view>

    <confirm-modal
      :visible="confirmVisible"
      title="确认重新提交？"
      content="重新提交后将生成新版本并再次进入审核流程，审核期间不可修改。"
      confirm-text="确认重新提交"
      @confirm="doSubmit"
      @cancel="confirmVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onUnload, onShow } from '@dcloudio/uni-app';
import type { SubmittedFile, UploadItem } from '@/types';
import { fetchSubmissionOfTask } from '@/api/submission';
import { useTaskStore } from '@/stores/task';
import { useSubmissionStore } from '@/stores/submission';
import { pickFiles } from '@/services/picker';
import { deadlineText, fullDateTime, nowText } from '@/services/format';
import { uploadFile } from '@/api/file';
import { isMockMode } from '@/services/http';
import { previewRemoteFile } from '@/services/file-preview';

const MAX_COUNT = 5;

const taskStore = useTaskStore();
const submissionStore = useSubmissionStore();

const taskId = ref('');
const items = ref<UploadItem[]>([]);
const note = ref('');
const rejectOpinion = ref('');
const reviewerName = ref('');
const reviewedAt = ref('');
const nextVersion = ref(2);
const loading = ref(true);
const confirmVisible = ref(false);

const timers: Record<string, ReturnType<typeof setInterval>> = {};

const task = computed(() => taskStore.detail);

const existingItems = computed(() => items.value.filter((item) => item.serverFileId && !item.localPath));
const newItems = computed(() => items.value.filter((item) => Boolean(item.localPath)));
const existingCount = computed(() => existingItems.value.length);

const canSubmit = computed(() => {
  if (!items.value.length) return false;
  return items.value.every((item) => item.state === 'SUCCESS');
});
onShow(() => uni.hideShareMenu({ hideShareItems: ['shareAppMessage', 'shareTimeline'] }));

onLoad(async (query) => {
  const id = query && typeof query.taskId === 'string' ? query.taskId : '';
  taskId.value = id;
  if (!id) {
    loading.value = false;
    return;
  }
  await taskStore.loadDetail(id);
  const latest = await fetchSubmissionOfTask(id);
  if (latest) {
    rejectOpinion.value = latest.reviewOpinion ?? '';
    reviewerName.value = latest.reviewerName ?? '';
    reviewedAt.value = latest.reviewedAt ? fullDateTime(latest.reviewedAt) : '';
    nextVersion.value = latest.version + 1;
    items.value = latest.files.map((file) => ({
      id: file.id,
      serverFileId: file.id,
      localPath: '',
      name: file.name,
      format: file.format,
      sizeKB: file.sizeKB,
      path: '',
      progress: 100,
      state: 'SUCCESS' as const,
    }));
  }
  loading.value = false;
});

onUnload(() => {
  Object.keys(timers).forEach((key) => clearInterval(timers[key]));
});

function startUpload(id: string): void {
  const target = items.value.find((item) => item.id === id);
  if (!target) return;
  if (!isMockMode()) {
    target.state = 'UPLOADING';
    void uploadFile(target.localPath, (progress) => { target.progress = progress; }).then((uploaded) => { target.serverFileId = uploaded.id; target.progress = 100; target.state = 'SUCCESS'; }).catch((error) => { target.state = 'FAILED'; target.error = error instanceof Error ? error.message : '上传失败'; });
    return;
  }
  const timer = setInterval(() => {
    const target = items.value.find((item) => item.id === id);
    if (!target) {
      clearInterval(timer);
      return;
    }
    target.progress = Math.min(100, target.progress + Math.round(8 + Math.random() * 14));
    if (target.progress >= 100) {
      target.state = 'SUCCESS';
      clearInterval(timer);
      delete timers[id];
    }
  }, 220);
  timers[id] = timer;
}

async function chooseFiles(): Promise<void> {
  if (items.value.length >= MAX_COUNT) {
    uni.showToast({ title: `最多上传 ${MAX_COUNT} 个文件`, icon: 'none' });
    return;
  }
  try {
    const picked = await pickFiles(MAX_COUNT - items.value.length);
    picked.forEach((file) => {
      const id = `up-${Date.now()}-${items.value.length}`;
      items.value.push({
        id,
        localPath: file.path,
        name: file.name,
        format: file.format,
        sizeKB: file.sizeKB,
        path: file.path,
        progress: 0,
        state: 'PENDING',
      });
      startUpload(id);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '选择文件失败';
    if (message !== '已取消选择') {
      uni.showToast({ title: message, icon: 'none' });
    }
  }
}

async function onReplace(target: UploadItem): Promise<void> {
  try {
    const picked = await pickFiles(1);
    const file = picked[0];
    if (!file) return;
    const current = items.value.find((item) => item.id === target.id);
    if (!current) return;
    current.name = file.name;
    current.sizeKB = file.sizeKB;
    current.path = file.path;
    current.localPath = file.path;
    current.serverFileId = undefined;
    current.format = file.format;
    current.progress = 0;
    current.state = 'PENDING';
    current.error = '';
    startUpload(current.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : '选择文件失败';
    if (message !== '已取消选择') {
      uni.showToast({ title: message, icon: 'none' });
    }
  }
}

function onRemove(target: UploadItem): void {
  const timer = timers[target.id];
  if (timer) {
    clearInterval(timer);
    delete timers[target.id];
  }
  items.value = items.value.filter((item) => item.id !== target.id);
}

function onRetry(target: UploadItem): void {
  const current = items.value.find((item) => item.id === target.id);
  if (!current) return;
  current.state = 'PENDING';
  current.progress = 0;
  current.error = '';
  startUpload(current.id);
}

function onPreview(target: UploadItem): void {
  void previewRemoteFile(target.serverFileId ?? target.id, target.name);
}

function onSubmit(): void {
  if (submissionStore.submitting) return;
  if (!items.value.length) {
    uni.showToast({ title: '请至少保留一个文件', icon: 'none' });
    return;
  }
  if (!canSubmit.value) {
    uni.showToast({ title: '请等待文件上传完成', icon: 'none' });
    return;
  }
  confirmVisible.value = true;
}

async function doSubmit(): Promise<void> {
  if (submissionStore.submitting) return;
  confirmVisible.value = false;
  const files: SubmittedFile[] = items.value.map((item) => ({
    id: item.serverFileId ?? item.id,
    name: item.name,
    format: item.format,
    sizeKB: item.sizeKB,
    uploadedAt: nowText(),
  }));
  try {
    const submissionId = await submissionStore.resubmit(taskId.value, files, note.value);
    uni.redirectTo({ url: `/pages/submit-success/index?submissionId=${submissionId}` });
  } catch (error) {
    uni.showToast({ title: error instanceof Error ? error.message : '提交失败，请重试', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 220rpx;
  @include safe-bottom(220rpx);
}

.alert {
  margin: 24rpx 32rpx 0;
  padding: 28rpx 32rpx;
  background: $danger-bg;
  border-radius: $radius-card;
}

.alert__title {
  display: block;
  font-size: $font-md;
  font-weight: 600;
  color: $danger;
}

.alert__desc {
  display: block;
  margin-top: 10rpx;
  font-size: $font-tag;
  color: $text-2;
  line-height: 1.6;
}

.opinion {
  margin: 20rpx 32rpx 0;
  padding: 28rpx 32rpx;
  background: $surface;
  border-radius: $radius-card;
}

.opinion__label {
  display: block;
  font-size: $font-xs;
  color: $text-3;
  margin-bottom: 10rpx;
}

.opinion__text {
  font-size: $font-body;
  color: $text-1;
  line-height: 1.7;
}

.opinion__meta {
  display: block;
  margin-top: 14rpx;
  font-size: $font-tag;
  color: $text-3;
}

.task {
  margin: 20rpx 32rpx 0;
  padding: 28rpx 32rpx;
  background: $surface;
  border-radius: $radius-card;
}

.task__label {
  display: block;
  font-size: $font-tag;
  color: $text-3;
}

.task__title {
  display: block;
  margin-top: 12rpx;
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
  line-height: 1.4;
}

.task__deadline {
  display: block;
  margin-top: 12rpx;
  font-size: $font-tag;
  color: $text-2;
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
}

.upload {
  @include flex-row();
  height: 96rpx;
  margin-top: 20rpx;
  padding: 0 24rpx;
  border: 1rpx dashed $primary;
  border-radius: $radius-card;
  background: $primary-light;
}

.upload--hover {
  opacity: 0.85;
}

.upload__text {
  margin-left: 12rpx;
  font-size: $font-body;
  color: $primary;
}

.note__head {
  @include flex-row(space-between);
}

.note__count {
  font-size: $font-tag;
  color: $text-3;
}

.note__input {
  width: 100%;
  height: 200rpx;
  margin-top: 20rpx;
  padding: 20rpx;
  box-sizing: border-box;
  background: $bg;
  border-radius: $radius-input;
  font-size: $font-body;
  color: $text-1;
  line-height: 1.6;
}

.note__placeholder {
  color: $text-3;
  font-size: $font-body;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  background: $surface;
  border-top: 1rpx solid $border;
  @include safe-bottom();
}

.footer__inner {
  padding: 16rpx 32rpx;
}

.footer__btn--hover {
  background: $primary-pressed;
}

.footer__btn-text {
  font-size: 32rpx;
  font-weight: 500;
  color: $white;
}
</style>
