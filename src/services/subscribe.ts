const TEMPLATE_IDS = (import.meta.env.VITE_WECHAT_SUBSCRIBE_TEMPLATE_IDS as string | undefined)?.split(',').map((id) => id.trim()).filter(Boolean) ?? [];
export async function requestSubscribeMessage(): Promise<void> {
  // #ifdef MP-WEIXIN
  const wxApi = (globalThis as { wx?: { requestSubscribeMessage?: (options: { tmplIds: string[]; success: () => void; fail: () => void }) => void } }).wx;
  if (!wxApi?.requestSubscribeMessage || TEMPLATE_IDS.length === 0) throw new Error('暂未配置订阅消息模板');
  await new Promise<void>((resolve, reject) => wxApi.requestSubscribeMessage?.({ tmplIds: TEMPLATE_IDS, success: resolve, fail: () => reject(new Error('未完成订阅授权')) }));
  return;
  // #endif
  // #ifndef MP-WEIXIN
  throw new Error('不支持此环境');
  // #endif
}
