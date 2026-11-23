import { apiClient } from "@/lib/api/apiClient";

import type { ApiEnvelope, AuthPayload, AuthUser, LoginInput, RegisterInput } from "./auth.types";

function unwrapData<T>(response: T | ApiEnvelope<T>): T {
  if (response !== null && typeof response === "object" && "data" in response) {
    return response.data;
  }

  return response as T;
}

function extractUser(data: AuthUser | { user: AuthUser }): AuthUser {
  if ("user" in data) {
    return data.user;
  }

  return data;
}

export async function registerUser(input: RegisterInput): Promise<void> {
  await apiClient.post<ApiEnvelope<unknown>>("/auth/register", input, { auth: false });
}

export async function loginUser(input: LoginInput): Promise<AuthPayload> {
  const response = await apiClient.post<ApiEnvelope<AuthPayload>>("/auth/login", input, {
    auth: false,
  });

  const data = unwrapData(response);

  if (!data.accessToken) {
    throw new Error("로그인 응답에 Access Token이 없습니다.");
  }

  return data;
}

export async function refreshAccessToken(): Promise<string> {
  const response = await apiClient.post<ApiEnvelope<{ accessToken: string }>>(
    "/auth/refresh",
    undefined,
    { auth: false },
  );

  const data = unwrapData(response);

  if (!data.accessToken) {
    throw new Error("토큰 갱신 응답에 Access Token이 없습니다.");
  }

  return data.accessToken;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<ApiEnvelope<AuthUser | { user: AuthUser }>>("/auth/me");

  return extractUser(unwrapData(response));
}

export async function logoutUser(): Promise<void> {
  await apiClient.post<ApiEnvelope<unknown>>("/auth/logout", undefined, { auth: false });
}
