
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileEditor from "./ProfileEditor";
import OrderHistory from "./OrderHistory";
import ChatCard from "./ChatCard";
import BottomNavBar, { type ActiveTab } from "./BottomNavBar";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

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
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-8">
        My Dashboard
      </h1>
      
      {/* Desktop View */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Order History</h2>
              <OrderHistory userEmail={user.email!} />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-4">Live Chat Support</h2>
                <ChatCard />
            </div>
        </div>
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
          <ProfileEditor user={user} />
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-8">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Order History</h2>
            <OrderHistory userEmail={user.email!} />
          </div>
        )}
        {activeTab === 'settings' && (
           <div>
             <h2 className="text-2xl font-semibold mb-4">My Profile</h2>
             <ProfileEditor user={user} />
           </div>
        )}
        {activeTab === 'chat' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Live Chat Support</h2>
            <ChatCard />
          </div>
        )}
      </div>

      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
