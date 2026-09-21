<template>
  <view class="page">
    <app-nav-bar title="任务详情" />

    <loading-state v-if="taskStore.detailLoading" />
    <error-state v-else-if="!task" desc="任务不存在或已下架。" @retry="reload" />

    <template v-else>
      <view class="head">
        <view class="head__top">
          <status-tag :status="task.bizStatus" />
          <text class="head__note">{{ task.statusNote }}</text>
        </view>
        <text class="head__title">{{ task.title }}</text>
        <view class="head__tags">
          <text class="head__tag">{{ task.category }}</text>
          <text class="head__tag head__tag--plain">{{ task.publisherName }} 发布</text>
        </view>
      </view>

      <view v-if="showRemind" class="remind" :class="{ 'remind--danger': task.bizStatus === 'OVERDUE' }">
        <text class="remind__text" :class="{ 'remind__text--danger': task.bizStatus === 'OVERDUE' }">{{ remindText }}</text>
      </view>

      <view v-if="task.bizStatus === 'REJECTED' && task.rejectSummary" class="reject">
        <text class="reject__label">审核意见</text>
        <text class="reject__text">{{ task.rejectSummary }}</text>
      </view>

      <view class="block">
        <view v-for="row in infoRows" :key="row.label" class="row">
          <text class="row__label">{{ row.label }}</text>
          <text class="row__value">{{ row.value }}</text>
        </view>
      </view>

      <view class="block">
        <text class="block__title">任务说明</text>
        <text class="block__text" :class="{ 'block__text--clamp': !expanded }">{{ task.description }}</text>
        <view class="block__toggle" hover-class="block__toggle--hover" @tap="expanded = !expanded">
          <text class="block__toggle-text">{{ expanded ? '收起' : '展开全部' }}</text>
          <uni-icons :type="expanded ? 'top' : 'bottom'" size="12" color="#1677FF" />
        </view>
      </view>

      <view v-if="task.attachments.length" class="block">
        <text class="block__title">附件模板（{{ task.attachments.length }}）</text>
        <file-row
          v-for="attachment in task.attachments"
          :key="attachment.id"
          :name="attachment.name"
          :format="attachment.format"
          :size-kb="attachment.sizeKB"
          :sub="attachment.note"
          @tap="onDownload(attachment)"
        />
      </view>
    </template>

    <view v-if="task" class="footer">
      <view class="footer__inner">
        <view class="g-btn g-btn-primary" hover-class="footer__btn--hover" @tap="onPrimary">
          <text class="footer__btn-text">{{ primary.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import type { TaskAttachment } from '@/types';
import { useTaskStore } from '@/stores/task';
import { fullDateTime, deadlineText } from '@/services/format';
import { primaryActionOf } from '@/services/domain';
import { runTaskPrimaryAction } from '@/services/navigation';

const taskStore = useTaskStore();

const taskId = ref('');
const expanded = ref(false);

const task = computed(() => taskStore.detail);

const primary = computed(() => primaryActionOf(task.value?.bizStatus ?? 'NOT_STARTED'));

const showRemind = computed(() => {
  const status = task.value?.bizStatus;
  return status === 'DUE_SOON' || status === 'OVERDUE' || status === 'IN_PROGRESS';
});

/** 提醒条文案：逾期与在办语义不同，避免与状态标签重复 */
const remindText = computed(() => {
  const t = task.value;
  if (!t) return '';
  if (t.bizStatus === 'OVERDUE') {
    return `已超过截止时间（${deadlineText(t.deadline)}），请尽快补交材料`;
  }
  return `${deadlineText(t.deadline)} 截止 · ${t.statusNote}`;
});

const infoRows = computed(() => {
  const t = task.value;
  if (!t) return [];
  const rows = [
    { label: '截止时间', value: fullDateTime(t.deadline) },
    { label: '负责人', value: t.ownerName },
    { label: '任务类型', value: t.category },
    { label: '发布时间', value: `${fullDateTime(t.publishedAt)} · ${t.publisherName}` },
  ];
  if (t.guide) {
    rows.push({ label: '依据文号', value: t.guide });
  }
  return rows;
});

onLoad((query) => {
  const id = query && typeof query.id === 'string' ? query.id : '';
  taskId.value = id;
  if (id) {
    void taskStore.loadDetail(id);
  }
});

function reload(): void {
  if (taskId.value) {
    void taskStore.loadDetail(taskId.value);
  }
}

function onPrimary(): void {
  if (task.value) {
    runTaskPrimaryAction(task.value);
  }
}

function onDownload(attachment: TaskAttachment): void {
  uni.showToast({ title: `已开始下载 ${attachment.name}`, icon: 'none' });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg;
  padding-bottom: 200rpx;
  @include safe-bottom(200rpx);
}

/* ---------- 标题区 ---------- */
.head {
  background: $surface;
  padding: 32rpx;
}

.head__top {
  @include flex-row(space-between);
}

.head__note {
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

.head__tags {
  @include flex-row();
  margin-top: 20rpx;
}

.head__tag {
  height: 44rpx;
  padding: 0 16rpx;
  margin-right: 12rpx;
  border-radius: 8rpx;
  background: $primary-light;
  color: $primary;
  font-size: $font-tag;
  @include flex-center;
}

.head__tag--plain {
  background: $bg;
  color: $text-2;
}

/* ---------- 提醒 / 驳回 ---------- */
.remind {
  margin: 20rpx 32rpx 0;
  padding: 20rpx 24rpx;
  background: $warning-bg;
  border-radius: $radius-card;
}

.remind--danger {
  background: $danger-bg;
}

.remind__text {
  font-size: $font-label;
  color: $warning;
}

.remind__text--danger {
  color: $danger;
}

.reject {
  margin: 20rpx 32rpx 0;
  padding: 24rpx;
  background: $danger-bg;
  border-radius: $radius-card;
}

.reject__label {
  display: block;
  font-size: $font-xs;
  color: $danger;
  margin-bottom: 8rpx;
}

.reject__text {
  font-size: $font-label;
  color: $text-1;
  line-height: 1.6;
}

/* ---------- 信息区 ---------- */
.block {
  margin: 20rpx 32rpx 0;
  padding: 28rpx 32rpx;
  background: $surface;
  border-radius: $radius-card;
}

.row {
  @include flex-row(space-between);
  padding: 14rpx 0;
}

.row__label {
  font-size: $font-label;
  color: $text-3;
  flex-shrink: 0;
  width: 160rpx;
}

.row__value {
  flex: 1;
  text-align: right;
  font-size: $font-label;
  color: $text-1;
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

.block__text--clamp {
  @include ellipsis(3);
}

.block__toggle {
  @include flex-row();
  margin-top: 16rpx;
}

.block__toggle--hover {
  opacity: 0.6;
}

.block__toggle-text {
  font-size: $font-tag;
  color: $primary;
  margin-right: 4rpx;
}

/* ---------- 底部主按钮 ---------- */
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
