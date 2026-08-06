import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FastCopy",
  description: "빠르게 저장하고 누구나 복사해서 가져갈 수 있는 공유 문구 보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}