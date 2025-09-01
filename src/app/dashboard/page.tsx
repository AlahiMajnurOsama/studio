
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileEditor from "./ProfileEditor";
import OrderHistory from "./OrderHistory";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin?redirect=/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight mb-8">
          <Skeleton className="h-10 w-1/4" />
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-8">
        My Dashboard
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
          <ProfileEditor user={user} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Order History</h2>
          <OrderHistory userEmail={user.email!} />
        </div>
      </div>
    </div>
  );
}
