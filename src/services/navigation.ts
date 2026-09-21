import type { TaskView } from '@/types';
import { primaryActionOf } from './domain';

/** 任务详情 */
export function gotoTaskDetail(taskId: string): void {
  uni.navigateTo({ url: `/pages/task-detail/index?id=${taskId}` });
}

/** 提交材料 */
export function gotoSubmit(taskId: string): void {
  uni.navigateTo({ url: `/pages/submit/index?taskId=${taskId}` });
}

/** 重新提交（驳回后） */
export function gotoResubmit(taskId: string): void {
  uni.navigateTo({ url: `/pages/resubmit/index?taskId=${taskId}` });
}

/** 提交详情 */
export function gotoSubmissionDetail(submissionId: string): void {
  uni.navigateTo({ url: `/pages/submission-detail/index?submissionId=${submissionId}` });
}

/** 审核结果 */
export function gotoReviewResult(submissionId: string): void {
  uni.navigateTo({ url: `/pages/review-result/index?submissionId=${submissionId}` });
}

/** 执行任务主操作（列表卡与详情页底部按钮共用同一套状态规则） */
export function runTaskPrimaryAction(task: TaskView): void {
  const { action } = primaryActionOf(task.bizStatus);
  if (action === 'submit') {
    gotoSubmit(task.id);
    return;
  }
  if (action === 'resubmit') {
    gotoResubmit(task.id);
    return;
  }
  if (action === 'submission-detail') {
    if (task.latestSubmissionId) {
      gotoSubmissionDetail(task.latestSubmissionId);
    } else {
      gotoTaskDetail(task.id);
    }
    return;
  }
  if (action === 'review-result') {
    if (task.latestSubmissionId) {
      gotoReviewResult(task.latestSubmissionId);
    } else {
      gotoTaskDetail(task.id);
    }
    return;
  }
  gotoTaskDetail(task.id);
}
