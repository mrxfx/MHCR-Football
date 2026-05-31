"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, UserSquare, Calendar, Trophy, Newspaper, Bot, Info, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/players", label: "Players", icon: UserSquare },
  { href: "/matches", label: "Matches", icon: Calendar },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { href: "/about", label: "About", icon: Info },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isDark, toggle } = useTheme();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-40">
        <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="text-xl font-black text-blue-600 tracking-tight">
            MHCR Football™
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium ${
                  active ? "bg-blue-600 text-white shadow-md" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}>
                  <Icon size={18} />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={toggle} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors w-full px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-50 flex justify-around px-2 py-2">
        {navItems.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 min-w-0 flex-1">
              <div className={`p-1.5 rounded-lg ${active ? "bg-blue-600 text-white" : "text-gray-400"}`}>
                <Icon size={18} />
              </div>
              <span className={`text-[10px] truncate ${active ? "text-blue-600 font-semibold" : "text-gray-400"}`}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
