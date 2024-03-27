import { useMutation } from "@tanstack/react-query";

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (values: { token: string; password: string }) => {
      return await fetch(`/api/auth/reset-password`, {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
  });
}
