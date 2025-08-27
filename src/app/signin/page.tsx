
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Chrome, Mail, Lock, Loader2, User, UserPlus } from "lucide-react";
import Logo from "@/components/icons/Logo";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
    if (step === 'initial') {
      const { exists, error } = await checkIfUserExists(email);
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" });
      } else if (exists) {
        setStep('enter_password');
      } else {
        setStep('enter_name');
      }
    } else if (step === 'enter_password') {
      await handleAuthAction(() => signInWithEmail(email, password));
    } else if (step === 'enter_name') {
      await handleAuthAction(() => createUserWithEmail(email, password, name));
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
            {isProcessing ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Chrome className="mr-3 h-5 w-5" />}
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
