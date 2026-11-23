export interface AuthUser {
  id?: number | string;
  userId?: number | string;
  email: string;
  nickname: string;
  role?: string;
  status?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthPayload {
  accessToken: string;
  user?: AuthUser;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}
