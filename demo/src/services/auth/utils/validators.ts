import { z } from "zod";

export const schemaForType =
  <T>() =>
  <S extends z.ZodType<T>>(arg: S) => {
    return arg;
  };

export const credentialsSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(8).trim(),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export const signupSchema = credentialsSchema
  .extend({
    confirm_password: z.string().min(8).trim(),
    terms_and_conditions: z.literal(true).or(z.literal("true")),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type SignupData = z.infer<typeof signupSchema>;

export const verifyEmailSchema = z.object({
  code: z.string().length(6),
  email: z.string().email().trim(),
});

export type VerifyEmailData = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email().trim(),
});

export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8).trim(),
    confirm_password: z.string().min(8).trim(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
