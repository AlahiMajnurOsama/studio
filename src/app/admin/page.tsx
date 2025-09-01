
"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, ArrowRight, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
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
}) => (
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
      <Link href={href}>
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold py-2 px-3 bg-black/20 rounded-lg hover:bg-black/40">
          <span>More info</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </div>
);


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

  const handleNav = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(path);
    });
  }


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
    { title: "Total Orders", value: 2, icon: ShoppingCart, href: "/admin/orders", color: "text-green-500", bgColor: "bg-gradient-to-br from-green-500 to-green-700" },
    { title: "Pending Orders", value: 1, icon: Clock, href: "/admin/orders", color: "text-yellow-500", bgColor: "bg-gradient-to-br from-yellow-500 to-yellow-700" },
    { title: "Total Customers", value: 3, icon: Users, href: "/admin/users", color: "text-purple-500", bgColor: "bg-gradient-to-br from-purple-500 to-purple-700" },
    { title: "Processing Orders", value: 1, icon: ArrowRight, href: "#", color: "text-teal-500", bgColor: "bg-gradient-to-br from-teal-500 to-teal-700" },
    { title: "Delivered Orders", value: 1, icon: CheckCircle, href: "#", color: "text-cyan-500", bgColor: "bg-gradient-to-br from-cyan-500 to-cyan-700" },
    { title: "Canceled Orders", value: 0, icon: XCircle, href: "#", color: "text-red-500", bgColor: "bg-gradient-to-br from-red-500 to-red-700" },
    { title: "Total Revenue", value: "$405.49", icon: DollarSign, href: "#", color: "text-indigo-500", bgColor: "bg-gradient-to-br from-indigo-500 to-indigo-700" },
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
