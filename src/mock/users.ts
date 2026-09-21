import type { User } from '@/types';

/** 当前登录教师（教师端视角） */
export const CURRENT_USER_ID = 'user-001';

export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    name: '张老师',
    title: '教师',
    college: '能源与建筑环境学院',
    office: '工程管理教研室',
    avatarText: '张',
    termTaskCount: 31,
  },
  {
    id: 'user-002',
    name: '王老师',
    title: '教学秘书',
    college: '能源与建筑环境学院',
    office: '工程管理教研室',
    avatarText: '王',
    termTaskCount: 26,
  },
  {
    id: 'user-003',
    name: '李老师',
    title: '教师',
    college: '能源与建筑环境学院',
    office: '工程管理教研室',
    avatarText: '李',
    termTaskCount: 22,
  },
  {
    id: 'user-004',
    name: '陈老师',
    title: '教师',
    college: '能源与建筑环境学院',
    office: '工程管理教研室',
    avatarText: '陈',
    termTaskCount: 20,
  },
  {
    id: 'user-005',
    name: '刘老师',
    title: '教师',
    college: '能源与建筑环境学院',
    office: '工程管理教研室',
    avatarText: '刘',
    termTaskCount: 19,
  },
  {
    id: 'user-006',
    name: '赵老师',
    title: '教师',
    college: '能源与建筑环境学院',
    office: '工程管理教研室',
    avatarText: '赵',
    termTaskCount: 18,
  },
  {
    id: 'user-007',
    name: '李主任',
    title: '教研室主任',
    college: '能源与建筑环境学院',
    office: '工程管理教研室',
    avatarText: '李',
    termTaskCount: 24,
  },
];

/** 按 ID 查用户 */
export function findUser(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

/** 按姓名查用户 */
export function findUserByName(name: string): User | undefined {
  return MOCK_USERS.find((u) => u.name === name);
}
