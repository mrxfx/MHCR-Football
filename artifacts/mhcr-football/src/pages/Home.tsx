import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { collections, Match, Team, News as NewsType, Standing } from "@/lib/firestore";
import { getDocs, query, orderBy, limit } from "firebase/firestore";
import { Link } from "wouter";
import { ArrowRight, Trophy, Newspaper, Tv2 } from "lucide-react";

export default function Home() {
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [latestScores, setLatestScores] = useState<Match[]>([]);
  const [topTeams, setTopTeams] = useState<Standing[]>([]);
  const [news, setNews] = useState<NewsType[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsSnap = await getDocs(collections.teams);
        const allTeams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
        setTeams(allTeams);

        const matchesSnap = await getDocs(query(collections.matches, orderBy("date", "desc"), limit(10)));
        const allMatches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
        const featured = allMatches.find(m => m.status === "live") ||
                         allMatches.find(m => m.status === "upcoming") ||
                         allMatches[0] || null;
        setFeaturedMatch(featured);
        setLatestScores(allMatches.filter(m => m.status === "finished").slice(0, 5));

        const standingsSnap = await getDocs(collections.standings);
        const allStandings = standingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Standing));
        allStandings.sort((a, b) => b.points - a.points);
        setTopTeams(allStandings.slice(0, 5));

        const newsSnap = await getDocs(query(collections.news, orderBy("date", "desc"), limit(4)));
        setNews(newsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsType)));
      } catch (error) {
        console.warn("Firestore read error (check Security Rules):", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || id;
  const getTeamLogo = (id: string) => {
    const team = teams.find(t => t.id === id);
    return team?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(getTeamName(id))}&background=2563eb&color=fff&bold=true`;
  };

  const statusColor = (status: string) => {
    if (status === "live") return "bg-red-500 text-white animate-pulse";
    if (status === "upcoming") return "bg-blue-500 text-white";
    return "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
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
        {(featuredMatch || loading) && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Tv2 size={16} className="text-primary" />
                Featured Match
              </div>
              {featuredMatch && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor(featuredMatch.status)}`}>
                  {featuredMatch.status}
                </span>
              )}
            </div>
            {loading ? (
              <div className="h-28 animate-pulse bg-muted/40" />
            ) : featuredMatch ? (
              <div className="px-6 py-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <img src={getTeamLogo(featuredMatch.homeTeam)} alt="" className="w-14 h-14 rounded-full border-2 border-primary/20 object-cover" />
                    <span className="font-bold text-sm text-center leading-tight">{getTeamName(featuredMatch.homeTeam)}</span>
                  </div>
                  <div className="text-center flex-shrink-0">
                    {featuredMatch.status === "upcoming" ? (
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
            ) : null}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Scoreboard */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-lg">🏟️</span> Scoreboard
                </div>
                <Link href="/matches">
                  <button className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                    All Matches <ArrowRight size={12} />
                  </button>
                </Link>
              </div>
              <div className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse bg-muted/30 mx-4 my-2 rounded-lg" />
                  ))
                ) : latestScores.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No recent scores yet</div>
                ) : (
                  latestScores.map((match) => (
                    <div key={match.id} className="flex items-center px-5 py-3 hover:bg-accent/30 transition-colors">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={getTeamLogo(match.homeTeam)} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{getTeamName(match.homeTeam)}</span>
                      </div>
                      <div className="mx-4 text-center flex-shrink-0">
                        <span className="font-black text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg">
                          {match.homeScore} – {match.awayScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-sm font-medium truncate">{getTeamName(match.awayTeam)}</span>
                        <img src={getTeamLogo(match.awayTeam)} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Latest News */}
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
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden">
                      <div className="aspect-video bg-muted animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-3 bg-muted animate-pulse rounded w-full" />
                      </div>
                    </div>
                  ))
                ) : news.length === 0 ? (
                  <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">No news published yet</p>
                ) : (
                  news.map(article => (
                    <Link key={article.id} href="/news">
                      <div className="group cursor-pointer rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all">
                        <div className="aspect-video overflow-hidden bg-muted">
                          <img
                            src={article.image || "https://placehold.co/600x338?text=MHCR+Football"}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{article.date}</p>
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

            {/* Top Teams */}
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
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                      <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
                      <div className="w-8 h-4 bg-muted animate-pulse rounded" />
                    </div>
                  ))
                ) : topTeams.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No standings yet</p>
                ) : (
                  topTeams.map((standing, i) => (
                    <div key={standing.id} className={`flex items-center gap-3 px-5 py-3 ${i === 0 ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}`}>
                      <span className={`text-xs font-bold w-5 text-center ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <img src={getTeamLogo(standing.team)} alt="" className="w-8 h-8 rounded-full border border-border" />
                      <span className="flex-1 text-sm font-medium truncate">{getTeamName(standing.team)}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-primary">{standing.points}</span>
                        <span className="text-xs text-muted-foreground ml-1">pts</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Assistant Card */}
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
