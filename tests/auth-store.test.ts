import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { AuthSession, User } from '@/types';
const authMock = vi.hoisted(() => ({ login: vi.fn(), wechatLogin: vi.fn(), bind: vi.fn(), logout: vi.fn() }));
const tokenMock = vi.hoisted(() => ({ clearTokens: vi.fn(), readAccessToken: vi.fn(() => 'token'), readRefreshToken: vi.fn(() => 'refresh'), saveTokens: vi.fn() }));
vi.mock('@/api/auth', () => ({ authApi: () => authMock }));
vi.mock('@/services/request', () => tokenMock);
import { useAuthStore } from '@/stores/auth';

const user: User = { id: 'u1', name: '教师', title: '教师', college: '', office: '', avatarText: '教', termTaskCount: 0 };
const session: AuthSession = { accessToken: 'access', refreshToken: 'refresh', tokenType: 'Bearer', user };
describe('auth store', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.clearAllMocks(); authMock.login.mockResolvedValue(session); authMock.wechatLogin.mockResolvedValue(session); authMock.bind.mockResolvedValue(session); authMock.logout.mockResolvedValue(undefined); });
  it('saves tokens on login and clears the session on logout', async () => {
    const store = useAuthStore();
    await store.login({ username: 'u1', password: 'secret' });
    expect(tokenMock.saveTokens).toHaveBeenCalledWith('access', 'refresh');
    expect(store.authenticated).toBe(true);
    await store.logout();
    expect(authMock.logout).toHaveBeenCalledWith('refresh');
    expect(tokenMock.clearTokens).toHaveBeenCalled();
    expect(store.user).toBeNull();
  });
  it('stores binding state until account binding finishes', async () => {
    authMock.wechatLogin.mockResolvedValue({ ...session, bindingRequired: true, bindingToken: 'bind-token' });
    const store = useAuthStore();
    await store.loginWechat({ code: 'wx-code' });
    expect(store.bindingToken).toBe('bind-token');
    expect(tokenMock.saveTokens).not.toHaveBeenCalled();
    await store.bind({ employeeNo: '001', name: '教师' });
    expect(authMock.bind).toHaveBeenCalledWith({ employeeNo: '001', name: '教师', bindingToken: 'bind-token' });
  });
});
