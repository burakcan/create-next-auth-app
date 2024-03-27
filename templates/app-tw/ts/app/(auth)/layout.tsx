import { Suspense, type PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Suspense>{children}</Suspense>
    </div>
  );
}
