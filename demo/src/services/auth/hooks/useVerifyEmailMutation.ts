import { useMutation } from "@tanstack/react-query";

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: async (values: { email: string; code: string }) => {
      return await fetch(`/api/auth/verify-email`, {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
  });
}
