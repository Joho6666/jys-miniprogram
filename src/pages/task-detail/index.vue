<template>
  <view class="page">
    <app-nav-bar title="任务详情" />

    <loading-state v-if="taskStore.detailLoading" />
    <error-state v-else-if="!task" desc="任务不存在或已下架。" @retry="reload" />

    <template v-else>
      <!-- 标题区 -->
      <view class="head">
        <view class="head__top">
          <app-icon name="paperclip" tone="primary" variant="soft" size="lg" radius="circle" />
          <view class="head__main">
            <text class="head__title">{{ task.title }}</text>
            <view class="head__badge">
              <status-tag :status="badge.key" :label="badge.label" />
              <text class="head__remain">{{ remain }}</text>
            </view>
          </view>
        </view>
        <view class="head__tags">
          <text v-for="tag in task.tags" :key="tag" class="head__tag">{{ tag }}</text>
        </view>
      </view>

      <view v-if="showRemind" class="remind" :class="{ 'remind--danger': task.bizStatus === 'OVERDUE' }">
        <text class="remind__text" :class="{ 'remind__text--danger': task.bizStatus === 'OVERDUE' }">{{ remindText }}</text>
      </view>

      <!-- 基本信息 -->
      <view class="block">
        <view class="row">
          <app-icon name="paperplane" tone="neutral" variant="plain" size="sm" />
          <text class="row__label">发布时间</text>
          <text class="row__value">{{ fullDateTime(task.publishedAt) }}</text>
        </view>
        <view class="row">
          <app-icon :name="deadlineIcon" :tone="deadlineTone" variant="plain" size="sm" />
          <text class="row__label">截止时间</text>
          <text class="row__value" :class="{ 'row__value--danger': task.bizStatus === 'OVERDUE' }">
            {{ fullDateTime(task.deadline) }}
          </text>
        </view>
        <view class="row">
          <app-icon name="person" tone="neutral" variant="plain" size="sm" />
          <text class="row__label">负责人</text>
          <text class="row__value">{{ task.ownerName }}</text>
          <view class="row__op" hover-class="row__op--hover" @tap="onCall(task.ownerName)">
            <app-icon name="phone" tone="primary" variant="plain" size="sm" />
          </view>
        </view>
        <view class="row">
          <app-icon name="flag" tone="neutral" variant="plain" size="sm" />
          <text class="row__label">任务状态</text>
          <view class="row__value row__value--badge">
            <status-tag :status="task.bizStatus" />
          </view>
        </view>
        <view v-if="task.guide" class="row">
          <app-icon name="info" tone="neutral" variant="plain" size="sm" />
          <text class="row__label">依据文号</text>
          <text class="row__value">{{ task.guide }}</text>
        </view>
      </view>

      <!-- 任务说明 -->
      <view class="block">
        <view class="block__head">
          <view class="block__bar" />
          <text class="block__title">任务说明</text>
        </view>
        <text class="block__text" :class="{ 'block__text--clamp': !expanded }">{{ task.description }}</text>
        <view class="block__toggle" hover-class="block__toggle--hover" @tap="expanded = !expanded">
          <text class="block__toggle-text">{{ expanded ? '收起' : '展开全部' }}</text>
          <uni-icons :type="expanded ? 'top' : 'bottom'" size="12" color="#1677FF" />
        </view>
      </view>

      <!-- 附件下载 -->
      <view v-if="task.attachments.length" class="block">
        <view class="block__head">
          <view class="block__bar" />
          <text class="block__title">附件下载（{{ task.attachments.length }}）</text>
        </view>
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

      <!-- 驳回意见 -->
      <view v-if="task.bizStatus === 'REJECTED' && task.rejectSummary" class="reject">
        <text class="reject__label">审核意见</text>
        <text class="reject__text">{{ task.rejectSummary }}</text>
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
import type { IconTone, TaskAttachment } from '@/types';
import { useTaskStore } from '@/stores/task';
import { fullDateTime, deadlineText } from '@/services/format';
import { primaryActionOf, remainShortText, taskBadgeOf, urgencyOf } from '@/services/domain';
import { runTaskPrimaryAction } from '@/services/navigation';
import { usePageShare } from '@/services/share';

/** 分享单条任务：标题用任务名，落地到详情页 */
usePageShare(() => {
  const t = task.value;
  if (!t) {
    return { title: '教研室事务助手 · 教师端' };
  }
  return {
    title: `${t.title}`,
    path: `/pages/task-detail/index?id=${t.id}`,
  };
});

const taskStore = useTaskStore();

const taskId = ref('');
const expanded = ref(false);

const task = computed(() => taskStore.detail);
const primary = computed(() => primaryActionOf(task.value?.bizStatus ?? 'NOT_STARTED'));
const badge = computed(() => taskBadgeOf(task.value as NonNullable<typeof task.value>));
const remain = computed(() => (task.value ? remainShortText(task.value.deadline) : ''));

const showRemind = computed(() => {
  const status = task.value?.bizStatus;
  return status === 'DUE_SOON' || status === 'OVERDUE' || status === 'IN_PROGRESS';
});

/** 截止时间图标随紧急度变化 */
const deadlineTone = computed<IconTone>(() => (urgencyOf(task.value?.deadline ?? '') === 'URGENT' ? 'danger' : 'neutral'));
const deadlineIcon = 'calendar';

/** 提醒条文案：逾期与在办语义不同，避免与状态标签重复 */
const remindText = computed(() => {
  const t = task.value;
  if (!t) return '';
  if (t.bizStatus === 'OVERDUE') {
    return `已超过截止时间（${deadlineText(t.deadline)}），请尽快补交材料`;
  }
  return `${deadlineText(t.deadline)} 截止 · ${t.statusNote}`;
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

function onCall(name: string): void {
  uni.showToast({ title: `拨号联系 ${name}（演示）`, icon: 'none' });
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
  display: flex;
  flex-direction: row;
}

.head__main {
  flex: 1;
  margin-left: 20rpx;
  min-width: 0;
}

.head__title {
  display: block;
  font-size: $font-title;
  font-weight: 600;
  color: $text-1;
  line-height: 1.4;
}

.head__badge {
  @include flex-row();
  margin-top: 16rpx;
}

.head__remain {
  margin-left: 12rpx;
  font-size: $font-tag;
  color: $text-3;
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
  @include flex-row();
  padding: 14rpx 0;
}

.row__label {
  margin-left: 12rpx;
  font-size: $font-label;
  color: $text-3;
  flex-shrink: 0;
  width: 140rpx;
}

.row__value {
  flex: 1;
  text-align: right;
  font-size: $font-label;
  color: $text-1;
}

.row__value--danger {
  color: $danger;
}

.row__value--badge {
  @include flex-row(flex-end);
}

.row__op {
  width: 48rpx;
  height: 48rpx;
  margin-left: 8rpx;
  @include flex-center;
  border-radius: 50%;
}

.row__op--hover {
  background: $primary-light;
}

.block__head {
  @include flex-row();
  margin-bottom: 16rpx;
}

.block__bar {
  width: 6rpx;
  height: 28rpx;
  border-radius: 4rpx;
  background: $primary;
  margin-right: 12rpx;
}

.block__title {
  font-size: $font-md;
  font-weight: 600;
  color: $text-1;
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
