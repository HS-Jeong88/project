"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent, type ChangeEvent } from "react";

import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/providers/AuthProvider";

const RegisterPage = () => {
  const router = useRouter();

  const { register } = useAuth();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register({
        nickname,
        email,
        password,
      });

      router.push("/login?registered=true");
    } catch (error) {
      setError(error instanceof Error ? error.message : "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="text-center">
            <span className="text-xs font-extrabold tracking-widest text-blue-600">ACCOUNT</span>

            <h1 className="mt-3 text-2xl font-extrabold text-slate-900">회원가입</h1>

            <p className="mt-2 text-sm text-slate-500">RAG BOARD의 회원이 되어 보세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="nickname" className="mb-2 block text-sm font-semibold text-slate-700">
                닉네임
              </label>

              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setNickname(event.target.value)}
                placeholder="닉네임을 입력하세요"
                autoComplete="nickname"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                이메일
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                placeholder="이메일을 입력하세요"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                비밀번호
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력하세요"
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "가입 처리 중..." : "회원가입"}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-slate-500">
            이미 회원이신가요?
            <Link href="/login" className="ml-2 font-bold text-blue-600 hover:underline">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
