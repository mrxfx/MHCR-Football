import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, UserSquare, Calendar, Trophy, Newspaper, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/teams", label: "Teams", icon: Users },
    { href: "/admin/players", label: "Players", icon: UserSquare },
    { href: "/admin/matches", label: "Matches", icon: Calendar },
    { href: "/admin/standings", label: "Standings", icon: Trophy },
    { href: "/admin/news", label: "News", icon: Newspaper },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Admin Sidebar */}
      <aside className="w-64 flex-col border-r bg-card hidden md:flex">
        <div className="p-6 border-b">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary cursor-pointer">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"}`}>
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Button variant="destructive" className="w-full justify-start gap-3" onClick={signOut}>
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
