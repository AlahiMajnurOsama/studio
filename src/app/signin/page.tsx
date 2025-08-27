
"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function SignInPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { setPageLoading } = useAppContext();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);

  useEffect(() => {
    if (!loading && user) {
      startTransition(() => {
        router.push("/admin");
      });
    }
  }, [user, loading, router]);
  
  const handleSignIn = async () => {
    await signInWithGoogle();
  };


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
          disabled={loading || isPending}
          className="w-full font-bold text-lg"
          size="lg"
        >
          <Chrome className="mr-2 h-5 w-5" />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
