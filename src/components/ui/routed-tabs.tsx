"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "./tabs";
import React from "react";

export function RoutedTabs({ defaultValue, children, className }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || defaultValue;

  return (
    <Tabs 
      value={currentTab} 
      onValueChange={(val) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", val);
        router.push(`?${params.toString()}`, { scroll: false });
      }}
      className={className}
    >
      {children}
    </Tabs>
  );
}
