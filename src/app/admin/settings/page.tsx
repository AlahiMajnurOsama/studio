
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSettings } from "@/context/SettingsContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigation } from "@/hooks/useNavigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";

const settingsFormSchema = z.object({
  brandName: z.string().min(1, "Brand name is required."),
  receiptThanksText: z.string().min(1, "Receipt message is required."),
  heroImageUrls: z.tuple([
    z.string().url("Must be a valid URL."),
    z.string().url("Must be a valid URL."),
    z.string().url("Must be a valid URL."),
  ]),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SiteSettingsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { handleNav } = useNavigation();
  const {
    brandName,
    receiptThanksText,
    heroImageUrls,
    updateSettings,
    isSettingsLoading,
  } = useSettings();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    values: {
      brandName,
      receiptThanksText,
      heroImageUrls,
    },
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [user, authLoading, isAdmin, router]);

  const onSubmit = (data: SettingsFormValues) => {
    updateSettings(data);
  };

  if (isSettingsLoading || authLoading || !user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={handleNav("/admin")}>
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          Site Settings
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                    <CardTitle>Branding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="brandName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Brand Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g. ChromaShop" {...field} />
                            </FormControl>
                            <FormDescription>
                            This name will appear in the header and on receipts.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Homepage Carousel</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    {heroImageUrls.map((_, index) => (
                        <FormField
                            key={index}
                            control={form.control}
                            name={`heroImageUrls.${index}` as const}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Carousel Image URL {index + 1}</FormLabel>
                                <FormControl>
                                <Input placeholder="https://picsum.photos/..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    ))}
                 </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Customer Communication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="receiptThanksText"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Receipt "Thank You" Message</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Thank you for your purchase!"
                                {...field}
                            />
                            </FormControl>
                            <FormDescription>
                                This message appears on the customer's order receipt.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
