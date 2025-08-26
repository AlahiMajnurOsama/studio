"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Product, ProductVariant } from "@/lib/types";
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
import { useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Product name is required."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number.").optional(),
  image: z.string().url("Must be a valid URL.").optional(),
  category: z.enum(['Health & Beauty', 'Electronics', 'Fashion', 'Home & Living', 'Groceries']).optional(),
  colors: z.string().optional(), // Comma-separated
  sizes: z.string().optional(), // Comma-separated
  variants: z.array(z.object({
    name: z.string().min(1, "Variant name cannot be empty"),
    priceModifier: z.coerce.number().optional()
  })).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit: (values: Omit<Product, "id" | "popularity">, id?: string) => void;
  product?: Product | null;
}

export default function ProductForm({ onSubmit, product }: ProductFormProps) {
  const defaultValues: ProductFormValues = {
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    image: product?.image || "",
    category: product?.category || undefined,
    colors: product?.colors?.join(", ") || "",
    sizes: product?.sizes?.join(", ") || "",
    variants: product?.variants || [],
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    if (product) {
      form.reset(defaultValues);
    }
  }, [product, form.reset]);


  const handleSubmit = (values: ProductFormValues) => {
    const transformedValues: Omit<Product, "id" | "popularity"> = {
      ...values,
      price: values.price || 0,
      image: values.image || '',
      colors: values.colors ? values.colors.split(",").map((s) => s.trim()).filter(Boolean) : [],
      sizes: values.sizes ? values.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      variants: values.variants?.map(v => ({...v, priceModifier: v.priceModifier || 0}))
    };
    onSubmit(transformedValues, product?.id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Aura Headphones" {...field} />
              </FormControl>
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
                <Textarea placeholder="Describe the product..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Base Price</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="249.99" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Fashion">Fashion</SelectItem>
                        <SelectItem value="Home & Living">Home & Living</SelectItem>
                        <SelectItem value="Health & Beauty">Health & Beauty</SelectItem>
                        <SelectItem value="Groceries">Groceries</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://picsum.photos/seed/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="colors"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Colors</FormLabel>
                <FormControl>
                    <Input placeholder="#343a40, #f8f9fa, #9D4EDD" {...field} />
                </FormControl>
                <FormDescription>
                    Comma-separated hex codes.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="sizes"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Sizes</FormLabel>
                <FormControl>
                    <Input placeholder="S, M, L, XL" {...field} />
                </FormControl>
                <FormDescription>
                    Comma-separated values.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />

        <div>
            <FormLabel>Variants (e.g., Standard, Pro, 128GB)</FormLabel>
            <FormDescription className="mb-2">
                Add different versions of the product. You can add a price modifier for each.
            </FormDescription>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                        <FormField
                        control={form.control}
                        name={`variants.${index}.name`}
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormLabel>Variant Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Pro" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={`variants.${index}.priceModifier`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price Modifier</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="+50.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ name: '', priceModifier: 0 })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Variant
            </Button>
        </div>


        <div className="flex justify-end">
            <Button type="submit">
                {product ? "Update Product" : "Create Product"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
