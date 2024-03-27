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
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema } from "@/services/auth/utils/validators";

const resolver = zodResolver(signupSchema);

export function RegisterForm() {
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
      confirm_password: "",
      terms_and_conditions: false as unknown as true,
    },
    mode: "all",
    criteriaMode: "firstError",
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setAuthError(null);

    try {
      const result = await signIn("credentials-signup", {
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
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {authError && (
              <Alert>
                <ShieldAlertIcon className="size-4 stroke-destructive" />
                <AlertTitle>Registration failed</AlertTitle>
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
                  <Input
                    {...field}
                    type="password"
                    required
                    className={fieldState.error ? "border-destructive" : ""}
                  />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field, fieldState }) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Confirm password</Label>
                  <Input
                    {...field}
                    type="password"
                    required
                    className={fieldState.error ? "border-destructive" : ""}
                  />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="terms_and_conditions"
              render={({ field, fieldState }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    {...field}
                    checked={field.value as boolean}
                    onCheckedChange={field.onChange}
                    value=""
                    className={fieldState.error ? "border-destructive" : ""}
                  />
                  <Label htmlFor={field.name}>
                    I agree to the{" "}
                    <Link href="/terms-of-use" className="underline text-bold">
                      terms of use
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy-policy"
                      className="underline text-bold"
                    >
                      privacy policy
                    </Link>
                  </Label>
                </div>
              )}
            />
            <Button type="submit" className="w-full">
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create an account
            </Button>
            <OauthButtons />
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
