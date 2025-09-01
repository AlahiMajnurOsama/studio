
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Coupon } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

const formSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters.").toUpperCase(),
  description: z.string().min(1, "Description is required."),
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, "Value must be positive."),
  scope: z.enum(['order', 'product']),
  productId: z.string().optional(),
  minSpend: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
}).refine(data => data.scope !== 'product' || (data.scope === 'product' && data.productId), {
    message: "Product ID is required when scope is 'product'",
    path: ["productId"],
});


type CouponFormValues = z.infer<typeof formSchema>;

interface CouponFormProps {
  onSubmit: (values: Omit<Coupon, 'code'>, code?: string) => void;
  coupon?: Coupon | null;
}

export default function CouponForm({ onSubmit, coupon }: CouponFormProps) {
  
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: coupon || {
      code: "",
      description: "",
      type: "percentage",
      value: 10,
      scope: "order",
      productId: "",
      minSpend: 0,
      isActive: true,
    },
  });

  const scope = form.watch("scope");

  const handleSubmit = (values: CouponFormValues) => {
    const finalValues = {
        ...values,
        minSpend: values.minSpend || undefined,
        productId: values.scope === 'product' ? values.productId : undefined,
    };
    onSubmit(finalValues, coupon?.code);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Coupon Code</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. SUMMER20" {...field} disabled={!!coupon} />
                </FormControl>
                <FormDescription>Must be unique. Cannot be changed after creation.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                    <Input placeholder="20% off all summer items" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g. 10 or 25.50" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="scope"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Scope</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a scope" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="order">Entire Order</SelectItem>
                        <SelectItem value="product">Specific Product</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            {scope === 'product' && (
                <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Product ID</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter product ID" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
        
         <FormField
            control={form.control}
            name="minSpend"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Minimum Spend (Optional)</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g. 50" {...field} />
                </FormControl>
                <FormDescription>The minimum order subtotal required to use this coupon.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Is Active?</FormLabel>
                <FormDescription>
                  Inactive coupons cannot be used by customers.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
       
        <div className="flex justify-end">
            <Button type="submit">
                {coupon ? "Update Coupon" : "Create Coupon"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
