
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Chrome, Loader2 } from "lucide-react";

export default function SignInPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRedirecting, startTransition] = useTransition();
  
  // Effect to redirect the user AFTER they have been successfully authenticated
  useEffect(() => {
    // If we have a user and we are not in the middle of an auth check
    if (user && !authLoading) {
      startTransition(() => {
        router.push("/admin");
      });
    }
  }, [user, authLoading, router]);
  
  const handleSignIn = async () => {
    // 1. Enter "signing in" state to provide user feedback
    setIsSigningIn(true);
    
    // 2. Start the isolated sign-in process and AWAIT the result
    const success = await signInWithGoogle();
    
    // 3. Exit "signing in" state
    setIsSigningIn(false);
    
    // If login was not successful, we just stop here. 
    // The user can try again. The useEffect above will handle redirection on success.
    if (!success) {
      console.log("Sign-in process was not completed.");
    }
  };

  const isLoading = authLoading || isSigningIn || isRedirecting;

  // Render nothing if we know we're about to redirect.
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
          {isSigningIn ? 'Authenticating...' : 'Sign in with Google'}
        </Button>
      </div>
    </div>
  );
}
