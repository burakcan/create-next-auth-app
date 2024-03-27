import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { changeUserPassword } from "@/services/auth/utils/changeUserPassword";
import {
  checkResetPasswordCode,
  deleteResetPasswordToken,
} from "@/services/auth/utils/forgotPassword";
import { resetPasswordSchema } from "@/services/auth/utils/validators";

export const POST = async (req: NextRequest) => {
  try {
    const json = await req.json();
    const { token: tokenAndId, password } = resetPasswordSchema.parse(json);
    const [id, token] = tokenAndId.split(/-(.*)/s);

    const passwordResetToken = await checkResetPasswordCode(Number(id), token);

    if (!passwordResetToken) {
      return NextResponse.json(null, { status: 400 });
    }

    await changeUserPassword(passwordResetToken.userId, password);
    await deleteResetPasswordToken(passwordResetToken.id);

    return NextResponse.json(null);
  } catch (error) {
    console.error(error);
    return NextResponse.json(null, { status: 400 });
  }
};
