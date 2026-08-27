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
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

const navigation = [
  {
    title: "Dashboard",
    items: [{ title: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Asset Management",
    items: [
      { title: "Assets", href: "/assets", icon: Package, permission: PERMISSIONS.ASSETS_VIEW },
      { title: "Maintenance", href: "/maintenance", icon: Wrench, permission: PERMISSIONS.MAINTENANCE_VIEW },
      { title: "Movements", href: "/movements", icon: ArrowLeftRight, permission: PERMISSIONS.MOVEMENTS_VIEW },
    ],
  },
  {
    title: "Masters",
    items: [
      { title: "Locations", href: "/masters/locations", icon: MapPin, permission: PERMISSIONS.MASTERS_VIEW },
      { title: "Classifications", href: "/masters/classifications", icon: Tags, permission: PERMISSIONS.MASTERS_VIEW },
      { title: "Vendors", href: "/masters/vendors", icon: Store, permission: PERMISSIONS.MASTERS_VIEW },
    ],
  },
  {
    title: "Reports",
    items: [{ title: "Reports", href: "/reports", icon: BarChart3, permission: PERMISSIONS.REPORTS_VIEW }],
  },
  {
    title: "Audits",
    items: [
      { title: "Asset Audits", href: "/audits", icon: ClipboardCheck, permission: PERMISSIONS.AUDITS_VIEW },
      { title: "Audit Logs", href: "/audit-logs", icon: ScrollText, permission: PERMISSIONS.AUDIT_LOGS_VIEW },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Users", href: "/users", icon: Users, permission: PERMISSIONS.USERS_VIEW },
      { title: "Roles", href: "/roles", icon: Lock, permission: PERMISSIONS.ROLES_VIEW },
      { title: "Settings", href: "/settings", icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
    ],
  },
];

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const userPermissions = session?.user?.permissions;

  // Filter navigation based on permissions
  const filteredNavigation = navigation.map(group => ({
    ...group,
    items: group.items.filter(item => !item.permission || hasPermission(userPermissions, item.permission))
  })).filter(group => group.items.length > 0);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#1c2d4a]">
      <div className="flex h-16 shrink-0 items-center justify-center bg-white border-b px-6">
        <img 
          src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo-inner.png`} 
          alt="Sheraton Logo" 
          className="h-full w-full object-contain scale-[1.75]"
        />
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <nav className="flex-1 space-y-8">
          {filteredNavigation.map((group) => (
            <div key={group.title} className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8A99BA] px-4">
                {group.title}
              </h4>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.title}>
                      <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                        className={cn(
                          "group flex items-center gap-4 rounded-lg px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-white/10 hover:text-white",
                          isActive
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-[#D1D5DB]"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0",
                            isActive ? "text-accent-foreground" : "text-[#8A99BA] group-hover:text-white"
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
        <Sheet open={open} onOpenChange={setOpen}>
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
