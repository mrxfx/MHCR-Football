"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, UserSquare, Calendar, Trophy, Newspaper, Settings, LogOut, Menu, X, Shield, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-400" },
  { href: "/admin/teams", label: "Teams", icon: Users, color: "text-green-400" },
  { href: "/admin/players", label: "Players", icon: UserSquare, color: "text-purple-400" },
  { href: "/admin/matches", label: "Matches", icon: Calendar, color: "text-orange-400" },
  { href: "/admin/standings", label: "Standings", icon: Trophy, color: "text-yellow-400" },
  { href: "/admin/news", label: "News", icon: Newspaper, color: "text-pink-400" },
  { href: "/admin/settings", label: "Settings", icon: Settings, color: "text-gray-400" },
];

function SidebarContent({ pathname, onSignOut, onClose }: { pathname: string; onSignOut: () => void; onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" onClick={onClose} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">MHCR Football™</p>
              <p className="text-blue-300 text-xs">Admin Panel</p>
            </div>
          </Link>
          {onClose && (
            <button onClick={onClose} className="text-white/60 hover:text-white md:hidden">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Main Menu</p>
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href || (pathname === "/admin" && href === "/admin/dashboard");
          return (
            <Link key={href} href={href} onClick={onClose}>
              <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group cursor-pointer ${active ? "bg-blue-600 shadow-lg" : "hover:bg-white/10"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                    <Icon size={16} className={active ? "text-white" : color} />
                  </div>
                  <span className={`text-sm font-medium ${active ? "text-white" : "text-white/70 group-hover:text-white"}`}>{label}</span>
                </div>
                {active && <ChevronRight size={14} className="text-white/60" />}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Administrator</p>
            <p className="text-white/40 text-xs">Full Access</p>
          </div>
        </div>
        <button onClick={onSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20">
            <LogOut size={16} className="text-red-400" />
          </div>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-50 bg-[#0f1729] shadow-xl">
        <SidebarContent pathname={pathname} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f1729] shadow-2xl transform transition-transform duration-300 md:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent pathname={pathname} onSignOut={handleSignOut} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Menu size={22} />
            </button>
            <div>
              <h2 className="text-base font-semibold text-gray-800 dark:text-white capitalize">
                {navItems.find(n => n.href === pathname)?.label ?? "Admin Panel"}
              </h2>
              <p className="text-xs text-gray-400 hidden sm:block">MHCR Football™ Management</p>
            </div>
          </div>
          <Link href="/">
            <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
              View Site
            </button>
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
