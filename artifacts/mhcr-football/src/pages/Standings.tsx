import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { collections, Standing, Team } from "@/lib/firestore";
import { getDocs } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Standings() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [standingsSnap, teamsSnap] = await Promise.all([
          getDocs(collections.standings),
          getDocs(collections.teams)
        ]);
        const data = standingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Standing));
        data.sort((a, b) => b.points - a.points);
        setStandings(data);
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

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">League Standings</h1>
      
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-16 text-center">Pos</TableHead>
                <TableHead>Club</TableHead>
                <TableHead className="text-center">MP</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">L</TableHead>
                <TableHead className="text-right font-bold pr-6">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-6 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-6 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-6 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-6 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-6 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : standings.map((standing, i) => (
                <TableRow key={standing.id} className={i < 3 ? "bg-primary/5" : ""}>
                  <TableCell className="text-center font-bold">
                    <span className={
                      i === 0 ? "text-yellow-500" : 
                      i === 1 ? "text-gray-400" : 
                      i === 2 ? "text-amber-700" : "text-muted-foreground"
                    }>{i + 1}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={getTeamLogo(standing.team)} alt="logo" className="w-8 h-8 rounded-full" />
                      <span className="font-semibold">{getTeamName(standing.team)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">{standing.played}</TableCell>
                  <TableCell className="text-center">{standing.won}</TableCell>
                  <TableCell className="text-center">{standing.draw}</TableCell>
                  <TableCell className="text-center">{standing.lost}</TableCell>
                  <TableCell className="text-right font-bold text-lg pr-6">{standing.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </MainLayout>
  );
}
