import "server-only";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import prisma from "@/services/db";
import type { PasswordResetToken } from "@prisma/client";

export async function checkEmailExists(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return Boolean(user);
}

export async function createResetPasswordToken(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return null;
  }

  const token = v4();
  const hashed = await bcrypt.hash(token, 10);

  const resetToken = await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashed,
      userId: user.id,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  return {
    id: resetToken.id,
    token,
  };
}

export async function checkResetPasswordCode(
  id: number,
  token: string,
): Promise<null | PasswordResetToken> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      id,
    },
  });

  if (!resetToken) {
    return null;
  }

  if (resetToken.expires < new Date()) {
    return null;
  }

  const valid = await bcrypt.compare(token, resetToken.tokenHash);

  if (!valid) {
    return null;
  }

  return resetToken;
}

export async function deleteResetPasswordToken(id: number) {
  return prisma.passwordResetToken.delete({
    where: {
      id,
    },
  });
}
