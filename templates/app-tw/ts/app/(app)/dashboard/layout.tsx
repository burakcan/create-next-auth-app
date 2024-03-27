import { Suspense } from "react";
import type { Viewport } from "next";

export const viewport: Viewport = {};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Suspense>{children}</Suspense>;
}
