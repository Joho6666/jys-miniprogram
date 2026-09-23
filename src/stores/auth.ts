import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { BindAccountPayload, PasswordLoginPayload, User, WechatLoginPayload } from '@/types';
import { authApi } from '@/api/auth';
import { clearTokens, readAccessToken, readRefreshToken, saveTokens } from '@/services/request';
import { useUserStore } from './user';
import { useTaskStore } from './task';
import { useSubmissionStore } from './submission';
import { useMessageStore } from './message';
import { useDashboardStore } from './dashboard';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null); const loading = ref(false); const error = ref(''); const bindingToken = ref('');
  const authenticated = computed(() => Boolean(readAccessToken()));
  async function accept(action: Promise<import('@/types').AuthSession>): Promise<void> { const session = await action; bindingToken.value = session.bindingToken ?? ''; if (session.bindingRequired) return; saveTokens(session.accessToken, session.refreshToken); user.value = session.user; }
  async function login(payload: PasswordLoginPayload): Promise<void> { loading.value = true; error.value = ''; try { await accept(authApi().login(payload)); } catch (e) { error.value = e instanceof Error ? e.message : '登录失败'; throw e; } finally { loading.value = false; } }
  async function loginWechat(payload: WechatLoginPayload): Promise<void> { loading.value = true; error.value = ''; try { await accept(authApi().wechatLogin(payload)); } catch (e) { error.value = e instanceof Error ? e.message : '微信登录失败'; throw e; } finally { loading.value = false; } }
  async function bind(payload: Omit<BindAccountPayload, 'bindingToken'>): Promise<void> { loading.value = true; error.value = ''; try { await accept(authApi().bind({ ...payload, bindingToken: bindingToken.value })); } catch (e) { error.value = e instanceof Error ? e.message : '账号绑定失败'; throw e; } finally { loading.value = false; } }
  async function logout(): Promise<void> { const refresh = readRefreshToken(); try { await authApi().logout(refresh || undefined); } finally { clearTokens(); user.value = null; bindingToken.value = ''; useUserStore().reset(); useTaskStore().reset(); useSubmissionStore().reset(); useMessageStore().reset(); useDashboardStore().reset(); } }
  return { user, loading, error, bindingToken, authenticated, login, loginWechat, bind, logout };
});
