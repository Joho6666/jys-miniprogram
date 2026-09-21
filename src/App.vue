<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';

onLaunch(() => {
  // 教师身份(登录后教师端):Mock 阶段直接装载本地档案
  useUserStore().load();
});
</script>

<style lang="scss">
@import './styles/global.scss';
</style>
