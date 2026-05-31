"use client";
import { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { collections, Standing, Team } from "@/lib/firestore";
import MainLayout from "@/components/layout/MainLayout";
import { teamAvatar } from "@/lib/utils";

export default function StandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDocs(collections.standings), getDocs(collections.teams)])
      .then(([ss, ts]) => {
        const data = ss.docs.map(d => ({ id: d.id, ...d.data() } as Standing));
        data.sort((a, b) => b.points - a.points);
        setStandings(data);
        setTeams(ts.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getName = (id: string) => teams.find(t => t.id === id)?.name || id;
  const getLogo = (id: string) => teamAvatar(getName(id), teams.find(t => t.id === id)?.logo);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div><h1 className="text-2xl font-black">Standings</h1><p className="text-sm text-gray-400 mt-1">League table</p></div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <th className="text-left px-5 py-3 w-8">#</th>
                  <th className="text-left px-3 py-3">Team</th>
                  <th className="text-center px-3 py-3">P</th>
                  <th className="text-center px-3 py-3">W</th>
                  <th className="text-center px-3 py-3">D</th>
                  <th className="text-center px-3 py-3">L</th>
                  <th className="text-center px-3 py-3 font-bold text-blue-600">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-6 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" /></td></tr>
                )) : standings.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm">No standings available</td></tr>
                ) : standings.map((s, i) => (
                  <tr key={s.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${i === 0 ? "bg-yellow-50/50 dark:bg-yellow-900/5" : ""}`}>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-black ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-400"}`}>{i + 1}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <img src={getLogo(s.team)} alt="" className="w-8 h-8 rounded-full border border-gray-100 object-cover" />
                        <span className="font-semibold">{getName(s.team)}</span>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3 text-gray-500">{s.played}</td>
                    <td className="text-center px-3 py-3 text-green-600 font-medium">{s.won}</td>
                    <td className="text-center px-3 py-3 text-gray-500">{s.draw}</td>
                    <td className="text-center px-3 py-3 text-red-500">{s.lost}</td>
                    <td className="text-center px-3 py-3 font-black text-blue-600 text-base">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
