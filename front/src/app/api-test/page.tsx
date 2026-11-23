"use client";

import { useState } from "react";

import { apiClient } from "@/lib/api/apiClient";
import { ApiError } from "@/lib/api/apiError";

interface HealthResponse {
  success: boolean;
  message: string;
}

export default function ApiTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult("");
    setIsSuccess(null);

    try {
      const response = await apiClient.get<HealthResponse>("/health", { auth: false });

      setResult(response.message);
      setIsSuccess(response.success);
    } catch (error) {
      if (error instanceof ApiError) {
        setResult(`${error.message} (HTTP ${error.status}, ${error.code || "UNKNOWN"})`);
      } else {
        setResult("예상하지 못한 오류가 발생했습니다.");
      }

      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-xl rounded-xl bg-white p-8 shadow-sm">
        <h1 className="mb-3 text-2xl font-bold">백엔드 API 연결 테스트</h1>

        <p className="mb-6 text-sm text-gray-500">
          Next.js에서 Express 서버의 Health API를 호출합니다.
        </p>

        <button
          type="button"
          onClick={testConnection}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "연결 확인 중..." : "서버 연결 테스트"}
        </button>

        {result && (
          <div
            className={`mt-6 rounded-lg p-4 ${
              isSuccess ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            <p className="font-semibold">{isSuccess ? "연결 성공" : "연결 실패"}</p>

            <p className="mt-2 text-sm">{result}</p>
          </div>
        )}
      </div>
    </main>
  );
}
