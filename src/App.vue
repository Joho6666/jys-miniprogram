<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';
import { enableShareMenu } from '@/services/share';
import { readAccessToken, clearTokens } from '@/services/request';
import { isMockMode } from '@/services/http';
import { fetchCurrentUser } from '@/api/user';
import { useAuthStore } from '@/stores/auth';

onLaunch(async () => {
  enableShareMenu();
  if (!isMockMode()) {
    if (!readAccessToken()) { uni.reLaunch({ url: '/pages/login/index' }); return; }
    try {
      const user = await fetchCurrentUser();
      if (user.enabled === false) { clearTokens(); uni.showModal({ title: '账号已停用', content: '请联系管理员', showCancel: false, success: () => uni.reLaunch({ url: '/pages/login/index' }) }); return; }
      useUserStore().current = user;
      useAuthStore().user = user;
      uni.reLaunch({ url: '/pages/home/index' });
    } catch (error) {
      if (!readAccessToken()) { clearTokens(); uni.reLaunch({ url: '/pages/login/index' }); return; }
      uni.showModal({ title: '暂时无法加载账号信息', content: error instanceof Error ? error.message : '请检查网络后重试', showCancel: false });
      return;
    }
  } else useUserStore().load();
});
</script>

<style lang="scss">
@import './styles/global.scss';
</style>
