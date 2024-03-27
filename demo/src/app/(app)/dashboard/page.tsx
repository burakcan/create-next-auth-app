import { RedirectType, redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getServerUser } from "@/services/auth/utils/getServerUser";

export default async function DashboardPage() {
  const user = await getServerUser();

  if (!user || !user.email) {
    return redirect("/login", RedirectType.replace);
  } else if (user.emailVerified === null) {
    return redirect("/verify-email", RedirectType.replace);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>Welcome to dashboard</h1>
        <div>{user.email}</div>
        <LogoutButton />
      </div>
    </main>
  );
}
