"use client";
import { useEffect, useState } from "react";
import { getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, Team, Player } from "@/lib/firestore";
import MainLayout from "@/components/layout/MainLayout";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import Link from "next/link";
import { teamAvatar } from "@/lib/utils";

export default function TeamDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getDoc(doc(db, "teams", id)),
      getDocs(collections.players),
    ]).then(([teamSnap, playersSnap]) => {
      if (teamSnap.exists()) setTeam({ id: teamSnap.id, ...teamSnap.data() } as Team);
      const all = playersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Player));
      setPlayers(all.filter(p => p.team === id));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <MainLayout><div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div></MainLayout>;
  if (!team) return <MainLayout><div className="py-20 text-center text-gray-400">Team not found.</div></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link href="/teams" className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> Back to Teams
        </Link>

        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-600 p-8 text-white flex items-center gap-6">
          <img src={teamAvatar(team.name, team.logo)} alt={team.name} className="w-24 h-24 rounded-full border-4 border-white/30 object-cover" />
          <div>
            <h1 className="text-3xl font-black">{team.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-blue-100 text-sm">
              <span className="flex items-center gap-1"><User size={14} /> {team.coach || "—"}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {team.stadium || "—"}</span>
              {team.founded && <span className="flex items-center gap-1"><Calendar size={14} /> Est. {team.founded}</span>}
            </div>
          </div>
        </div>

        {/* Players */}
        <div>
          <h2 className="text-lg font-bold mb-4">Squad ({players.length} players)</h2>
          {players.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-12 text-center text-gray-400 text-sm">No players assigned to this team</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {players.map(p => (
                <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-center hover:shadow-md transition-all">
                  <img src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=2563eb&color=fff&bold=true`} alt={p.name} className="w-14 h-14 rounded-full mx-auto mb-2 object-cover border-2 border-blue-100" />
                  <p className="font-bold text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.position}</p>
                  <div className="flex justify-center gap-3 mt-2 text-xs text-gray-500">
                    <span>#{p.number}</span>
                    <span>⚽ {p.goals}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
