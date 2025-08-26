"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProductForm from "./ProductForm";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(
        (doc) => doc.data() as Product
      );
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products: ", error);
      toast({
        title: "Error",
        description: "Failed to fetch products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", productId));
        toast({ title: "Product deleted successfully!" });
        fetchProducts(); // Refresh list
      } catch (error) {
        console.error("Error deleting product: ", error);
        toast({
          title: "Error",
          description: "Failed to delete product.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormSubmit = async (values: Omit<Product, "id" | "popularity">, id?: string) => {
    const productId = id || doc(collection(db, "products")).id;
    const popularity = editingProduct?.popularity || Math.floor(Math.random() * 31) + 70; // 70-100

    const productData: Product = {
      ...values,
      id: productId,
      popularity,
    };

    try {
      await setDoc(doc(db, "products", productId), productData);
      toast({
        title: `Product ${id ? "updated" : "added"} successfully!`,
      });
      setIsDialogOpen(false);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error("Error saving product: ", error);
      toast({
        title: "Error",
        description: "Failed to save product.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
         <div className="flex justify-center items-center h-screen">
            <Skeleton className="w-1/2 h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          Admin Panel
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProduct}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={handleFormSubmit}
              product={editingProduct}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-lg shadow-sm">
        <div className="grid grid-cols-6 gap-4 p-4 font-bold border-b bg-muted/50">
            <div className="col-span-2">Name</div>
            <div>Category</div>
            <div>Price</div>
            <div>Popularity</div>
            <div>Actions</div>
        </div>
        {loading ? (
            <div className="p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
        ) : (
            products.map((product) => (
              <div key={product.id} className="grid grid-cols-6 gap-4 p-4 items-center border-b last:border-b-0">
                  <div className="col-span-2 font-medium">{product.name}</div>
                  <div>{product.category}</div>
                  <div>${product.price.toFixed(2)}</div>
                  <div>{product.popularity}</div>
                  <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
