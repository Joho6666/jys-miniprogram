import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';

/**
 * 页面分享能力：右上角胶囊菜单「转发给好友」+「分享到朋友圈」。
 * 未接入本方法的页面，微信菜单里会显示「当前页面不可转发/不可分享」。
 */

export interface ShareContent {
  /** 分享卡片标题 */
  title: string;
  /** 好友转发落地页（朋友圈分享固定落在当前页，无需配置） */
  path?: string;
  /** 分享卡片图（5:4），不传则使用页面截图 */
  imageUrl?: string;
}

const APP_TITLE = '教研室事务助手 · 教师端';
const HOME_PATH = '/pages/home/index';

/** 打开小程序即点亮胶囊菜单的两个分享按钮 */
export function enableShareMenu(): void {
  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    withShareTicket: false,
    menus: ['shareAppMessage', 'shareTimeline'],
  });
  // #endif
}

/**
 * 页面级分享。getContent 在用户点击分享时才会执行，
 * 因此可以返回动态内容（如当前任务标题与详情路径）。
 */
export function usePageShare(getContent: () => ShareContent): void {
  onShareAppMessage(() => ({
    path: HOME_PATH,
    ...getContent(),
  }));

  // #ifdef MP-WEIXIN
  onShareTimeline(() => ({
    title: getContent().title,
    imageUrl: getContent().imageUrl,
  }));
  // #endif
}

/** 全局默认分享内容（流程页/工具页使用） */
export function defaultShare(): ShareContent {
  return { title: APP_TITLE, path: HOME_PATH };
}
