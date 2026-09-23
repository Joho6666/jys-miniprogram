import { downloadFile } from '@/api/file';
import { isMockMode } from '@/services/http';
export async function previewRemoteFile(fileId: string, name: string): Promise<void> {
  if (isMockMode()) { uni.showToast({ title: `预览 ${name}（演示）`, icon: 'none' }); return; }
  const extension = name.split('.').pop()?.toLowerCase();
  uni.showLoading({ title: '正在下载' });
  try {
    const filePath = await downloadFile(fileId);
    if (['jpg','jpeg','png'].includes(extension ?? '')) { uni.previewImage({ urls: [filePath] }); return; }
    await new Promise<void>((resolve, reject) => uni.openDocument({ filePath, showMenu: true, success: () => resolve(), fail: () => reject(new Error('文件预览失败')) }));
  }
  catch (error) { uni.showToast({ title: error instanceof Error ? error.message : '文件预览失败', icon: 'none' }); }
  finally { uni.hideLoading(); }
}
