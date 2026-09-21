import type { User } from '@/types';
import { CURRENT_USER_ID, findUser, MOCK_USERS } from '@/mock/users';
import { mockCopy, mockFail } from '@/services/request';

/** 当前登录教师档案 */
export function fetchCurrentUser(): Promise<User> {
  const user = findUser(CURRENT_USER_ID);
  if (!user) {
    return mockFail('用户信息加载失败');
  }
  return mockCopy(user);
}

/** 教研室教师名册 */
export function fetchUsers(): Promise<User[]> {
  return mockCopy(MOCK_USERS);
}
