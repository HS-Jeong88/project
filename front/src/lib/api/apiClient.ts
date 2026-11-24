import { ApiError, type ApiErrorResponse } from "./apiError";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const clearAccessToken = (): void => {
  accessToken = null;
};

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

const request = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL 환경변수가 설정되지 않았습니다.");
  }

  const { body, auth = true, headers: customHeaders, ...fetchOptions } = options;

  const headers = new Headers(customHeaders);

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (auth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...fetchOptions,
      headers,
      credentials: "include",
      cache: "no-store",
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      "서버에 연결할 수 없습니다. 서버 실행 상태를 확인해 주세요.",
      "NETWORK_ERROR",
    );
  }

  const responseText = await response.text();

  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorData = (data && typeof data === "object" ? data : {}) as ApiErrorResponse;

    throw new ApiError(
      response.status,
      errorData.message || "요청 처리 중 오류가 발생했습니다.",
      errorData.code,
      errorData.errors,
    );
  }

  return data as T;
};

export const apiClient = {
  get<T>(path: string, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return request<T>(path, {
      ...options,
      method: "GET",
    });
  },

  post<T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return request<T>(path, {
      ...options,
      method: "POST",
      body,
    });
  },

  patch<T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body,
    });
  },

  put<T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body,
    });
  },

  delete<T>(path: string, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return request<T>(path, {
      ...options,
      method: "DELETE",
    });
  },
};
