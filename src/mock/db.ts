import dayjs from 'dayjs';

/**
 * 模拟数据时间基准。
 * 说明：以「模块加载时刻」为基准生成相对时间轴（at(-3,'18:00') = 3 天前 18:00），
 * 这样无论何时打开演示，「即将截止 / 已逾期 / 剩余天数」都成立且真实。
 * 同一次运行内 MOCK_NOW 固定，保证数据稳定、可复现。
 */
export const MOCK_NOW = dayjs();

/** 生成相对当前时刻的时间字符串：dayOffset 为天数偏移（负数=过去） */
export function at(dayOffset: number, time = '18:00'): string {
  const parts = time.split(':');
  const hour = Number(parts[0] ?? '18');
  const minute = Number(parts[1] ?? '0');
  return MOCK_NOW.add(dayOffset, 'day')
    .hour(hour)
    .minute(minute)
    .second(0)
    .format('YYYY-MM-DD HH:mm');
}

/** 当前时刻字符串（消息/提交发生时间） */
export function nowText(): string {
  return dayjs().format('YYYY-MM-DD HH:mm');
}

/** 生成短 ID */
export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 结构化深拷贝（mock 内存库重置用） */
export function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
