import "server-only";
import { getServerSession } from "next-auth";
import { authConfig } from "../authConfig";

export async function getServerUser() {
  const session = await getServerSession(authConfig);
  return (
    session?.user || {
      id: "non-existing-id",
      email: undefined,
      emailVerified: null,
    }
  );
}
