import { describe, expect, it } from 'vitest';
import { validatePickedFiles } from '@/services/picker';

describe('file selection validation', () => {
  it('accepts supported formats up to 20MB and rejects oversized or unknown files', () => {
    expect(validatePickedFiles([{ name: 'report.pdf', sizeKB: 20 * 1024, path: '/tmp/report.pdf', format: 'PDF' }])[0].format).toBe('PDF');
    expect(() => validatePickedFiles([{ name: 'large.pdf', sizeKB: 20 * 1024 + 1, path: '/tmp/large.pdf', format: 'PDF' }])).toThrow('文件超过 20MB');
    expect(() => validatePickedFiles([{ name: 'script.exe', sizeKB: 1, path: '/tmp/script.exe', format: 'PDF' }])).toThrow('不支持的文件格式');
  });
});
