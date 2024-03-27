import "server-only";
import { redirect, RedirectType } from "next/navigation";
import { getServerSession, type Session } from "next-auth";
import { authConfig } from "../authConfig";

export interface AuthProps {
  session: Session;
}

export function componentWithAuth<T>(
  Component: React.ComponentType<T & AuthProps>
) {
  const WrappedComponent = async (props: T) => {
    const session = await getServerSession(authConfig);

    if (!session) {
      redirect("/login", RedirectType.replace);
    }

    if (session && session.user.emailVerified === null) {
      redirect("/verify-email", RedirectType.replace);
    }

    return <Component {...props} session={session} />;
  };

  WrappedComponent.displayName = `componentWithAuth(${Component.displayName})`;
  return WrappedComponent;
}
