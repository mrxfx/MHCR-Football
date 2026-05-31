import { Link, useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Home, Users, UserSquare, Calendar, Trophy, Newspaper, Bot, Info, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const bottomNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/matches", label: "Matches", icon: Calendar },
    { href: "/standings", label: "Standings", icon: Trophy },
    { href: "/news", label: "News", icon: Newspaper },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary cursor-pointer">
            MHCR Football™
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
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
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card z-50 flex items-center justify-between px-4">
        <Link href="/" className="font-bold text-xl text-primary">
          MHCR Football™
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? "bg-primary text-primary-foreground" : ""}`}>
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-0 md:pt-0 pt-16">
        <div className="p-4 md:p-8 max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-card z-50 flex items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center justify-center w-16 h-full cursor-pointer ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <Icon size={20} />
                <span className="text-[10px] mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
