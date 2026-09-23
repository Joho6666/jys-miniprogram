import type { User } from '@/types';
import { CURRENT_USER_ID, findUser, MOCK_USERS } from '@/mock/users';
import { mockCopy, mockFail } from '@/services/request';
import { get, isMockMode } from '@/services/http';

/** 当前登录教师档案 */
export function fetchCurrentUser(): Promise<User> {
  if (!isMockMode()) return get<Record<string, unknown>>('/users/me').then(toUser);
  const user = findUser(CURRENT_USER_ID);
  if (!user) {
    return mockFail('用户信息加载失败');
  }
  return mockCopy(user);
}

function toUser(data: Record<string, unknown>): User {
  const name = String(data.name ?? data.username ?? '教师');
  return { id: String(data.id ?? ''), name, title: String(data.title ?? '教师'), college: String(data.college ?? ''), office: String(data.office ?? data.departmentName ?? ''), avatarText: name.slice(0, 1), termTaskCount: Number(data.termTaskCount ?? 0), username: data.username ? String(data.username) : undefined, employeeNo: data.employeeNo ? String(data.employeeNo) : undefined, departmentId: data.departmentId ? String(data.departmentId) : undefined, roles: data.roles as User['roles'], enabled: data.enabled !== false };
}

/** 教研室教师名册 */
export function fetchUsers(): Promise<User[]> {
  return mockCopy(MOCK_USERS);
}
