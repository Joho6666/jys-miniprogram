export interface User {
  id: string;
  name: string;
  /** 职称/角色：教师 / 教学秘书 / 教研室主任 */
  title: string;
  college: string;
  office: string;
  /** 头像文字（无图片资源依赖） */
  avatarText: string;
  /** 本学期任务总数（统计展示用） */
  termTaskCount: number;
}
