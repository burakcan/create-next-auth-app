"use client";

import { Button } from "@/components/ui/button";

export function OauthButtons() {
  return (
    <>
      <Button variant="outline" className="w-full">
        Sign in with Google
      </Button>
      <Button variant="outline" className="w-full">
        Sign in with GitHub
      </Button>
    </>
  );
}
