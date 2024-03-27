import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  checkEmailExists,
  createResetPasswordToken,
} from "@/services/auth/utils/forgotPassword";
import { forgotPasswordSchema } from "@/services/auth/utils/validators";
import { sendPasswordReset } from "@/services/email/sendPasswordReset";

export const POST = async (req: NextRequest) => {
  try {
    const json = await req.json();
    const { email } = forgotPasswordSchema.parse(json);

    const emailExists = await checkEmailExists(email);

    if (!emailExists) {
      return NextResponse.json(null);
    }

    const token = await createResetPasswordToken(email);

    if (token) {
      await sendPasswordReset(email, token.id, token.token);
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error(error);
    return NextResponse.json(null, { status: 400 });
  }
};
