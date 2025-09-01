
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { Coupon } from "@/lib/types";
import { coupons as localCoupons } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, ArrowLeft, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CouponForm from "./CouponForm";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigation } from "@/hooks/useNavigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminCouponsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { handleNav } = useNavigation();
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin");
    }
  }, [user, authLoading, router]);

  const fetchCoupons = () => {
    setLoading(true);
    // Simulate fetching
    setTimeout(() => {
      setCoupons(localCoupons);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    if (user) {
      fetchCoupons();
    }
  }, [user]);

  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleDeleteCoupon = (couponCode: string) => {
    toast({ title: "Coupon deleted (Demo)!", description: "In a real app, this coupon would be removed." });
  };
  
  const handleToggleActive = (couponCode: string) => {
    toast({ title: "Coupon status updated (Demo)!", description: "In a real app, this status would be saved." });
  };


  const handleFormSubmit = (values: Omit<Coupon, 'code'>, code?: string) => {
    const action = code ? "updated" : "added";
    toast({
      title: `Coupon ${action} (Demo)!`,
      description: "This is a frontend demo. No data was saved.",
    });
    setIsDialogOpen(false);
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
        <Button variant="outline" size="icon" onClick={handleNav('/admin')}>
            <ArrowLeft />
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">
          Manage Coupons
        </h1>
      </div>

      <div className="flex justify-end items-center mb-8">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddCoupon}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
              </DialogTitle>
            </DialogHeader>
            <CouponForm
              onSubmit={handleFormSubmit}
              coupon={editingCoupon}
            />
          </DialogContent>
        </Dialog>
      </div>

       {loading ? (
          <div className="p-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
              ))}
          </div>
       ) : (
        <Card>
            <CardContent className="p-0">
                <div className="grid grid-cols-12 gap-4 p-4 font-bold border-b bg-muted/50 text-xs uppercase">
                    <div className="col-span-3">Code</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>
                {coupons.map((coupon) => (
                <div key={coupon.code} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-b-0 text-sm">
                    <div className="col-span-3 font-mono font-bold text-primary flex items-center gap-2">
                        <Tag className="h-4 w-4" /> {coupon.code}
                    </div>
                    <div className="col-span-5 text-muted-foreground">{coupon.description}</div>
                    <div className="col-span-2 text-center">
                        <Badge variant={coupon.isActive ? "default" : "secondary"} className={cn(coupon.isActive && "bg-green-500/80")}>
                            {coupon.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <div className="flex gap-2 justify-end col-span-2">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleActive(coupon.code)}>
                            {coupon.isActive ? <ToggleRight className="h-5 w-5 text-green-500"/> : <ToggleLeft className="h-5 w-5 text-muted-foreground"/>}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleEditCoupon(coupon)}>
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
                                This action cannot be undone. This will permanently delete the coupon.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCoupon(coupon.code)}>
                                Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                ))}
            </CardContent>
        </Card>
       )}
    </div>
  );
}
