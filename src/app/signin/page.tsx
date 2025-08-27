
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Loader2, User, UserPlus } from "lucide-react";
import Logo from "@/components/icons/Logo";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

type AuthStep = "initial" | "enter_password" | "enter_name";

export default function SignInPage() {
  const {
    user,
    loading,
    signInWithGoogle,
    checkIfUserExists,
    signInWithEmail,
    createUserWithEmail,
    signInAnonymously,
  } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [step, setStep] = useState<AuthStep>("initial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const redirectUrl = searchParams.get('redirect') || '/admin';
      router.push(redirectUrl);
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsProcessing(true);
    const lowerCaseEmail = email.toLowerCase();

    if (step === 'initial') {
      const { exists, error } = await checkIfUserExists(lowerCaseEmail);
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" });
      } else if (exists) {
        setStep('enter_password');
      } else {
        setStep('enter_name');
      }
    } else if (step === 'enter_password') {
      await handleAuthAction(() => signInWithEmail(lowerCaseEmail, password));
    } else if (step === 'enter_name') {
      await handleAuthAction(() => createUserWithEmail(lowerCaseEmail, password, name));
    }
    setIsProcessing(false);
  };


  const handleGoogleSignIn = () => handleAuthAction(signInWithGoogle);
  const handleAnonymousSignIn = () => handleAuthAction(signInAnonymously);

  const isLoading = loading || isProcessing;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-8 overflow-hidden">
        <div className="text-center space-y-4">
          <Logo />
          <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">
            Sign In or Create an Account
          </h1>
          <p className="text-muted-foreground">
            Get started with Shohure
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full font-semibold text-lg h-12"
          >
            {isProcessing ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.19 4.21-4.062 5.513l6.19 5.238C42.012 34.423 44 29.861 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>}
            Continue with Google
          </Button>

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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {step === 'initial' && (
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
              )}
              
              {step === 'enter_password' && (
                 <>
                  <p className="text-center text-sm">Welcome back! Please enter your password for <span className="font-semibold">{email}</span>.</p>
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
                      autoFocus
                    />
                  </div>
                 </>
              )}

              {step === 'enter_name' && (
                <>
                   <p className="text-center text-sm">Looks like you're new! Let's create your account.</p>
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
                      autoFocus
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 text-base"
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

            </motion.div>
          </AnimatePresence>
          
          <Button type="submit" disabled={isLoading || (step === 'initial' && !email)} className="w-full font-bold text-lg h-12 bg-primary hover:bg-primary/90">
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {step === 'enter_password' ? 'Sign In' : (step === 'enter_name' ? 'Create Account' : 'Continue')}
          </Button>

          {step !== 'initial' && (
             <Button variant="link" className="w-full" onClick={() => {
                setStep('initial');
                setPassword('');
                setName('');
             }} disabled={isLoading}>
                Use a different email
             </Button>
          )}

        </form>
      </div>
    </div>
  );
}
