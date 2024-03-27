import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { CallbacksOptions } from "next-auth";
import NextAuth from "next-auth";
import type { JWTOptions } from "next-auth/jwt";
import { decode, encode } from "next-auth/jwt";
import { v4 as uuidv4 } from "uuid";
import { authConfig } from "@/services/auth/authConfig";

const handler = async (
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) => {
  const { session, adapter } = authConfig;

  const useSecureCookies = req.nextUrl.protocol === "https:";
  const cookiePrefix = useSecureCookies ? "__Secure-" : "";
  const cookieName = `${cookiePrefix}next-auth.session-token`;

  const callbacks: Partial<CallbacksOptions> = {
    ...authConfig.callbacks,

    signIn: async (params) => {
      const { user } = params;

      if (
        ctx.params.nextauth.includes("callback") &&
        (ctx.params.nextauth.includes("credentials-login") ||
          ctx.params.nextauth.includes("credentials-signup")) &&
        req.method === "POST"
      ) {
        const sessionToken = randomUUID?.() || uuidv4();

        const sessionExpiry = new Date(Date.now() + session?.maxAge! * 1000);

        await adapter?.createSession?.({
          sessionToken,
          userId: user.id,
          expires: sessionExpiry,
        });

        cookies().set(cookieName, sessionToken, {
          expires: sessionExpiry,
        });
      }

      return true;
    },
  };

  const jwt: Partial<JWTOptions> = {
    maxAge: session?.maxAge,
    encode: async ({ token, secret, maxAge }) => {
      if (
        ctx.params.nextauth.includes("callback") &&
        (ctx.params.nextauth.includes("credentials-login") ||
          ctx.params.nextauth.includes("credentials-signup")) &&
        req.method === "POST"
      ) {
        const cookie = cookies().get(cookieName);

        if (cookie) {
          return cookie.value;
        }

        return "";
      }

      return encode({ token, secret, maxAge });
    },

    decode: async ({ token, secret }) => {
      if (
        ctx.params.nextauth.includes("callback") &&
        (ctx.params.nextauth.includes("credentials-login") ||
          ctx.params.nextauth.includes("credentials-signup")) &&
        req.method === "POST"
      ) {
        return null;
      }

      return decode({ token, secret });
    },
  };

  return NextAuth(req, ctx, {
    ...authConfig,
    jwt,
    callbacks,
  });
};

export { handler as GET, handler as POST };
