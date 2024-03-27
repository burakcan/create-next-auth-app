import "server-only";
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import { signupSchema } from "../utils/validators";
import prisma from "@/services/db";
import { sendEmailVerification } from "@/services/email";
import type { User } from "@prisma/client";

const CredentialsSignupProvider = CredentialsProvider({
  id: "credentials-signup",
  name: "Credentials Signup",
  credentials: {
    email: { label: "email", type: "text" },
    password: { label: "password", type: "password" },
  },
  authorize: async (credentials): Promise<User | null> => {
    try {
      const { email, password } = signupSchema.parse(credentials);

      const hashed = await bcrypt.hash(password, 10);
      const emailCode = String(Math.floor(100000 + Math.random() * 900000));

      const user = await prisma.user.create({
        data: {
          email,
          hashedPassword: { create: { hashed } },
          emailVerificationCode: { create: { code: emailCode } },
        },
      });

      await sendEmailVerification(email, emailCode);

      return user;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
});

export default CredentialsSignupProvider;
