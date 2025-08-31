
"use client";

import { useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import CheckoutClient from "./CheckoutClient";
import { useAppContext } from "@/context/AppContext";

export default function CheckoutPage() {
  const { setPageLoading } = useAppContext();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

   useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);

  // Example of using startTransition for a function, not just a simple nav
  const handleSomeAction = () => {
    startTransition(() => {
      // some async action
      router.push('/');
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutClient />
    </div>
  );
}
