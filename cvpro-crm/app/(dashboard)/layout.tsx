"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileText,
  Megaphone,
  FileCode,
  BarChart3,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Unified Inbox", icon: MessageSquare },
  { href: "/contacts", label: "Contacts & Pipeline", icon: Users },
  { href: "/cv-analyzer", label: "CV Analyzer", icon: FileText },
  { href: "/broadcasts", label: "Broadcasts", icon: Megaphone },
  { href: "/templates", label: "Templates", icon: FileCode },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-status", label: "AI & Gemini Status", icon: Cpu },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
          {/* Sidebar */}
          <aside className="w-64 flex flex-col border-r border-sidebar-border bg-sidebar shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
              <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
                <Cpu className="w-6 h-6" />
                <span>CVPro.ae</span>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                      isActive
                        ? "bg-sidebar-primary/10 text-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-sidebar-border">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">
                  AD
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Admin User</span>
                  <span className="text-xs text-muted-foreground">admin@cvpro.ae</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            {children}
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
