
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
    // This effect will trigger a page transition animation
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);

  useEffect(() => {
    // This effect handles redirection after a user logs in
    if (!authLoading && user) {
      startTransition(() => {
        router.push("/admin");
      });
    }
  }, [user, authLoading, router]);
  
  const handleSignIn = async () => {
    setIsSigningIn(true);
    await signInWithGoogle();
    // The onAuthStateChanged listener in useAuth will update the user state.
    // The useEffect hook above will then handle redirection.
    // We set signing in to false to re-enable the button in case of failure.
    setIsSigningIn(false);
  };

  // The button should be disabled if the auth state is loading, 
  // a page transition is happening, or a sign-in attempt is in progress.
  const isLoading = authLoading || isPending || isSigningIn;

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
