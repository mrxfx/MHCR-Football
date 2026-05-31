"use client";
import { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { collections, Player, Team } from "@/lib/firestore";
import MainLayout from "@/components/layout/MainLayout";
import { Search } from "lucide-react";
import { teamAvatar } from "@/lib/utils";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDocs(collections.players), getDocs(collections.teams)])
      .then(([ps, ts]) => {
        setPlayers(ps.docs.map(d => ({ id: d.id, ...d.data() } as Player)));
        setTeams(ts.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || id;
  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterTeam === "" || p.team === filterTeam)
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-black">Players</h1><p className="text-sm text-gray-400 mt-1">All registered players</p></div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {loading ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 animate-pulse text-center">
              <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-1" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
            </div>
          )) : filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center text-gray-400 text-sm">No players found</div>
          ) : filtered.map(p => (
            <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center hover:shadow-md hover:border-blue-200 transition-all">
              <img src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=2563eb&color=fff&bold=true`} alt={p.name} className="w-14 h-14 rounded-full mx-auto mb-2 object-cover border-2 border-blue-50" />
              <p className="font-bold text-sm">{p.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{getTeamName(p.team)}</p>
              <p className="text-xs text-gray-400">{p.position}</p>
              <div className="flex justify-center gap-3 mt-2 text-xs text-gray-500">
                <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full">#{p.number}</span>
                <span className="bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">⚽ {p.goals}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
