"use client";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Match, Team, News, Standing } from "@/lib/firestore";
import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import { Trophy, Newspaper, Tv2, ArrowRight } from "lucide-react";
import { teamAvatar, formatDate } from "@/lib/utils";

export default function HomePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [scoreboard, setScoreboard] = useState<Match[]>([]);
  const [topTeams, setTopTeams] = useState<Standing[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [loadingScores, setLoadingScores] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  const getName = (id: string) => teams.find(t => t.id === id)?.name || id;
  const getLogo = (id: string) => teamAvatar(getName(id), teams.find(t => t.id === id)?.logo);
  const isLive = (m: Match) => (m as any).live === true || m.status === "live";

  useEffect(() => {
    getDocs(collection(db, "teams")).then(s => setTeams(s.docs.map(d => ({ id: d.id, ...d.data() } as Team)))).catch(() => {});
  }, []);

  useEffect(() => {
    const q = query(collection(db, "matches"), orderBy("date", "desc"), limit(5));
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Match));
      setScoreboard(all);
      setFeaturedMatch(all.find(m => isLive(m)) || all.find(m => m.status === "upcoming") || all[0] || null);
      setLoadingScores(false);
    }, () => setLoadingScores(false));
    return () => unsub();
  }, []);

  useEffect(() => {
    getDocs(collection(db, "standings")).then(s => {
      const d = s.docs.map(doc => ({ id: doc.id, ...doc.data() } as Standing));
      d.sort((a, b) => b.points - a.points);
      setTopTeams(d.slice(0, 5));
    }).catch(() => {}).finally(() => setLoadingTeams(false));
  }, []);

  useEffect(() => {
    getDocs(query(collection(db, "news"), orderBy("date", "desc"), limit(4)))
      .then(s => setNews(s.docs.map(d => ({ id: d.id, ...d.data() } as News))))
      .catch(() => {}).finally(() => setLoadingNews(false));
  }, []);

  const StatusBadge = ({ m }: { m: Match }) => {
    if (isLive(m)) return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500 text-white animate-live">LIVE</span>;
    if (m.status === "upcoming") return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">Upcoming</span>;
    return <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">Finished</span>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white px-8 py-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">MHCR Football™</h1>
            <p className="text-blue-100 text-base md:text-lg">Everything Football, One Place.</p>
          </div>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        </div>

        {/* Featured Match */}
        {featuredMatch && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm font-semibold"><Tv2 size={16} className="text-blue-600" /> Featured Match</div>
              <StatusBadge m={featuredMatch} />
            </div>
            <div className="px-6 py-5 flex items-center justify-between gap-4">
              <div className="flex flex-col items-center gap-2 flex-1">
                <img src={getLogo(featuredMatch.homeTeam)} alt="" className="w-14 h-14 rounded-full border-2 border-blue-100 object-cover" />
                <span className="font-bold text-sm text-center">{getName(featuredMatch.homeTeam)}</span>
              </div>
              <div className="text-center flex-shrink-0">
                {featuredMatch.status === "upcoming" && !(featuredMatch as any).live
                  ? <><span className="text-2xl font-black text-blue-600">VS</span><p className="text-xs text-gray-400 mt-1">{formatDate(featuredMatch.date)}</p></>
                  : <><span className="text-3xl font-black">{featuredMatch.homeScore} – {featuredMatch.awayScore}</span><p className="text-xs text-gray-400 mt-1">{formatDate(featuredMatch.date)}</p></>
                }
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <img src={getLogo(featuredMatch.awayTeam)} alt="" className="w-14 h-14 rounded-full border-2 border-blue-100 object-cover" />
                <span className="font-bold text-sm text-center">{getName(featuredMatch.awayTeam)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Scoreboard */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm font-semibold">🏟️ Scoreboard</div>
                <Link href="/matches" className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">All Matches <ArrowRight size={12} /></Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {loadingScores ? (
                  [1,2,3].map(i => <div key={i} className="h-16 animate-pulse bg-gray-50 dark:bg-gray-800/50 mx-4 my-2 rounded-xl" />)
                ) : scoreboard.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-400">No matches available</div>
                ) : scoreboard.map(m => (
                  <div key={m.id} className={`px-5 py-3 ${isLive(m) ? "bg-red-50 dark:bg-red-900/10" : ""}`}>
                    <div className="flex items-center">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={getLogo(m.homeTeam)} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{getName(m.homeTeam)}</span>
                      </div>
                      <div className="mx-3 flex-shrink-0">
                        {m.status === "upcoming" && !(m as any).live
                          ? <span className="text-xs text-gray-400">vs</span>
                          : <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg font-black text-sm">{m.homeScore} – {m.awayScore}</span>
                        }
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-sm font-medium truncate">{getName(m.awayTeam)}</span>
                        <img src={getLogo(m.awayTeam)} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-gray-400">{formatDate(m.date)}</span>
                      <StatusBadge m={m} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest News */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm font-semibold"><Newspaper size={15} className="text-blue-600" /> Latest News</div>
                <Link href="/news" className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">All News <ArrowRight size={12} /></Link>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loadingNews ? [1,2].map(i => <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"><div className="aspect-video bg-gray-100 dark:bg-gray-800 animate-pulse" /><div className="p-3 space-y-2"><div className="h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded w-3/4" /><div className="h-3 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" /></div></div>)
                : news.length === 0 ? <p className="col-span-2 py-8 text-center text-sm text-gray-400">No news published yet</p>
                : news.map(a => (
                  <Link key={a.id} href="/news" className="group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-blue-200 hover:shadow-md transition-all block">
                    <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img src={a.image || "https://placehold.co/600x338?text=MHCR+Football"} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-3 space-y-1">
                      <h3 className="font-bold text-sm group-hover:text-blue-600 transition-colors leading-snug">{a.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{a.description?.slice(0, 100)}{a.description?.length > 100 ? "…" : ""}</p>
                      <p className="text-xs text-gray-400">{a.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Top Teams */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm font-semibold"><Trophy size={15} className="text-blue-600" /> Top Teams</div>
                <Link href="/standings" className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">Full Table <ArrowRight size={12} /></Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {loadingTeams ? [1,2,3,4,5].map(i => <div key={i} className="flex items-center gap-3 px-5 py-3"><div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" /><div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" /><div className="w-8 h-4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" /></div>)
                : topTeams.length === 0 ? <p className="py-8 text-center text-sm text-gray-400">No standings available</p>
                : topTeams.map((s, i) => (
                  <div key={s.id} className={`flex items-center gap-3 px-5 py-3 ${i === 0 ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}`}>
                    <span className={`text-xs font-black w-5 text-center flex-shrink-0 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-gray-400"}`}>{i + 1}</span>
                    <span className="flex-1 text-sm font-medium truncate">{getName(s.team)}</span>
                    <span className="text-sm font-bold text-blue-600">{s.points} <span className="text-xs text-gray-400 font-normal">pts</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Card */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-2"><span className="text-2xl">🤖</span><span className="font-bold">AI Assistant</span></div>
              <p className="text-blue-100 text-sm mb-4">Get match predictions, team analysis, and instant football answers.</p>
              <Link href="/ai-assistant">
                <button className="w-full bg-white text-blue-900 font-semibold text-sm py-2.5 rounded-xl hover:bg-blue-50 transition-colors">Chat Now</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
