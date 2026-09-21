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

      <!-- 上传材料 -->
      <view class="block">
        <view class="block__head">
          <view class="block__bar" />
          <view class="block__head-main">
            <text class="block__title">上传材料</text>
            <text class="block__desc">请按要求上传相关材料，支持多种格式文件</text>
          </view>
        </view>

        <view class="upload" hover-class="upload--hover" @tap="chooseFiles">
          <view class="upload__icon">
            <uni-icons type="plus" size="26" color="#1677FF" />
          </view>
          <text class="upload__title">点击上传文件</text>
          <text class="upload__desc">支持 PDF、Word、Excel、JPG、PNG</text>
          <text class="upload__desc">单个文件不超过 20MB</text>
        </view>

        <template v-if="items.length">
          <view class="list-head">
            <text class="list-head__title">已上传文件（{{ items.length }}）</text>
            <text class="list-head__action" hover-class="list-head__action--hover" @tap="clearVisible = true">清空</text>
          </view>
          <upload-file-row
            v-for="item in items"
            :key="item.id"
            :item="item"
            @remove="onRemove"
            @retry="onRetry"
            @preview="onPreview"
            @replace="onReplace"
          />
        </template>
      </view>

      <!-- 提交说明 -->
      <view class="block">
        <view class="block__head">
          <view class="block__bar" />
          <view class="block__head-main">
            <text class="block__title">提交说明（选填）</text>
          </view>
          <text class="note__count">{{ note.length }}/500</text>
        </view>
        <textarea
          v-model="note"
          class="note__input"
          maxlength="500"
          placeholder="请输入补充说明…"
          placeholder-class="note__placeholder"
        />
      </view>

      <!-- 温馨提示 -->
      <view class="tips">
        <view class="block__head">
          <view class="block__bar" />
          <text class="block__title">温馨提示</text>
        </view>
        <text class="tips__item">1. 请确保上传的材料清晰、完整、真实有效；</text>
        <text class="tips__item">2. 如需替换文件，请先删除后重新上传；</text>
        <text class="tips__item">3. 提交后如需修改，请联系负责人。</text>
      </view>
    </template>

    <view class="footer">
      <view class="footer__inner">
        <view class="g-btn g-btn-primary" hover-class="footer__submit--hover" @tap="onSubmit">
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
import { usePageShare } from '@/services/share';

usePageShare(() => ({ title: '教研室事务助手 · 教师端' }));

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
  padding-bottom: 200rpx;
  @include safe-bottom(200rpx);
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

/* ---------- 区块 ---------- */
.block {
  margin: 20rpx 32rpx 0;
  padding: 28rpx 32rpx;
  background: $surface;
  border-radius: $radius-card;
}

.block__head {
  @include flex-row();
  margin-bottom: 20rpx;
}

.block__bar {
  width: 6rpx;
  height: 28rpx;
  border-radius: 4rpx;
  background: $primary;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.block__head-main {
  flex: 1;
  min-width: 0;
}

.block__title {
  display: block;
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
}

.block__desc {
  display: block;
  margin-top: 8rpx;
  font-size: $font-tag;
  color: $text-3;
}

/* ---------- 上传区 ---------- */
.upload {
  @include flex-center;
  flex-direction: column;
  padding: 44rpx 24rpx;
  border: 1rpx dashed $primary;
  border-radius: $radius-card;
  background: $bg;
}

.upload--hover {
  background: $primary-light;
}

.upload__icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: $primary-light;
  @include flex-center;
}

.upload__title {
  margin-top: 20rpx;
  font-size: $font-body;
  font-weight: 500;
  color: $primary;
}

.upload__desc {
  margin-top: 8rpx;
  font-size: $font-tag;
  color: $text-3;
  line-height: 1.5;
}

/* ---------- 已上传文件 ---------- */
.list-head {
  @include flex-row(space-between);
  margin-top: 32rpx;
  padding-bottom: 8rpx;
}

.list-head__title {
  font-size: $font-label;
  font-weight: 500;
  color: $text-1;
}

.list-head__action {
  font-size: $font-label;
  color: $primary;
}

.list-head__action--hover {
  opacity: 0.6;
}

/* ---------- 提交说明 ---------- */
.note__count {
  font-size: $font-tag;
  color: $text-3;
}

.note__input {
  width: 100%;
  height: 200rpx;
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

.tips__item {
  display: block;
  font-size: $font-tag;
  color: $text-3;
  line-height: 1.8;
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
  padding: 16rpx 32rpx;
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
