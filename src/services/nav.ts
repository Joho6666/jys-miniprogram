/**
 * 自定义导航尺寸适配（微信胶囊避让 / 状态栏 / 安全区）
 * 计算结果在单次运行内缓存。
 */
export interface NavMetrics {
  /** 状态栏高度（px） */
  statusBarHeight: number;
  /** 导航内容区高度（px），微信下与胶囊等高 */
  navHeight: number;
  /** 右侧胶囊避让宽度（px） */
  capsuleRight: number;
  /** 窗口宽度（px） */
  windowWidth: number;
}

let cached: NavMetrics | null = null;

export function getNavMetrics(): NavMetrics {
  if (cached) return cached;

  let statusBarHeight = 0;
  let navHeight = 44;
  let capsuleRight = 0;
  let windowWidth = 375;

  try {
    const sys = uni.getSystemInfoSync();
    statusBarHeight = sys.statusBarHeight ? sys.statusBarHeight : 0;
    windowWidth = sys.windowWidth ? sys.windowWidth : 375;

    // #ifdef MP-WEIXIN
    const rect = uni.getMenuButtonBoundingClientRect();
    if (rect && rect.height > 0) {
      navHeight = (rect.top - statusBarHeight) * 2 + rect.height;
      capsuleRight = Math.max(0, windowWidth - rect.left);
    }
    // #endif
  } catch (error) {
    // 保底默认值
  }

  cached = { statusBarHeight, navHeight, capsuleRight, windowWidth };
  return cached;
}
