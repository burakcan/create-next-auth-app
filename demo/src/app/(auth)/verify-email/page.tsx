import { RedirectType, redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { getServerUser } from "@/services/auth/utils/getServerUser";

export default async function VerifyEmailPage() {
  const user = await getServerUser();

  if (!user || !user.email) {
    redirect("/login", RedirectType.replace);
  }

  if (user.emailVerified) {
    redirect("/dashboard", RedirectType.replace);
  }

  return <VerifyEmailForm email={user.email} />;
}
