
"use client";

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { withLoader } = useAppContext();

  const handleNav = useCallback(
    (href: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      if (pathname === href) return;

      withLoader(() => router.push(href));
    },
    [pathname, router, withLoader]
  );

  return { handleNav };
}
