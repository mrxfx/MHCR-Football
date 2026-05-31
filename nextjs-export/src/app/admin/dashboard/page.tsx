"use client";
import { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { collections } from "@/lib/firestore";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { Users, UserSquare, Calendar, Newspaper, Trophy, ArrowRight, Activity } from "lucide-react";

interface Stats { teams: number; players: number; matches: number; news: number; standings: number; }

const quickLinks = [
  { label: "Add Team", href: "/admin/teams", icon: Users, desc: "Register a new team" },
  { label: "Add Player", href: "/admin/players", icon: UserSquare, desc: "Register a new player" },
  { label: "Create Match", href: "/admin/matches", icon: Calendar, desc: "Schedule a new match" },
  { label: "Publish News", href: "/admin/news", icon: Newspaper, desc: "Write a news article" },
  { label: "Update Standings", href: "/admin/standings", icon: Trophy, desc: "Edit league table" },
  { label: "Settings", href: "/admin/settings", icon: Activity, desc: "App configuration" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ teams: 0, players: 0, matches: 0, news: 0, standings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDocs(collections.teams), getDocs(collections.players), getDocs(collections.matches),
      getDocs(collections.news), getDocs(collections.standings),
    ]).then(([t, p, m, n, s]) => {
      setStats({ teams: t.size, players: p.size, matches: m.size, news: n.size, standings: s.size });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Teams", value: stats.teams, icon: Users, light: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400", href: "/admin/teams" },
    { label: "Total Players", value: stats.players, icon: UserSquare, light: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400", href: "/admin/players" },
    { label: "Total Matches", value: stats.matches, icon: Calendar, light: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", href: "/admin/matches" },
    { label: "News Articles", value: stats.news, icon: Newspaper, light: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-600 dark:text-pink-400", href: "/admin/news" },
    { label: "Standings", value: stats.standings, icon: Trophy, light: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-600 dark:text-yellow-400", href: "/admin/standings" },
  ];

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Overview of your football platform</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {cards.map(c => {
            const Icon = c.icon;
            return (
              <Link key={c.href} href={c.href}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className={`w-10 h-10 ${c.light} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={20} className={c.text} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
                    {loading ? <div className="w-8 h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /> : c.value}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{c.label}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            <span className="text-xs text-gray-400">Manage your content</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group ${i % 3 !== 2 ? "sm:border-r border-gray-100 dark:border-gray-700" : ""} border-b border-gray-100 dark:border-gray-700`}>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-8">MHCR Football™ Admin · All changes reflect live on the public site</p>
      </AdminLayout>
    </ProtectedRoute>
  );
}
