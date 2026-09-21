<template>
  <view class="page">
    <app-nav-bar title="提交材料" />

    <loading-state v-if="taskStore.detailLoading && !task" />

    <template v-else>
      <view v-if="task" class="task">
        <text class="task__label">当前任务</text>
        <text class="task__title">{{ task.title }}</text>
        <text class="task__deadline">截止 {{ deadlineText(task.deadline) }} · {{ task.statusNote }}</text>
      </view>

      <view class="block">
        <view class="upload" hover-class="upload--hover" @tap="chooseFiles">
          <view class="upload__icon">
            <uni-icons type="plus" size="26" color="#1677FF" />
          </view>
          <text class="upload__title">点击选择文件</text>
          <text class="upload__desc">支持 PDF / Word / Excel / PPT / 图片，单个文件不超过 20MB</text>
        </view>

        <view v-if="items.length" class="list">
          <upload-file-row
            v-for="item in items"
            :key="item.id"
            :item="item"
            @remove="onRemove"
            @retry="onRetry"
            @preview="onPreview"
            @replace="onReplace"
          />
        </view>
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
          placeholder="补充说明（选填），如材料清单、版本说明等"
          placeholder-class="note__placeholder"
        />
      </view>

      <view class="tips">
        <text class="tips__title">温馨提示</text>
        <text class="tips__item">1. 请确认文件内容完整、清晰，命名规范，便于审核与归档；</text>
        <text class="tips__item">2. 提交后材料进入审核流程，审核期间不可修改；</text>
        <text class="tips__item">3. 若材料被驳回，可查看审核意见后修改并重新提交。</text>
      </view>
    </template>

    <view class="footer">
      <view class="footer__inner">
        <view class="footer__clear" hover-class="footer__clear--hover" @tap="clearVisible = true">
          <text class="footer__clear-text">清空</text>
        </view>
        <view class="g-btn g-btn-primary footer__submit" hover-class="footer__submit--hover" @tap="onSubmit">
          <text class="footer__submit-text">确认提交</text>
        </view>
      </view>
    </view>

    <confirm-modal
      :visible="confirmVisible"
      title="确认提交材料？"
      content="提交后材料将进入审核流程，审核期间不可修改。"
      confirm-text="确认提交"
      @confirm="doSubmit"
      @cancel="confirmVisible = false"
    />

    <confirm-modal
      :visible="clearVisible"
      title="清空已选材料？"
      content="清空后需要重新选择文件。"
      confirm-text="清空"
      danger
      @confirm="doClear"
      @cancel="clearVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import type { SubmittedFile, UploadItem } from '@/types';
import { useTaskStore } from '@/stores/task';
import { useSubmissionStore } from '@/stores/submission';
import { pickFiles } from '@/services/picker';
import { deadlineText, nowText } from '@/services/format';

const MAX_COUNT = 5;

const taskStore = useTaskStore();
const submissionStore = useSubmissionStore();

const taskId = ref('');
const items = ref<UploadItem[]>([]);
const note = ref('');
const confirmVisible = ref(false);
const clearVisible = ref(false);

const timers: Record<string, ReturnType<typeof setInterval>> = {};

const task = computed(() => taskStore.detail);

const canSubmit = computed(() => {
  if (!items.value.length) return false;
  return items.value.every((item) => item.state === 'SUCCESS');
});

onLoad((query) => {
  const id = query && typeof query.taskId === 'string' ? query.taskId : '';
  taskId.value = id;
  if (id) {
    void taskStore.loadDetail(id);
  }
});

onUnload(() => {
  Object.keys(timers).forEach((key) => clearInterval(timers[key]));
});

