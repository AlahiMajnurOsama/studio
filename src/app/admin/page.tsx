
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ArrowRight, DollarSign } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { cn } from "@/lib/utils";

const StatCard = ({
  title,
  value,
  icon: Icon,
  href,
  color,
  bgColor,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}) => {
  const { handleNav } = useNavigation();

  return (
    <div
      className={cn(
        "rounded-lg p-6 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
        bgColor
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-4xl font-bold">{value}</h3>
          <p className="text-sm font-medium mt-1">{title}</p>
        </div>
        <div className="p-3 bg-black/20 rounded-lg">
           <Icon className="h-6 w-6" />
        </div>
      </div>
      <a href={href} onClick={handleNav(href)} className="mt-6 inline-block">
        <div className="flex items-center gap-2 text-sm font-semibold py-2 px-3 bg-black/20 rounded-lg hover:bg-black/40">
          <span>More info</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </a>
    </div>
  );
};


export default function AdminDashboardPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { handleNav, isPending } = useNavigation();
  const router = useRouter();


  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/signin");
      } else if (!isAdmin) {
        router.push("/");
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

  const stats = [
    { title: "Total Products", value: 16, icon: Package, href: "/admin/products", color: "text-blue-500", bgColor: "bg-gradient-to-br from-blue-500 to-blue-700" },
    { title: "Total Customers", value: 4, icon: Users, href: "/admin/users", color: "text-purple-500", bgColor: "bg-gradient-to-br from-purple-500 to-purple-700" },
    { title: "Total Transactions", value: 3, icon: DollarSign, href: "/admin/transactions", color: "text-green-500", bgColor: "bg-gradient-to-br from-green-500 to-green-700" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight mb-8">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
             <StatCard 
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                href={stat.href}
                color={stat.color}
                bgColor={stat.bgColor}
              />
          ))}
        </div>
    </div>
  );
}
