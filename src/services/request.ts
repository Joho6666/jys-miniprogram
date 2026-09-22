import { deepCopy } from '@/mock/db';

/**
 * 数据访问层（唯一入口）。
 *
 * - 当前为 Mock 模式：纯本地函数 + 约 300ms 模拟延迟，**不发起任何网络请求**；
 * - 接入 Spring Boot 后端时：配置环境变量 VITE_API_BASE 后切换为真实请求
 *   （后端地址与凭据只从环境变量读取，源码与示例不写任何可用凭据）。
 */

/** 后端服务地址（HTTP/HTTPS） */
export const API_BASE: string = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

/** 是否处于本地 Mock 模式 */
export const IS_MOCK: boolean = API_BASE === '' || import.meta.env.VITE_USE_MOCK === 'true';

const MOCK_DELAY = 300;

/** 模拟异步返回（返回深拷贝，隔离页面与内存库） */
export function mockCopy<T>(data: T, delay: number = MOCK_DELAY): Promise<T> {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(deepCopy(data)), delay);
  });
}

/** 模拟无返回值写操作 */
export function mockOk(delay: number = MOCK_DELAY): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), delay);
  });
}

/** 模拟业务失败（用于异常态演示） */
export function mockFail(message: string, delay: number = MOCK_DELAY): Promise<never> {
  return new Promise<never>((_resolve, reject) => {
    setTimeout(() => reject(new Error(message)), delay);
  });
}
