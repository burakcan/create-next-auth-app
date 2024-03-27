import "server-only";
import { redirect, RedirectType } from "next/navigation";
import { getServerSession } from "next-auth";
import { authConfig } from "../authConfig";

export function componentWithoutAuth<T extends {}>(
  Component: React.ComponentType<T>
) {
  const WrappedComponent = async (props: T) => {
    const session = await getServerSession(authConfig);

    if (session && session.user.emailVerified) {
      redirect("/dashboard", RedirectType.replace);
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `componentWithoutAuth(${Component.displayName})`;
  return WrappedComponent;
}
