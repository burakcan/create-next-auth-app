"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldAlertIcon, ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/services/auth/hooks/useForgotPasswordMutation";
import type {
  ForgotPasswordData} from "@/services/auth/utils/validators";
import {
  forgotPasswordSchema,
} from "@/services/auth/utils/validators";

const resolver = zodResolver(forgotPasswordSchema);

export function ForgotPasswordForm() {
  const params = useSearchParams();
  const mutation = useForgotPasswordMutation();

  const [authError, setAuthError] = useState<string | null>(
    params.get("error")
  );

  const form = useForm({
    resolver,
    defaultValues: {
      email: "",
    },
    mode: "all",
    criteriaMode: "firstError",
  });

  const handleSubmit = form.handleSubmit(async (data: ForgotPasswordData) => {
    setAuthError(null);

    return await mutation.mutateAsync(data, {
      onError: (error) => {
        setAuthError(error.message);
      },
    });
  });

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email below to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {form.formState.isSubmitSuccessful ? (
          <Alert>
            <ShieldCheckIcon className="size-4 stroke-emerald-500" />
            <AlertTitle>Reset password email sent</AlertTitle>
            <AlertDescription>
              If the email you entered is registered, you will receive an email
              with instructions to reset your password.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {authError && (
                <Alert>
                  <ShieldAlertIcon className="size-4 stroke-destructive" />
                  <AlertTitle>Login failed</AlertTitle>
                  <AlertDescription>
                    Please check your information and try again
                  </AlertDescription>
                </Alert>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      {...field}
                      type="email"
                      placeholder="m@example.com"
                      className={fieldState.error ? "border-destructive" : ""}
                      required
                    />
                  </div>
                )}
              />
              <Button type="submit" className="w-full">
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Reset Password
              </Button>
            </form>
          </Form>
        )}
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
