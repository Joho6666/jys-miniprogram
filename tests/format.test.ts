import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deadlineText, fullDateTime, relativeTime, remainText, shortDate, shortDateTime, sizeText } from '@/services/format';
import { detectFormat } from '@/types/common';

describe('format helpers', () => {
  beforeEach(() => { vi.setSystemTime(new Date('2026-09-23T08:00:00+08:00')); });

  it('formats stable date views', () => {
    expect(shortDateTime('2026-09-21 09:30')).toBe('09-21 09:30');
    expect(fullDateTime('2026-09-21 09:30')).toBe('2026-09-21 09:30');
    expect(deadlineText('2026-09-28 18:00')).toBe('09月28日 18:00');
    expect(shortDate('2026-09-21 09:30')).toBe('09-21');
  });

  it('formats size and remaining time', () => {
    expect(sizeText(512)).toBe('512KB');
    expect(sizeText(1024)).toBe('1.0MB');
    expect(remainText('2026-09-24 08:00')).toBe('剩余 1 天');
  });

  it('formats relative time categories', () => {
    expect(relativeTime('2026-09-23 07:59')).toBe('1分钟前');
    expect(relativeTime('2026-09-23 06:00')).toBe('2小时前');
    expect(relativeTime('2026-09-22 12:30')).toBe('昨天 12:30');
  });

  it('detects accepted file formats case-insensitively', () => {
    expect(detectFormat('report.PDF')).toBe('PDF');
    expect(detectFormat('photo.jpeg')).toBe('JPG');
    expect(detectFormat('archive.zip')).toBeNull();
  });
});
