import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { collections, Match, Team, News as NewsType, Standing } from "@/lib/firestore";
import { getDocs, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Link } from "wouter";
import { ArrowRight, Trophy, Newspaper, Tv2 } from "lucide-react";

export default function Home() {
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [scoreboard, setScoreboard] = useState<Match[]>([]);
  const [topTeams, setTopTeams] = useState<Standing[]>([]);
  const [news, setNews] = useState<NewsType[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || id;
  const getTeamLogo = (id: string) => {
    const team = teams.find(t => t.id === id);
    return team?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(getTeamName(id))}&background=2563eb&color=fff&bold=true`;
  };

  // Load teams once
  useEffect(() => {
    getDocs(collections.teams)
      .then(snap => {
        setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
      })
      .catch(err => console.warn("Teams fetch error:", err));
  }, []);

  // Real-time scoreboard via onSnapshot
  useEffect(() => {
    setLoadingScores(true);
    const q = query(collections.matches, orderBy("date", "desc"), limit(5));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
        const featured = all.find(m => (m as any).live === true || m.status === "live") ||
                         all.find(m => m.status === "upcoming") ||
                         all[0] || null;
        setFeaturedMatch(featured);
        setScoreboard(all);
        setLoadingScores(false);
      },
      (err) => {
        console.warn("Scoreboard snapshot error:", err);
        setLoadingScores(false);
      }
    );
    return () => unsub();
  }, []);

  // Top teams (standings)
  useEffect(() => {
    setLoadingTeams(true);
    getDocs(collections.standings)
      .then(snap => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Standing));
        data.sort((a, b) => b.points - a.points);
        setTopTeams(data.slice(0, 5));
      })
      .catch(err => console.warn("Standings fetch error:", err))
      .finally(() => setLoadingTeams(false));
  }, []);

  // Latest news
  useEffect(() => {
    setLoadingNews(true);
    getDocs(query(collections.news, orderBy("date", "desc"), limit(4)))
      .then(snap => setNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsType))))
      .catch(err => console.warn("News fetch error:", err))
      .finally(() => setLoadingNews(false));
  }, []);

  const isLive = (m: Match) => (m as any).live === true || m.status === "live";

  const statusBadge = (m: Match) => {
    if (isLive(m)) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">LIVE</span>;
    if (m.status === "upcoming") return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">Upcoming</span>;
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Finished</span>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* Hero Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white px-8 py-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">MHCR Football™</h1>
            <p className="text-blue-100 text-base md:text-lg">Everything Football, One Place.</p>
          </div>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full" />
        </div>

        {/* Featured Match */}
        {featuredMatch && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Tv2 size={16} className="text-primary" /> Featured Match
              </div>
              {statusBadge(featuredMatch)}
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <img src={getTeamLogo(featuredMatch.homeTeam)} alt="" className="w-14 h-14 rounded-full border-2 border-primary/20 object-cover" />
                  <span className="font-bold text-sm text-center leading-tight">{getTeamName(featuredMatch.homeTeam)}</span>
                </div>
                <div className="text-center flex-shrink-0">
                  {featuredMatch.status === "upcoming" && !(featuredMatch as any).live ? (
                    <div>
                      <span className="text-2xl font-black text-primary">VS</span>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(featuredMatch.date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{new Date(featuredMatch.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-black">{featuredMatch.homeScore} – {featuredMatch.awayScore}</span>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(featuredMatch.date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <img src={getTeamLogo(featuredMatch.awayTeam)} alt="" className="w-14 h-14 rounded-full border-2 border-primary/20 object-cover" />
                  <span className="font-bold text-sm text-center leading-tight">{getTeamName(featuredMatch.awayTeam)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Scoreboard */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-base">🏟️</span> Scoreboard
                </div>
                <Link href="/matches">
                  <button className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                    All Matches <ArrowRight size={12} />
                  </button>
                </Link>
              </div>
              <div className="divide-y divide-border">
                {loadingScores ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-16 h-6 bg-muted animate-pulse rounded-lg mx-4" />
                      <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
                    </div>
                  ))
                ) : scoreboard.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No matches available</div>
                ) : (
                  scoreboard.map((match) => (
                    <div key={match.id} className={`px-5 py-3 hover:bg-accent/30 transition-colors ${isLive(match) ? "bg-red-50/50 dark:bg-red-900/10" : ""}`}>
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <img src={getTeamLogo(match.homeTeam)} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{getTeamName(match.homeTeam)}</span>
                        </div>
                        <div className="mx-3 text-center flex-shrink-0">
                          {match.status === "upcoming" && !(match as any).live ? (
                            <span className="text-xs text-muted-foreground font-medium">vs</span>
                          ) : (
                            <span className="font-black text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg">
                              {match.homeScore} – {match.awayScore}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                          <span className="text-sm font-medium truncate">{getTeamName(match.awayTeam)}</span>
                          <img src={getTeamLogo(match.awayTeam)} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 px-0.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(match.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {statusBadge(match)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Latest News */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Newspaper size={15} className="text-primary" /> Latest News
                </div>
                <Link href="/news">
                  <button className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                    All News <ArrowRight size={12} />
                  </button>
                </Link>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loadingNews ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden border border-border">
                      <div className="aspect-video bg-muted animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-3 bg-muted animate-pulse rounded w-full" />
                        <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                      </div>
                    </div>
                  ))
                ) : news.length === 0 ? (
                  <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">No news published yet</p>
                ) : (
                  news.map(article => (
                    <Link key={article.id} href="/news">
                      <div className="group cursor-pointer rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-md transition-all">
                        <div className="aspect-video overflow-hidden bg-muted">
                          <img
                            src={article.image || "https://placehold.co/600x338?text=MHCR+Football"}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3 space-y-1">
                          <h3 className="font-bold text-sm group-hover:text-primary transition-colors leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {article.description?.slice(0, 100)}{article.description?.length > 100 ? "…" : ""}
                          </p>
                          <p className="text-xs text-muted-foreground/60 pt-0.5">{article.date}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* 2. Top Teams */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Trophy size={15} className="text-primary" /> Top Teams
                </div>
                <Link href="/standings">
                  <button className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                    Full Table <ArrowRight size={12} />
                  </button>
                </Link>
              </div>
              <div className="divide-y divide-border">
                {loadingTeams ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-5 h-4 bg-muted animate-pulse rounded" />
                      <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-10 h-4 bg-muted animate-pulse rounded" />
                    </div>
                  ))
                ) : topTeams.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No standings available</p>
                ) : (
                  topTeams.map((standing, i) => (
                    <div key={standing.id} className={`flex items-center gap-3 px-5 py-3 ${i === 0 ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}`}>
                      <span className={`text-xs font-black w-5 text-center flex-shrink-0 ${
                        i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"
                      }`}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium truncate">{getTeamName(standing.team)}</span>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{standing.points}</span>
                        <span className="text-xs text-muted-foreground ml-1">pts</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4. AI Assistant */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🤖</span>
                <span className="font-bold">AI Assistant</span>
              </div>
              <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                Get match predictions, team analysis, and instant football answers.
              </p>
              <Link href="/ai-assistant">
                <button className="w-full bg-white text-blue-900 font-semibold text-sm py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                  Chat Now
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
