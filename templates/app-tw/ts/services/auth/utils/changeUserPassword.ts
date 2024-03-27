import "server-only";
import bcrypt from "bcrypt";
import prisma from "@/services/db";
import type { User } from "@prisma/client";

export async function changeUserPassword(userId: User["id"], password: string) {
  const hashed = await bcrypt.hash(password, 10);

  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      hashedPassword: {
        update: {
          data: {
            hashed,
          },
        },
      },
    },
  });
}
