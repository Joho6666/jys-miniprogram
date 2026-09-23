<template>
  <view class="page">
    <app-nav-bar title="登录" :show-back="false" />
    <view class="card">
      <view class="brand">教研室事务助手</view>
      <view class="hint">{{ step === 'login' ? '使用微信或账号登录' : '首次登录，请绑定校内账号' }}</view>
      <template v-if="step === 'login'">
        <button class="primary" :loading="auth.loading" @tap="wechatLogin">微信授权登录</button>
        <view class="divider">或使用账号密码</view>
        <input v-model="username" class="input" placeholder="工号 / 用户名" />
        <input v-model="password" class="input" password placeholder="密码" />
        <button class="secondary" :loading="auth.loading" @tap="passwordLogin">账号登录</button>
      </template>
      <template v-else>
        <input v-model="employeeNo" class="input" placeholder="工号" />
        <input v-model="name" class="input" placeholder="姓名" />
        <button class="primary" :loading="auth.loading" @tap="bindAccount">确认绑定</button>
        <view class="link" @tap="step = 'login'">返回登录</view>
      </template>
      <view v-if="auth.error" class="error">{{ auth.error }}</view>
      <view v-if="demoMode" class="demo">
        <view class="divider">演示账号</view>
        <button class="demo-btn" @tap="quickLogin('user-001')">张老师</button>
        <button class="demo-btn" @tap="quickLogin('user-003')">李老师</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { isDemoMode } from '@/services/http';
const auth = useAuthStore(); const userStore = useUserStore(); const step = ref<'login' | 'bind'>('login');
const username = ref(''); const password = ref(''); const employeeNo = ref(''); const name = ref(''); const demoMode = isDemoMode();
async function finish(): Promise<void> { await userStore.load(true); uni.reLaunch({ url: '/pages/home/index' }); }
async function passwordLogin(): Promise<void> { if (!username.value.trim() || !password.value) return void uni.showToast({ title: '请填写账号和密码', icon: 'none' }); try { await auth.login({ username: username.value.trim(), password: password.value }); if (auth.bindingToken) step.value = 'bind'; else await finish(); } catch (_) { /* store presents error */ } }
async function wechatLogin(): Promise<void> { try { const result = await new Promise<UniApp.LoginRes>((resolve, reject) => uni.login({ provider: 'weixin', success: resolve, fail: reject })); await auth.loginWechat({ code: result.code }); if (auth.bindingToken) step.value = 'bind'; else await finish(); } catch (_) { /* store presents error */ } }
async function bindAccount(): Promise<void> { if (!employeeNo.value.trim() || !name.value.trim()) return void uni.showToast({ title: '请填写工号和姓名', icon: 'none' }); try { await auth.bind({ employeeNo: employeeNo.value.trim(), name: name.value.trim() }); await finish(); } catch (_) { /* store presents error */ } }
async function quickLogin(id: string): Promise<void> { username.value = id; password.value = 'demo'; await passwordLogin(); }
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: $bg; }
.card { margin: 80rpx 32rpx; padding: 48rpx 36rpx; border-radius: 24rpx; background: #fff; }
.brand { color: $text-1; font-size: 40rpx; font-weight: 700; }
.hint { margin: 16rpx 0 40rpx; color: $text-3; font-size: 26rpx; }
.input { box-sizing: border-box; width: 100%; height: 92rpx; margin-bottom: 24rpx; padding: 0 28rpx; border: 2rpx solid $border; border-radius: 16rpx; background: #fff; }
button { margin: 0 0 24rpx; border-radius: 16rpx; font-size: 30rpx; }
.primary { color: #fff; background: $primary; }
.secondary, .demo-btn { color: $primary; background: #fff; border: 2rpx solid $primary; }
.divider { margin: 28rpx 0; color: $text-3; text-align: center; font-size: 24rpx; }
.error { color: $danger; font-size: 24rpx; }
.link { padding: 12rpx; color: $primary; text-align: center; }
.demo { margin-top: 20rpx; }
</style>
