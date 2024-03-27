import "server-only";
import type { EmailVerificationCode, User } from "@prisma/client";
import prisma from "@/services/db";

export const checkVerificationCode = async (
  userId: User["id"],
  code: EmailVerificationCode["code"],
) => {
  const emailVerification = await prisma.emailVerificationCode.findFirst({
    where: {
      userId,
      code,
    },
  });

  return Boolean(emailVerification);
};

export const successVerificationCode = async (userId: User["id"]) =>
  await prisma.$transaction([
    prisma.emailVerificationCode.deleteMany({
      where: {
        userId,
      },
    }),
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: new Date(),
      },
    }),
  ]);
