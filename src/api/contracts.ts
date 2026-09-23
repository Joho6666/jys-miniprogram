import type { AuthSession, BindAccountPayload, Message, PageResult, PasswordLoginPayload, Submission, SubmissionView, TaskView, User, WechatLoginPayload } from '@/types';
import type { TaskListQuery } from './task';

export interface AuthApi { login(payload: PasswordLoginPayload): Promise<AuthSession>; wechatLogin(payload: WechatLoginPayload): Promise<AuthSession>; bind(payload: BindAccountPayload): Promise<AuthSession>; logout(refreshToken?: string): Promise<void> }
export interface TaskApi { list(query?: TaskListQuery): Promise<PageResult<TaskView>>; detail(taskId: string): Promise<TaskView> }
export interface SubmissionApi { list(page?: number, pageSize?: number): Promise<PageResult<SubmissionView>>; detail(id: string): Promise<SubmissionView>; submit(taskId: string, fileIds: string[], note: string): Promise<Submission> }
export interface MessageApi { list(page?: number, pageSize?: number): Promise<PageResult<Message>>; unreadCount(): Promise<number>; markRead(id: string): Promise<void>; markAllRead(): Promise<void> }
export interface UserApi { me(): Promise<User>; list(): Promise<User[]> }
export interface DashboardApi { me(): Promise<Record<string, unknown>> }
export interface FeedbackApi { create(content: string, contact?: string): Promise<void> }
export interface FileApi { metadata(id: string): Promise<Record<string, unknown>>; remove(id: string): Promise<void> }
