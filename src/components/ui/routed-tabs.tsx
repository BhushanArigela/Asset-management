"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs } from "./tabs";
import React, { Suspense } from "react";

function RoutedTabsInner({ defaultValue, children, className }: { defaultValue: string; children: React.ReactNode; className?: string }) {
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

export function RoutedTabs(props: { defaultValue: string; children: React.ReactNode; className?: string }) {
  return (
    <Suspense fallback={<Tabs defaultValue={props.defaultValue} className={props.className}>{props.children}</Tabs>}>
      <RoutedTabsInner {...props} />
    </Suspense>
  );
}
