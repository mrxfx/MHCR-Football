"use client";
import { useEffect, useState } from "react";
import { getDocs } from "firebase/firestore";
import { collections, Team } from "@/lib/firestore";
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import { Users } from "lucide-react";
import { teamAvatar } from "@/lib/utils";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(collections.teams)
      .then(s => setTeams(s.docs.map(d => ({ id: d.id, ...d.data() } as Team))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black">Teams</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">All registered teams</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-3" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto" />
            </div>
          )) : teams.length === 0 ? (
            <div className="col-span-3 py-16 text-center">
              <Users size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No teams added yet</p>
            </div>
          ) : teams.map(team => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group cursor-pointer text-center">
                <img src={teamAvatar(team.name, team.logo)} alt={team.name} className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-gray-100 dark:border-gray-700 object-cover group-hover:border-blue-200 transition-colors" />
                <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors">{team.name}</h3>
                <p className="text-xs text-gray-400 mt-1">Coach: {team.coach || "—"}</p>
                <p className="text-xs text-gray-400">Stadium: {team.stadium || "—"}</p>
                <button className="mt-3 text-xs text-blue-600 font-semibold hover:underline">View Details →</button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
