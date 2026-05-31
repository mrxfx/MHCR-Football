import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { collections, Player, Team, Standing } from "@/lib/firestore";
import { getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "wouter";

export default function TeamDetail() {
  const params = useParams();
  const id = params.id;
  
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<Standing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        const teamDoc = await getDoc(doc(collections.teams, id));
        if (teamDoc.exists()) {
          setTeam({ id: teamDoc.id, ...teamDoc.data() } as Team);
        }

        const playersSnap = await getDocs(query(collections.players, where("team", "==", id)));
        setPlayers(playersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Player)));

        const standingsSnap = await getDocs(query(collections.standings, where("team", "==", id)));
        if (!standingsSnap.empty) {
          setStats({ id: standingsSnap.docs[0].id, ...standingsSnap.docs[0].data() } as Standing);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <Skeleton className="h-64 w-full rounded-xl mb-8" />
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout>
        <div className="text-center py-20 text-muted-foreground text-xl">Team not found</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="relative rounded-2xl bg-gradient-to-r from-primary/80 to-primary text-white p-8 md:p-12 shadow-xl mb-12 overflow-hidden">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white p-2 shadow-2xl flex-shrink-0">
            <img src={team.logo || `https://ui-avatars.com/api/?name=${team.name}`} alt={team.name} className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="text-center md:text-left pt-4">
            <h1 className="text-4xl md:text-6xl font-black mb-2">{team.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-primary-foreground/80 text-lg">
              <span className="bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">{team.stadium}</span>
              <span className="bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">Est. {team.founded}</span>
              <span className="bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">Manager: {team.coach}</span>
            </div>
          </div>
        </div>
      </div>

      {stats && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Season Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="text-4xl font-black text-primary mb-1">{stats.played}</div>
                <div className="text-sm text-muted-foreground uppercase font-semibold">Played</div>
              </CardContent>
            </Card>
            <Card className="bg-card text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="text-4xl font-black text-green-500 mb-1">{stats.won}</div>
                <div className="text-sm text-muted-foreground uppercase font-semibold">Won</div>
              </CardContent>
            </Card>
            <Card className="bg-card text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="text-4xl font-black text-destructive mb-1">{stats.lost}</div>
                <div className="text-sm text-muted-foreground uppercase font-semibold">Lost</div>
              </CardContent>
            </Card>
            <Card className="bg-primary text-primary-foreground text-center border-0 shadow-md">
              <CardContent className="p-6">
                <div className="text-4xl font-black mb-1">{stats.points}</div>
                <div className="text-sm text-primary-foreground/80 uppercase font-semibold">Points</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6">First Team Squad</h2>
        {players.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {players.map(player => (
              <Card key={player.id} className="overflow-hidden border-0 shadow-md bg-card">
                <div className="aspect-[3/4] relative bg-muted">
                  <img src={player.image || `https://ui-avatars.com/api/?name=${player.name}`} alt={player.name} className="w-full h-full object-cover" />
                  <div className="absolute top-0 right-0 bg-primary text-white font-black text-xl w-12 h-12 flex items-center justify-center rounded-bl-xl shadow-md">
                    {player.number}
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black to-transparent p-4 pt-12 text-white">
                    <div className="font-bold text-lg leading-tight">{player.name}</div>
                    <div className="text-sm text-white/80">{player.position}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
            <p className="text-muted-foreground">No players registered for this team yet.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
