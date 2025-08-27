
"use client";

import { useEffect, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Chrome, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function SignInPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { setPageLoading } = useAppContext();
  const [isPending, startTransition] = useTransition();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);
  
  // This effect handles redirection if a user is already logged in or logs in successfully
  useEffect(() => {
    if (!authLoading && user) {
      startTransition(() => {
        router.push("/admin");
      });
    }
  }, [user, authLoading, router]);
  
  const handleSignIn = async () => {
    setIsSigningIn(true);
    await signInWithGoogle();
    // After the popup closes, the useEffect above will catch the user change and redirect.
    setIsSigningIn(false);
  };

  const isLoading = authLoading || isPending || isSigningIn;

  // Don't render the sign-in button if we know we're about to redirect.
  if (user && !authLoading) {
      return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg border">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-headline tracking-tight">
            Admin Sign In
          </h1>
          <p className="mt-2 text-muted-foreground">
            Access your dashboard to manage products.
          </p>
        </div>
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full font-bold text-lg"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-5 w-5" />
          )}
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
