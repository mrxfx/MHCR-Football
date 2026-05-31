import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { collections, Match, Team } from "@/lib/firestore";
import { getDocs, query, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesSnap, teamsSnap] = await Promise.all([
          getDocs(query(collections.matches, orderBy("date", "desc"))),
          getDocs(collections.teams)
        ]);
        setMatches(matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
        setTeams(teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
      } catch (error) {
        console.warn("Firestore read error (check Security Rules):", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || "Unknown";
  const getTeamLogo = (id: string) => teams.find(t => t.id === id)?.logo || `https://ui-avatars.com/api/?name=${getTeamName(id)}`;

  const MatchCard = ({ match }: { match: Match }) => (
    <Card className="hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary to-blue-400"></div>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-muted-foreground font-medium">
            {new Date(match.date).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <Badge 
            variant={match.status === "live" ? "destructive" : match.status === "finished" ? "secondary" : "default"}
            className={match.status === "live" ? "animate-pulse" : ""}
          >
            {match.status.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center gap-2 flex-1">
            <img src={getTeamLogo(match.homeTeam)} alt={getTeamName(match.homeTeam)} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
            <span className="font-bold text-center text-sm sm:text-base">{getTeamName(match.homeTeam)}</span>
          </div>
          
          <div className="px-4 text-center">
            {match.status === "upcoming" ? (
              <div className="text-2xl font-black text-muted-foreground bg-muted px-4 py-2 rounded-lg">VS</div>
            ) : (
              <div className="text-3xl sm:text-4xl font-black flex items-center gap-3 bg-accent px-4 py-2 rounded-xl">
                <span>{match.homeScore}</span>
                <span className="text-muted-foreground text-xl">-</span>
                <span>{match.awayScore}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-2 flex-1">
            <img src={getTeamLogo(match.awayTeam)} alt={getTeamName(match.awayTeam)} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
            <span className="font-bold text-center text-sm sm:text-base">{getTeamName(match.awayTeam)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Matches</h1>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="live" className="data-[state=active]:text-destructive">Live</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="finished">Finished</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {loading ? <LoadingMatches /> : matches.map(m => <MatchCard key={m.id} match={m} />)}
        </TabsContent>
        <TabsContent value="live" className="space-y-4">
          {matches.filter(m => m.status === "live").map(m => <MatchCard key={m.id} match={m} />)}
          {!loading && matches.filter(m => m.status === "live").length === 0 && <EmptyState msg="No live matches right now." />}
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          {matches.filter(m => m.status === "upcoming").map(m => <MatchCard key={m.id} match={m} />)}
          {!loading && matches.filter(m => m.status === "upcoming").length === 0 && <EmptyState msg="No upcoming matches scheduled." />}
        </TabsContent>
        <TabsContent value="finished" className="space-y-4">
          {matches.filter(m => m.status === "finished").map(m => <MatchCard key={m.id} match={m} />)}
          {!loading && matches.filter(m => m.status === "finished").length === 0 && <EmptyState msg="No finished matches yet." />}
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}

const LoadingMatches = () => (
  <>
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="flex justify-between items-center">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="w-24 h-12" />
            <Skeleton className="w-20 h-20 rounded-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </>
);

const EmptyState = ({ msg }: { msg: string }) => (
  <div className="text-center py-12 bg-card rounded-xl border border-dashed">
    <p className="text-muted-foreground">{msg}</p>
  </div>
);
