import dayjs from 'dayjs';

/** 当前时刻（YYYY-MM-DD HH:mm） */
export function nowText(): string {
  return dayjs().format('YYYY-MM-DD HH:mm');
}

/** 2026-09-21 09:30 → 09-21 09:30 */
export function shortDateTime(value: string): string {
  return dayjs(value).format('MM-DD HH:mm');
}

/** 2026-09-21 09:30 → 2026-09-21 09:30（完整） */
export function fullDateTime(value: string): string {
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

/** 截止时间：09月28日 18:00 */
export function deadlineText(value: string): string {
  return dayjs(value).format('MM月DD日 HH:mm');
}

/** 列表用短日期：09-21 */
export function shortDate(value: string): string {
  return dayjs(value).format('MM-DD');
}

/** 相对时间：刚刚 / N分钟前 / N小时前 / 昨天 HH:mm / MM-DD HH:mm */
export function relativeTime(value: string): string {
  const target = dayjs(value);
  const now = dayjs();
  const minutes = now.diff(target, 'minute');
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = now.diff(target, 'hour');
  if (hours < 24 && now.isSame(target, 'day')) return `${hours}小时前`;
  if (now.subtract(1, 'day').isSame(target, 'day')) return `昨天 ${target.format('HH:mm')}`;
  return target.format('MM-DD HH:mm');
}

/** 距截止的小时数（负值 = 已逾期） */
export function hoursUntil(deadline: string): number {
  return dayjs(deadline).diff(dayjs(), 'hour', true);
}

/** 剩余 / 逾期文案 */
export function remainText(deadline: string): string {
  const hours = hoursUntil(deadline);
  if (hours < 0) {
    const overdueDays = Math.max(1, Math.ceil(-hours / 24));
    return `已逾期 ${overdueDays} 天`;
  }
  if (hours < 24) {
    return `剩余 ${Math.max(1, Math.ceil(hours))} 小时`;
  }
  return `剩余 ${Math.ceil(hours / 24)} 天`;
}

/** 文件大小：1024KB → 1.0MB */
export function sizeText(sizeKB: number): string {
  if (sizeKB >= 1024) {
    return `${(sizeKB / 1024).toFixed(1)}MB`;
  }
  return `${sizeKB}KB`;
}

/** 问候语 */
export function greeting(): string {
  const hour = dayjs().hour();
  if (hour < 6) return '凌晨好';
  if (hour < 12) return '上午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

/** 今日：09月21日 星期一 */
export function todayText(): string {
  const week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return `${dayjs().format('MM月DD日')} ${week[dayjs().day()]}`;
}
