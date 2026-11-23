"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/providers/AuthProvider";

export default function Header() {
  const router = useRouter();

  const { user, isLoading, logout } = useAuth();

  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    setLogoutError("");

    try {
      await logout();
      router.push("/");
      router.refresh();
    } catch {
      setLogoutError("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[68px] border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-5 md:px-8">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-slate-900">
          RAG BOARD
        </Link>

        <nav className="flex items-center gap-3 md:gap-5">
          {isLoading ? (
            <span className="text-xs text-slate-400">로그인 상태 확인 중</span>
          ) : user ? (
            <>
              <span className="hidden text-sm font-semibold text-slate-600 sm:block">
                {user.nickname}님
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
              >
                로그인
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>

      {logoutError && (
        <p className="absolute right-5 top-full mt-2 rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600 shadow">
          {logoutError}
        </p>
      )}
    </header>
  );
}
