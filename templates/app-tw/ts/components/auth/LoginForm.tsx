"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OauthButtons } from "./OauthButtons";
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
import { credentialsSchema } from "@/services/auth/utils/validators";

const resolver = zodResolver(credentialsSchema);

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(
    params.get("error")
  );

  const form = useForm({
    resolver,
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "all",
    criteriaMode: "firstError",
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setAuthError(null);

    try {
      const result = await signIn("credentials-login", {
        redirect: false,
        ...data,
      });

      if (!result?.ok) {
        throw new Error(result?.error ?? "An unknown error occurred");
      }

      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError("An unknown error occurred");
      }
    }
  });

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                    required
                    className={fieldState.error ? "border-destructive" : ""}
                  />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                  <Input
                    {...field}
                    type="password"
                    required
                    className={fieldState.error ? "border-destructive" : ""}
                  />
                </div>
              )}
            />
            <Button type="submit" className="w-full">
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Login
            </Button>
            <OauthButtons />
          </form>
        </Form>
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
