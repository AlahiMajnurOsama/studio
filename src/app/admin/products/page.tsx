
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, ArrowLeft, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProductForm from "../ProductForm";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/context/AppContext";

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { setPageLoading } = useAppContext();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);
  
  useEffect(() => {
    if (!authLoading && !user) {
      startTransition(() => {
        router.push("/signin");
      });
    }
  }, [user, authLoading, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id }) as Product
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
      await setDoc(doc(db, "products", productId), productData, { merge: true });
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
       <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
            <Link href="/admin">
                <ArrowLeft />
            </Link>
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          Manage Products
        </h1>
      </div>

      <div className="flex justify-end items-center mb-8">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddProduct}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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

       {loading ? (
          <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
              ))}
          </div>
       ) : (
        <>
        {/* Mobile View */}
        <div className="grid gap-4 md:hidden">
            {products.map((product) => (
                <Card key={product.id}>
                    <CardHeader>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><span className="font-semibold">Category:</span> {product.category || 'N/A'}</p>
                        <p><span className="font-semibold">Price:</span> ${product.price.toFixed(2)}</p>
                        <p><span className="font-semibold">Popularity:</span> {product.popularity}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the product.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                </Card>
            ))}
        </div>

        {/* Desktop View */}
        <div className="bg-card border rounded-lg shadow-sm hidden md:block">
            <div className="grid grid-cols-6 gap-4 p-4 font-bold border-b bg-muted/50">
                <div className="col-span-2">Name</div>
                <div>Category</div>
                <div>Price</div>
                <div>Popularity</div>
                <div className="text-right">Actions</div>
            </div>
            {products.map((product) => (
              <div key={product.id} className="grid grid-cols-6 gap-4 p-4 items-center border-b last:border-b-0">
                  <div className="col-span-2 font-medium">{product.name}</div>
                  <div>{product.category || 'N/A'}</div>
                  <div>${product.price.toFixed(2)}</div>
                  <div>{product.popularity}</div>
                  <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the product.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </div>
              </div>
            ))}
        </div>
        </>
       )}
    </div>
  );
}
