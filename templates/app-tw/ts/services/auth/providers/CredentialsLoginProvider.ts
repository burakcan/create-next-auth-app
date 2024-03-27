import "server-only";
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import { credentialsSchema } from "../utils/validators";
import prisma from "@/services/db";
import type { User } from "@prisma/client";

const CredentialsLoginProvider = CredentialsProvider({
  id: "credentials-login",
  name: "Credentials login",
  credentials: {
    email: { label: "email", type: "text" },
    password: { label: "password", type: "password" },
  },
  authorize: async (credentials): Promise<User | null> => {
    try {
      const { email, password } = credentialsSchema.parse(credentials);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;

      const hashedPassword = await prisma.hashedPassword.findUnique({
        where: {
          userId: user.id,
        },
      });
      if (!hashedPassword) return null;

      const valid = await bcrypt.compare(password, hashedPassword.hashed);
      if (!valid) return null;

      return user;
    } catch (error) {
      return null;
    }
  },
});

export default CredentialsLoginProvider;
