"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { useResetPasswordMutation } from "@/services/auth/hooks/useResetPasswordMutation";
import type {
  ResetPasswordData} from "@/services/auth/utils/validators";
import {
  resetPasswordSchema,
} from "@/services/auth/utils/validators";

const resolver = zodResolver(resetPasswordSchema);

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const mutation = useResetPasswordMutation();

  const form = useForm({
    resolver,
    defaultValues: {
      password: "",
      confirm_password: "",
      token: params.get("t") ?? "",
    },
    mode: "all",
    criteriaMode: "firstError",
  });

  const handleSubmit = form.handleSubmit(
    async (data: ResetPasswordData) =>
      await mutation.mutateAsync(data, {
        onSuccess: () => {
          toast.success("Password reset successfully", {
            description: "Please login again with your new password",
            position: "top-right",
            invert: true,
          });

          setTimeout(() => {
            router.push("/login");
          }, 1000);
        },
      })
  );

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your new password below to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {form.formState.isSubmitted && !form.formState.isSubmitSuccessful && (
            <Alert>
              <ShieldAlertIcon className="size-4 stroke-destructive" />
              <AlertTitle>
                There was an error resetting your password
              </AlertTitle>
              <AlertDescription>
                Please check your information and try again
              </AlertDescription>
            </Alert>
          )}
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor={field.name}>Password</Label>
                  </div>
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
                  <div className="flex items-center">
                    <Label htmlFor={field.name}>Repeat password</Label>
                  </div>
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
              Reset Password
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
