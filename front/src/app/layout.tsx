import type { Metadata } from "next";

import "./globals.css";

import { AuthProvider } from "@/providers/AuthProvider";
import FloatingChatbot from "@/components/chat/FloatingChatbot";

export const metadata: Metadata = {
  title: "RAG BOARD",
  description: "AI 기반 커뮤니티 게시판",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        <AuthProvider>
          {children}
          <FloatingChatbot />
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
