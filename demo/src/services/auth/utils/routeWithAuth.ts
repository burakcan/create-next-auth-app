import "server-only";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authConfig } from "../authConfig";

export const routeWithAuth =
  <Body, Ctx = any>(
    fn: (
      session: Session,
      req: NextRequest,
      ctx?: Ctx
    ) => Promise<NextResponse<Body>>
  ) =>
  async (req: NextRequest, ctx: Ctx) => {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return fn(session, req, ctx);
  };
