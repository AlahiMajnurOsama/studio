
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { User } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getAuth, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().min(1, "Name is required."),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditorProps {
  user: User;
}

export default function ProfileEditor({ user }: ProfileEditorProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || "",
      email: user.email || "",
    },
  });

  const handleUpdateProfile = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    const auth = getAuth();
    if (auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, {
          displayName: values.displayName,
        });
        toast({
          title: "Success!",
          description: "Your profile has been updated.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update profile: " + error.message,
          variant: "destructive",
        });
      }
    }
    setIsSubmitting(false);
  };

  const handlePasswordReset = async () => {
    setIsResetting(true);
    const auth = getAuth();
    if (auth.currentUser?.email) {
      try {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        toast({
          title: "Password Reset Email Sent",
          description: "Check your inbox to reset your password.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to send password reset email: " + error.message,
          variant: "destructive",
        });
      }
    }
    setIsResetting(false);
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleUpdateProfile)} className="space-y-4">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </Form>
      <div>
         <h3 className="font-semibold mb-2">Password</h3>
         <p className="text-sm text-muted-foreground mb-4">
            Click the button below to receive a password reset link in your email.
        </p>
         <Button variant="outline" onClick={handlePasswordReset} disabled={isResetting}>
            {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Password Reset Email
        </Button>
      </div>
    </div>
  );
}
