import { useMutation } from "@tanstack/react-query";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (values: { email: string }) => {
      return await fetch(`/api/auth/forgot-password`, {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
  });
}
