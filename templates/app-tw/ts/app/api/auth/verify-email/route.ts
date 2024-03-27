import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import {
  checkVerificationCode,
  successVerificationCode,
} from "@/services/auth/utils/emailVerification";
import { routeWithAuth } from "@/services/auth/utils/routeWithAuth";
import { verifyEmailSchema } from "@/services/auth/utils/validators";

export const POST = routeWithAuth<null>(
  async (session: Session, req: NextRequest) => {
    try {
      const json = await req.json();
      const { email, code } = verifyEmailSchema.parse(json);

      if (email !== session.user?.email) {
        console.log("Email does not match");
        return NextResponse.json(null, { status: 400 });
      }

      const isValid = await checkVerificationCode(session.user.id, code);

      if (!isValid) {
        console.log("Invalid code");
        return NextResponse.json(null, { status: 400 });
      }

      await successVerificationCode(session.user.id);

      return NextResponse.json(null);
    } catch (error) {
      console.error(error);
      return NextResponse.json(null, { status: 400 });
    }
  }
);
