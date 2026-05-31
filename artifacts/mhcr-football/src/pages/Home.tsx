import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { collections, Match, Team, News as NewsType, Standing } from "@/lib/firestore";
import { getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Home() {
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [latestScores, setLatestScores] = useState<Match[]>([]);
  const [topTeams, setTopTeams] = useState<Standing[]>([]);
  const [news, setNews] = useState<NewsType[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsSnap = await getDocs(collections.teams);
        const allTeams = teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
        setTeams(allTeams);

        const matchesSnap = await getDocs(query(collections.matches, orderBy("date", "desc"), limit(10)));
        const allMatches = matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
        const liveOrUpcoming = allMatches.find(m => m.status === "live" || m.status === "upcoming");
        setFeaturedMatch(liveOrUpcoming || allMatches[0] || null);
        setLatestScores(allMatches.filter(m => m.status === "finished").slice(0, 5));

        const standingsSnap = await getDocs(collections.standings);
        const allStandings = standingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Standing));
        allStandings.sort((a, b) => b.points - a.points);
        setTopTeams(allStandings.slice(0, 4));

        const newsSnap = await getDocs(query(collections.news, orderBy("date", "desc"), limit(4)));
        setNews(newsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsType)));
      } catch (error) {
        console.warn("Firestore read error (check Security Rules):", error);
      }
    };
    fetchData();
  }, []);

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || "Unknown Team";
  const getTeamLogo = (id: string) => teams.find(t => t.id === id)?.logo || `https://ui-avatars.com/api/?name=${getTeamName(id)}`;

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-600 text-white p-12 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">MHCR Football™</h1>
            <p className="text-xl md:text-2xl text-blue-100">Everything Football, One Place.</p>
          </div>
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {featuredMatch && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Featured Match</span>
                    <Badge variant={featuredMatch.status === "live" ? "destructive" : "default"}>{featuredMatch.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-center gap-2">
                      <img src={getTeamLogo(featuredMatch.homeTeam)} alt={getTeamName(featuredMatch.homeTeam)} className="w-16 h-16 rounded-full" />
                      <span className="font-bold">{getTeamName(featuredMatch.homeTeam)}</span>
                    </div>
                    <div className="text-3xl font-bold">
                      {featuredMatch.status === "upcoming" ? "VS" : `${featuredMatch.homeScore} - ${featuredMatch.awayScore}`}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img src={getTeamLogo(featuredMatch.awayTeam)} alt={getTeamName(featuredMatch.awayTeam)} className="w-16 h-16 rounded-full" />
                      <span className="font-bold">{getTeamName(featuredMatch.awayTeam)}</span>
                    </div>
                  </div>
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    {new Date(featuredMatch.date).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Latest News</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {news.map(article => (
                  <div key={article.id} className="group cursor-pointer">
                    <div className="aspect-video rounded-md overflow-hidden mb-2">
                      <img src={article.image || "https://placehold.co/600x400"} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h3 className="font-bold group-hover:text-primary transition-colors">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Teams</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topTeams.map((standing, i) => (
                  <div key={standing.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-muted-foreground w-4">{i + 1}</span>
                      <img src={getTeamLogo(standing.team)} alt={getTeamName(standing.team)} className="w-8 h-8 rounded-full" />
                      <span className="font-medium">{getTeamName(standing.team)}</span>
                    </div>
                    <span className="font-bold">{standing.points} pts</span>
                  </div>
                ))}
                <Link href="/standings">
                  <Button variant="outline" className="w-full mt-4">View Full Table</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
              <CardHeader>
                <CardTitle className="text-blue-100 flex items-center gap-2">
                  <span className="text-2xl">🤖</span> AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-100 mb-4 text-sm">Get match predictions, team analysis, and instant football answers.</p>
                <Link href="/ai-assistant">
                  <Button variant="secondary" className="w-full">Chat Now</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
