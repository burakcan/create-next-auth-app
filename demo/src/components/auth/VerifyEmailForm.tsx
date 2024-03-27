"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldAlertIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useVerifyEmailMutation } from "@/services/auth/hooks/useVerifyEmailMutation";
import type { VerifyEmailData } from "@/services/auth/utils/validators";
import { verifyEmailSchema } from "@/services/auth/utils/validators";

interface Props {
  email: string;
}

const resolver = zodResolver(verifyEmailSchema);

export function VerifyEmailForm(props: Props) {
  const { email } = props;
  const params = useSearchParams();
  const mutation = useVerifyEmailMutation();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(
    params.get("error")
  );

  const form = useForm({
    resolver,
    defaultValues: {
      code: params.get("code") ?? "",
      email: email,
    },
    mode: "all",
    criteriaMode: "firstError",
  });

  const handleSubmit = form.handleSubmit(async (data: VerifyEmailData) => {
    setAuthError(null);

    return await mutation.mutateAsync(data, {
      onSuccess: () => {
        toast.success("Email verified successfully", {
          description: "You will be redirected to dashboard. Please wait...",
          position: "top-right",
        });

        setTimeout(() => {
          router.refresh();
        }, 1000);
      },
      onError: (error) => {
        setAuthError(error.message);
      },
    });
  });

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          Enter the code sent to your email to verify your account
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
              name="code"
              render={({ field, fieldState }) => (
                <div className="grid gap-4">
                  <Label htmlFor="email">Verification code</Label>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className={fieldState.error ? "border-destructive" : ""}
                      />
                      <InputOTPSlot
                        index={1}
                        className={fieldState.error ? "border-destructive" : ""}
                      />
                      <InputOTPSlot
                        index={2}
                        className={fieldState.error ? "border-destructive" : ""}
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={3}
                        className={fieldState.error ? "border-destructive" : ""}
                      />
                      <InputOTPSlot
                        index={4}
                        className={fieldState.error ? "border-destructive" : ""}
                      />
                      <InputOTPSlot
                        index={5}
                        className={fieldState.error ? "border-destructive" : ""}
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              )}
            />
            <Button type="submit" className="w-full">
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
