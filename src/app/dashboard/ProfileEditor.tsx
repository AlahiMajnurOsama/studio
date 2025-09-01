
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  displayName: z.string().min(1, "Name is required."),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditorProps {
  user: { displayName: string | null; email: string | null };
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
    // This is a mock update. We removed the artificial delay.
    toast({
      title: "Success! (Demo)",
      description: "Your profile has been updated.",
    });
    setIsSubmitting(false);
  };

  const handlePasswordReset = async () => {
    setIsResetting(true);
    // This is a mock password reset. We removed the artificial delay.
    toast({
      title: "Password Reset Email Sent (Demo)",
      description: "Check your inbox to reset your password.",
    });
    setIsResetting(false);
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium">Account Information</h3>
          <p className="text-sm text-muted-foreground">Update your personal details here.</p>
        </div>
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
        <Separator />
        <div>
          <h3 className="text-lg font-medium">Password</h3>
          <p className="text-sm text-muted-foreground mb-4">
              Click the button below to receive a password reset link in your email.
          </p>
          <Button variant="outline" onClick={handlePasswordReset} disabled={isResetting}>
              {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Password Reset Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