function startUpload(id: string): void {
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

function addFile(name: string, sizeKB: number, path: string, format: UploadItem['format']): void {
  const id = `up-${Date.now()}-${items.value.length}`;
  items.value.push({
    id,
    name,
    sizeKB,
    path,
    format,
    progress: 0,
    state: 'PENDING',
  });
  startUpload(id);
}

async function chooseFiles(): Promise<void> {
  if (items.value.length >= MAX_COUNT) {
    uni.showToast({ title: `最多上传 ${MAX_COUNT} 个文件`, icon: 'none' });
    return;
  }
  try {
    const picked = await pickFiles(MAX_COUNT - items.value.length);
    picked.forEach((file) => addFile(file.name, file.sizeKB, file.path, file.format));
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
  uni.showToast({ title: `预览 ${target.name}（演示）`, icon: 'none' });
}

function doClear(): void {
  Object.keys(timers).forEach((key) => clearInterval(timers[key]));
  items.value = [];
  note.value = '';
  clearVisible.value = false;
}

function onSubmit(): void {
  if (!items.value.length) {
    uni.showToast({ title: '请先选择要提交的材料', icon: 'none' });
    return;
  }
  if (!canSubmit.value) {
    uni.showToast({ title: '请等待文件上传完成', icon: 'none' });
    return;
  }
  confirmVisible.value = true;
}

async function doSubmit(): Promise<void> {
  confirmVisible.value = false;
  const files: SubmittedFile[] = items.value.map((item) => ({
    id: item.id,
    name: item.name,
    format: item.format,
    sizeKB: item.sizeKB,
    uploadedAt: nowText(),
  }));
  try {
    const submissionId = await submissionStore.submit(taskId.value, files, note.value);
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

/* ---------- 任务信息 ---------- */
.task {
  background: $surface;
  padding: 32rpx;
}

.task__label {
  display: block;
  font-size: $font-tag;
  color: $text-3;
}

.task__title {
  display: block;
  margin-top: 12rpx;
  font-size: $font-title;
  font-weight: 600;
  color: $text-1;
  line-height: 1.4;
}

.task__deadline {
  display: block;
  margin-top: 16rpx;
  font-size: $font-tag;
  color: $text-2;
}

/* ---------- 上传 ---------- */
.block {
  margin: 20rpx 32rpx 0;
  padding: 28rpx 32rpx;
  background: $surface;
  border-radius: $radius-card;
}

.upload {
  @include flex-center;
  flex-direction: column;
  padding: 48rpx 24rpx;
  border: 1rpx dashed $primary;
  border-radius: $radius-card;
  background: $primary-light;
}

.upload--hover {
  opacity: 0.85;
}

.upload__icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: $surface;
  @include flex-center;
}

.upload__title {
  margin-top: 20rpx;
  font-size: $font-body;
  font-weight: 500;
  color: $primary;
}

.upload__desc {
  margin-top: 10rpx;
  font-size: $font-tag;
  color: $text-2;
  text-align: center;
  line-height: 1.6;
}

.list {
  margin-top: 8rpx;
}

/* ---------- 提交说明 ---------- */
.note__head {
  @include flex-row(space-between);
}

.block__title {
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
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

/* ---------- 提示 ---------- */
.tips {
  margin: 20rpx 32rpx 0;
  padding: 28rpx 32rpx;
  background: $surface;
  border-radius: $radius-card;
}

.tips__title {
  display: block;
  font-size: $font-label;
  font-weight: 600;
  color: $text-1;
  margin-bottom: 12rpx;
}

.tips__item {
  display: block;
  font-size: $font-tag;
  color: $text-3;
  line-height: 1.7;
}

/* ---------- 底部 ---------- */
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
  @include flex-row();
  padding: 16rpx 32rpx;
}

.footer__clear {
  width: 160rpx;
  height: $btn-height;
  border: 1rpx solid $border;
  border-radius: $radius-btn;
  @include flex-center;
  margin-right: 20rpx;
}

.footer__clear--hover {
  background: $bg;
}

.footer__clear-text {
  font-size: 30rpx;
  color: $text-2;
}

.footer__submit {
  flex: 1;
}

.footer__submit--hover {
  background: $primary-pressed;
}

.footer__submit-text {
  font-size: 32rpx;
  font-weight: 500;
  color: $white;
}
</style>
