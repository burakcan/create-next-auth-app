import type { Viewport } from "next";
import { Suspense } from "react";

export const viewport: Viewport = {};

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Suspense>{children}</Suspense>;
}
