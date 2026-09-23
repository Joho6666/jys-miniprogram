import type { User } from '@/types';
type UserDto = { id: string; name?: string; username?: string; employeeNo?: string; title?: string; college?: string; departmentId?: string; departmentName?: string; office?: string; roles?: User['roles']; avatar?: string; avatarText?: string; enabled?: boolean; termTaskCount?: number };
export function toUser(dto: UserDto): User {
  const name = dto.name ?? dto.username ?? '教师';
  return { id: dto.id, name, username: dto.username, employeeNo: dto.employeeNo, title: dto.title ?? '教师', college: dto.college ?? '未提供', office: dto.office ?? dto.departmentName ?? '未提供', departmentId: dto.departmentId, roles: dto.roles, enabled: dto.enabled ?? true, avatarText: dto.avatarText ?? name.slice(0, 1), termTaskCount: dto.termTaskCount ?? 0 };
}
