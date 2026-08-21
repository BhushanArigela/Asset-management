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
  Menu,
  Settings
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
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-primary">
      <div className="flex h-16 shrink-0 items-center justify-center bg-white border-b px-6">
        <img 
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo-inner.png`} 
          alt="Sheraton Logo" 
          className="h-full w-full object-contain scale-[1.75]"
        />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-6">
          {navigation.map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 px-2">
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
                          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white",
                          isActive
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-primary-foreground/80"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-accent-foreground" : "text-primary-foreground/60 group-hover:text-white"
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden xl:flex xl:w-64 xl:flex-col xl:fixed xl:inset-y-0 border-r border-[#1B2A4A]">
        <SidebarContent />
      </div>

      {/* Mobile/Tablet Sidebar */}
      <div className="xl:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="xl:hidden fixed top-3 left-4 z-50">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
