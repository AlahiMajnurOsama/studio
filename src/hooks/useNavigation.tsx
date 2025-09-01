
"use client";

import { useTransition, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { setPageLoading } = useAppContext();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPageLoading(isPending);
  }, [isPending, setPageLoading]);

  const handleNav = useCallback(
    (href: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      if (pathname === href) return;
      
      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, router, startTransition]
  );

  return { handleNav, isPending };
}
