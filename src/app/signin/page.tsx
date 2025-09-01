
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Loader2, User, UserPlus } from "lucide-react";
import Logo from "@/components/icons/Logo";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/context/AppContext";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";

export default function SignInPage() {
  const {
    user,
    loading,
    signInWithEmail,
    createUserWithEmail,
    signInAnonymously,
  } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setPageLoading } = useAppContext();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);

  useEffect(() => {
    if (!loading && user) {
      startTransition(() => {
        const redirectUrl = searchParams.get("redirect") || "/admin";
        router.push(redirectUrl);
      });
    }
  }, [user, loading, router, searchParams]);

  const handleAuthAction = async (action: () => Promise<{ success: boolean; error?: string }>) => {
    setIsProcessing(true);
    const { success, error } = await action();
    if (!success && error) {
      toast({
        title: "Authentication Failed",
        description: error,
        variant: "destructive",
      });
    }
    // On success, the useEffect will handle redirection.
    setIsProcessing(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (mode === "signin") {
      await handleAuthAction(() => signInWithEmail(email, password));
    } else {
      await handleAuthAction(() => createUserWithEmail(email, password, name));
    }
  };

  const handleAnonymousSignIn = () => handleAuthAction(signInAnonymously);

  const isLoading = loading || isProcessing || isPending;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-8 overflow-hidden">
        <div className="text-center space-y-4">
          <Logo />
          <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">
            Welcome to Shohure
          </h1>
          <p className="text-muted-foreground">
            Sign in to your account or create a new one to continue.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <Button variant={mode === 'signin' ? 'default' : 'ghost'} onClick={() => setMode('signin')} disabled={isLoading}>
                Sign In
            </Button>
            <Button variant={mode === 'signup' ? 'default' : 'ghost'} onClick={() => setMode('signup')} disabled={isLoading}>
                Sign Up
            </Button>
        </div>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
            {mode === 'signup' && (
                 <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Full Name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
            )}
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
          <Button type="submit" disabled={isLoading} className="w-full font-bold text-lg h-12 bg-primary hover:bg-primary/90">
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleAnonymousSignIn}
            disabled={isLoading}
            variant="secondary"
            className="w-full font-semibold text-lg h-12"
          >
            {isProcessing ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <User className="mr-3 h-5 w-5" />}
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
}
