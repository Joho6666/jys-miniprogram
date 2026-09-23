<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';
import { enableShareMenu } from '@/services/share';
import { readAccessToken } from '@/services/request';
import { isMockMode } from '@/services/http';

onLaunch(() => {
  if (!isMockMode() && !readAccessToken()) {
    uni.reLaunch({ url: '/pages/login/index' });
    return;
  }
  // 教师身份(登录后教师端):Mock 阶段直接装载本地档案
  useUserStore().load();
  // 点亮右上角胶囊菜单的「转发」与「分享到朋友圈」
  enableShareMenu();
});
</script>

<style lang="scss">
@import './styles/global.scss';
</style>
