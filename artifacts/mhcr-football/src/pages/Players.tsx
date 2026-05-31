import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { collections, Player, Team } from "@/lib/firestore";
import { getDocs, query, where } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersSnap, teamsSnap] = await Promise.all([
          getDocs(collections.players),
          getDocs(collections.teams)
        ]);
        setPlayers(playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
        setTeams(teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
      } catch (error) {
        console.warn("Firestore read error (check Security Rules):", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === "all" || p.team === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || "Unknown";

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Players</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map(t => (
                <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => (
            <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-square relative bg-muted flex items-end justify-center">
                <img 
                  src={player.image || `https://ui-avatars.com/api/?name=${player.name}&size=256`} 
                  alt={player.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md font-bold text-sm">
                  #{player.number}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <h3 className="font-bold text-lg leading-tight">{player.name}</h3>
                  <p className="text-sm opacity-90">{getTeamName(player.team)}</p>
                </div>
              </div>
              <CardContent className="p-4 grid grid-cols-2 gap-2 text-sm text-center bg-card">
                <div className="bg-muted rounded p-2">
                  <div className="text-muted-foreground text-xs uppercase font-semibold">Position</div>
                  <div className="font-medium">{player.position}</div>
                </div>
                <div className="bg-muted rounded p-2">
                  <div className="text-muted-foreground text-xs uppercase font-semibold">Goals</div>
                  <div className="font-medium">{player.goals}</div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No players found matching your criteria.
          </div>
        )}
      </div>
    </MainLayout>
  );
}
