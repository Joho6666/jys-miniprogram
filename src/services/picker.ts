import type { FileFormat } from '@/types';
import { ACCEPT_EXTENSIONS, MAX_FILE_SIZE_KB, detectFormat } from '@/types';

/**
 * 跨端文件选择：微信小程序走 wx.chooseMessageFile（从聊天记录选文件），
 * H5/其他端走 uni.chooseFile。上传过程本身由页面模拟进度，不发起真实上传。
 */

export interface PickedFile {
  name: string;
  sizeKB: number;
  path: string;
  format: FileFormat;
}

interface RawFile {
  name: string;
  sizeKB: number;
  path: string;
}

interface WxChooseMessageFileResult {
  tempFiles: Array<{ name: string; path: string; size: number }>;
}

interface WxApiLike {
  chooseMessageFile?: (options: {
    count: number;
    type: 'all';
    success: (res: WxChooseMessageFileResult) => void;
    fail: (err: unknown) => void;
  }) => void;
}

function getWx(): WxApiLike | undefined {
  const holder = globalThis as { wx?: WxApiLike };
  return holder.wx;
}

/** 各端原生选择（不做格式/大小校验） */
function pickRaw(count: number): Promise<RawFile[]> {
  return new Promise<RawFile[]>((resolve, reject) => {
    // #ifdef MP-WEIXIN
    const wxApi = getWx();
    if (wxApi && typeof wxApi.chooseMessageFile === 'function') {
      wxApi.chooseMessageFile({
        count,
        type: 'all',
        success: (res) => {
          resolve(
            (res.tempFiles ?? []).map((f) => ({
              name: f.name,
              sizeKB: Math.max(1, Math.round(f.size / 1024)),
              path: f.path,
            })),
          );
        },
        fail: () => reject(new Error('已取消选择')),
      });
      return;
    }
    reject(new Error('当前环境不支持文件选择'));
    // #endif

    // #ifndef MP-WEIXIN
    uni.chooseFile({
      count,
      extension: ACCEPT_EXTENSIONS,
      success: (res) => {
        const files = (res.tempFiles ?? []) as Array<{ name?: string; path: string; size: number }>;
        resolve(
          files.map((f, i) => ({
            name: f.name ?? `文件${i + 1}`,
            sizeKB: Math.max(1, Math.round(f.size / 1024)),
            path: f.path,
          })),
        );
      },
      fail: () => reject(new Error('已取消选择')),
    });
    // #endif
  });
}

/** 校验格式与大小后返回可上传文件 */
export async function pickFiles(count = 1): Promise<PickedFile[]> {
  const raw = await pickRaw(count);
  const accepted: PickedFile[] = [];

  for (const file of raw) {
    const format = detectFormat(file.name);
    if (!format) {
      throw new Error(`不支持的文件格式：${file.name}`);
    }
    if (file.sizeKB > MAX_FILE_SIZE_KB) {
      throw new Error(`文件超过 20MB：${file.name}`);
    }
    accepted.push({ ...file, format });
  }

  return accepted;
}
