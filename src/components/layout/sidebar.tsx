"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Wrench,
  ArrowLeftRight,
  MapPin,
  Tags,
  Store,
  BarChart3,
  ClipboardCheck,
  ScrollText,
  Users,
  Lock,
  Building2,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navigation = [
  {
    title: "Dashboard",
    items: [{ title: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Asset Management",
    items: [
      { title: "Assets", href: "/assets", icon: Package },
      { title: "Maintenance", href: "/maintenance", icon: Wrench },
      { title: "Movements", href: "/movements", icon: ArrowLeftRight },
    ],
  },
  {
    title: "Masters",
    items: [
      { title: "Locations", href: "/masters/locations", icon: MapPin },
      { title: "Classifications", href: "/masters/classifications", icon: Tags },
      { title: "Vendors", href: "/masters/vendors", icon: Store },
    ],
  },
  {
    title: "Reports",
    items: [{ title: "Reports", href: "/reports", icon: BarChart3 }],
  },
  {
    title: "Audits",
    items: [
      { title: "Asset Audits", href: "/audits", icon: ClipboardCheck },
      { title: "Audit Logs", href: "/audit-logs", icon: ScrollText },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Users", href: "/users", icon: Users },
      { title: "Roles", href: "/roles", icon: Lock },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const SidebarContent = () => (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-6 text-primary">
        <Building2 className="h-6 w-6 text-accent" />
        <span className="font-bold tracking-tight text-lg">Sheraton</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-6">
          {navigation.map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-2">
                {group.title}
              </h4>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                          isActive
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-accent" : "text-muted-foreground"
                          )}
                          aria-hidden="true"
                        />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-background border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-4 z-50">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
