"use client";
import { useEffect, useState } from "react";
import { query, orderBy, onSnapshot, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, Match, Team } from "@/lib/firestore";
import { getDocs } from "firebase/firestore";
import MainLayout from "@/components/layout/MainLayout";
import { formatDate } from "@/lib/utils";
import { teamAvatar } from "@/lib/utils";

type Tab = "all" | "live" | "upcoming" | "finished";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collections.teams).then(s => setTeams(s.docs.map(d => ({ id: d.id, ...d.data() } as Team)))).catch(() => {});
    const q = query(collection(db, "matches"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, s => {
      setMatches(s.docs.map(d => ({ id: d.id, ...d.data() } as Match)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const getName = (id: string) => teams.find(t => t.id === id)?.name || id;
  const getLogo = (id: string) => teamAvatar(getName(id), teams.find(t => t.id === id)?.logo);
  const isLive = (m: Match) => (m as any).live === true || m.status === "live";

  const filtered = tab === "all" ? matches
    : tab === "live" ? matches.filter(m => isLive(m))
    : matches.filter(m => m.status === tab);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "live", label: "🔴 Live" },
    { key: "upcoming", label: "Upcoming" },
    { key: "finished", label: "Finished" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div><h1 className="text-2xl font-black">Matches</h1><p className="text-sm text-gray-400 mt-1">All fixtures and results</p></div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-blue-600 text-white shadow-md" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-blue-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl animate-pulse" />)
          : filtered.length === 0 ? <div className="py-16 text-center text-gray-400 text-sm">No matches found</div>
          : filtered.map(m => (
            <div key={m.id} className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 shadow-sm ${isLive(m) ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10" : "border-gray-100 dark:border-gray-800"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{formatDate(m.date)}</span>
                {isLive(m) ? <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500 text-white animate-live">LIVE</span>
                : m.status === "upcoming" ? <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">Upcoming</span>
                : <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">Finished</span>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <img src={getLogo(m.homeTeam)} alt="" className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
                  <span className="font-bold text-sm md:text-base">{getName(m.homeTeam)}</span>
                </div>
                <div className="text-center px-4 flex-shrink-0">
                  {m.status === "upcoming" && !(m as any).live
                    ? <span className="text-xl font-black text-blue-600">VS</span>
                    : <span className="text-2xl font-black">{m.homeScore} – {m.awayScore}</span>
                  }
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="font-bold text-sm md:text-base">{getName(m.awayTeam)}</span>
                  <img src={getLogo(m.awayTeam)} alt="" className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
