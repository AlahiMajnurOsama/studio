
"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart } from "lucide-react";
import { useAppContext } from "@/context/AppContext";


export default function AdminDashboardPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { setPageLoading } = useAppContext();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        startTransition(() => {
          router.push("/signin");
        });
      } else if (!isAdmin) {
        startTransition(() => {
          router.push("/");
        });
      }
    }
  }, [user, authLoading, isAdmin, router]);


  if (authLoading || !user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
         <div className="flex justify-center items-center h-screen">
            <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight mb-8">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/admin/products">
                <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Products
                        </CardTitle>
                        <Package className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Manage Store</div>
                        <p className="text-xs text-muted-foreground">
                            Add, edit, and delete products.
                        </p>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/admin/orders">
                <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Orders
                        </CardTitle>
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">View Orders</div>
                        <p className="text-xs text-muted-foreground">
                            Review and analyze customer orders.
                        </p>
                    </CardContent>
                </Card>
            </Link>
            
            <Link href="/admin/users">
                 <Card className="hover:border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Customers
                        </CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Manage Users</div>
                         <p className="text-xs text-muted-foreground">
                            View and manage customer accounts.
                        </p>
                    </CardContent>
                </Card>
            </Link>
        </div>
    </div>
  );
}
