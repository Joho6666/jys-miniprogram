import type { AuthApi } from './contracts';
import type { AuthSession, BindAccountPayload, PasswordLoginPayload, User, WechatLoginPayload } from '@/types';
import { findUser, MOCK_USERS } from '@/mock/users';
import { isMockMode, post } from '@/services/http';
import { mockCopy } from '@/services/request';

function normalizeSession(data: Record<string, unknown>): AuthSession {
  const rawUser = (data.user ?? {}) as Record<string, unknown>;
  const name = String(rawUser.name ?? rawUser.username ?? '教师');
  const user: User = { id: String(rawUser.id ?? ''), name, title: String(rawUser.title ?? '教师'), college: String(rawUser.college ?? ''), office: String(rawUser.office ?? rawUser.departmentName ?? ''), avatarText: name.slice(0, 1), termTaskCount: Number(rawUser.termTaskCount ?? 0), username: rawUser.username ? String(rawUser.username) : undefined, employeeNo: rawUser.employeeNo ? String(rawUser.employeeNo) : undefined, departmentId: rawUser.departmentId ? String(rawUser.departmentId) : undefined };
  return { accessToken: String(data.accessToken ?? ''), refreshToken: data.refreshToken ? String(data.refreshToken) : undefined, expiresIn: data.expiresIn ? Number(data.expiresIn) : undefined, tokenType: data.tokenType ? String(data.tokenType) : 'Bearer', bindingRequired: Boolean(data.bindingRequired), bindingToken: data.bindingToken ? String(data.bindingToken) : undefined, user };
}
function mockSession(user: User): AuthSession { return { accessToken: `mock-${user.id}`, refreshToken: `mock-refresh-${user.id}`, tokenType: 'Bearer', user }; }
const mockAuthApi: AuthApi = {
  async login(payload: PasswordLoginPayload) { const user = MOCK_USERS.find((item) => item.employeeNo === payload.username || item.id === payload.username || item.name === payload.username) ?? MOCK_USERS[0]; return mockCopy(mockSession(user)); },
  async wechatLogin(_payload: WechatLoginPayload) { return mockCopy(mockSession(findUser('user-001') ?? MOCK_USERS[0])); },
  async bind(payload: BindAccountPayload) { const user = MOCK_USERS.find((item) => item.employeeNo === payload.employeeNo || item.name === payload.name || item.id === payload.username) ?? MOCK_USERS[0]; return mockCopy(mockSession(user)); },
  async logout() { return Promise.resolve(); },
};
const httpAuthApi: AuthApi = {
  login: (payload) => post<Record<string, unknown>>('/auth/login', payload).then(normalizeSession),
  wechatLogin: (payload) => post<Record<string, unknown>>('/auth/wechat', payload).then(normalizeSession),
  bind: (payload) => post<Record<string, unknown>>('/auth/bind', payload).then(normalizeSession),
  logout: (refreshToken) => post<void>('/auth/logout', { refreshToken }),
};
export function authApi(): AuthApi { return isMockMode() ? mockAuthApi : httpAuthApi; }
