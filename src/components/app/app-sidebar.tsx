"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Ticket,
  CreditCard,
  Settings,
  LifeBuoy,
  Megaphone,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";

const navItems = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/app/tickets", label: "Chamados", icon: Ticket },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
  { href: "/app/help", label: "Base de Conhecimento", icon: LifeBuoy },
  { href: "/app/announcements", label: "Comunicados", icon: Megaphone },
  { href: "/app/settings", label: "Configurações", icon: Settings }
];

export function AppSidebar() {
  const currentPath = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-white px-4 py-6 md:flex">
      <Link href="/" className="mb-6 flex items-center gap-3">
        <BrandLogo />
      </Link>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-brand-gradient text-white shadow-soft"
                  : "text-muted-foreground hover:bg-slate-50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-lg border bg-slate-50 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Activity className="h-4 w-4 text-emerald-500" />
          Status do sistema
        </div>
        <p className="mt-2">Operação normal • SLA 99.95%</p>
      </div>
    </aside>
  );
}

