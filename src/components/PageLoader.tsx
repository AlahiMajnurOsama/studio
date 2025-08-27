"use client";

import { useAppContext } from "@/context/AppContext";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

export default function PageLoader() {
  const { isPageLoading, isInitialLoading } = useAppContext();
  const showLoader = isPageLoading || isInitialLoading;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300",
        showLoader ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <Loader />
    </div>
  );
}
