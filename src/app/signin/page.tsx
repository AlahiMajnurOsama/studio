"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Chrome, Mail, Lock, Loader2, User } from "lucide-react";
import Logo from "@/components/icons/Logo";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

export default function SignInPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, createUserWithEmail, signInAnonymously } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      startTransition(() => {
        router.push("/admin");
      });
    }
  }, [user, loading, router]);

  const handleAuthAction = async (action: () => Promise<{ success: boolean; error?: string }>) => {
    startTransition(async () => {
      const { success, error } = await action();
      if (!success && error) {
        toast({
          title: "Authentication Failed",
          description: error,
          variant: "destructive",
        });
      }
    });
  };

  const handleGoogleSignIn = () => handleAuthAction(signInWithGoogle);
  const handleAnonymousSignIn = () => handleAuthAction(signInAnonymously);

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signin") {
      handleAuthAction(() => signInWithEmail(email, password));
    } else {
      handleAuthAction(() => createUserWithEmail(email, password));
    }
  };

  const isLoading = loading || isPending;

  if (user && !loading) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <Logo />
          <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">
            {mode === "signin" ? "Sign In To Your Account" : "Create a New Account"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "signin" ? "Welcome back, sign in to continue." : "Join us! It's quick and easy."}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full font-semibold text-lg h-12"
          >
            <Chrome className="mr-3 h-5 w-5" /> Continue with Google
          </Button>

          <Button
            onClick={handleAnonymousSignIn}
            disabled={isLoading}
            variant="secondary"
            className="w-full font-semibold text-lg h-12"
          >
            <User className="mr-3 h-5 w-5" /> Continue as Guest
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 text-base"
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 text-base"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch id="remember-me" checked={rememberMe} onCheckedChange={setRememberMe} disabled={isLoading} />
              <Label htmlFor="remember-me">Remember me</Label>
            </div>
            <Link href="#" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full font-bold text-lg h-12 bg-primary hover:bg-primary/90">
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
          <Button
            variant="link"
            className="font-medium text-primary hover:underline pl-2"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            disabled={isLoading}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </Button>
        </p>
      </div>
    </div>
  );
}