import type { UserProfile } from './user';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface AuthSession extends AuthTokens {
  user: UserProfile;
  bindingRequired?: boolean;
  bindingToken?: string;
}

export interface PasswordLoginPayload {
  username: string;
  password: string;
}

export interface WechatLoginPayload {
  code: string;
}

export interface BindAccountPayload {
  bindingToken: string;
  employeeNo?: string;
  name?: string;
  username?: string;
  password?: string;
}
