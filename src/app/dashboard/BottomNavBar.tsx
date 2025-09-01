
"use client";

import type { Dispatch, SetStateAction } from 'react';
import { LayoutDashboard, Settings, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActiveTab = 'dashboard' | 'settings' | 'chat';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>;
}

export default function BottomNavBar({ activeTab, setActiveTab }: BottomNavBarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'chat', label: 'Live Chat', icon: MessageCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className="grid h-16 grid-cols-3">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "flex h-full flex-col items-center justify-center gap-1 rounded-none text-xs h-auto",
              activeTab === item.id ? "text-primary bg-muted" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab(item.id as ActiveTab)}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
