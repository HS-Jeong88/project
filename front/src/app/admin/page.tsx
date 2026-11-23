"use client";

import { useState } from "react";

import MainLayout from "@/components/layout/MainLayout";

import AdminUsersSection from "@/components/admin/AdminUsersSection";
import AdminPostsSection from "@/components/admin/AdminPostsSection";
import AdminCommentsSection from "@/components/admin/AdminCommentsSection";

import { useAuth } from "@/providers/AuthProvider";

type AdminTab = "users" | "posts" | "comments";

const tabs: {
  id: AdminTab;
  label: string;
}[] = [
  {
    id: "users",
    label: "회원 관리",
  },
  {
    id: "posts",
    label: "게시글 관리",
  },
  {
    id: "comments",
    label: "댓글 관리",
  },
];

export default function AdminPage() {
  const { user, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("users");

  if (isLoading) {
    return (
      <MainLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          사용자 정보를 확인하고 있습니다.
        </div>
      </MainLayout>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <MainLayout>
        <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-10 text-center">
          <h1 className="text-2xl font-bold text-slate-900">접근 권한이 없습니다.</h1>

          <p className="mt-3 text-sm text-slate-500">
            관리자 계정으로 로그인해야 이용할 수 있습니다.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <header>
          <p className="text-sm font-semibold text-blue-600">RAG BOARD</p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">관리자 페이지</h1>

          <p className="mt-2 text-sm text-slate-500">회원, 게시글, 댓글을 관리할 수 있습니다.</p>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-5 py-3 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === "users" && <AdminUsersSection />}

          {activeTab === "posts" && <AdminPostsSection />}

          {activeTab === "comments" && <AdminCommentsSection />}
        </div>
      </div>
    </MainLayout>
  );
}
