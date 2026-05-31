import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { collections, Team } from "@/lib/firestore";
import { getDocs } from "firebase/firestore";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const snap = await getDocs(collections.teams);
        setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
      } catch (error) {
        console.warn("Firestore read error (check Security Rules):", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">Teams</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-col items-center">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="h-6 w-32 mt-4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : teams.map(team => (
          <Card key={team.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-col items-center text-center pb-2">
              <img src={team.logo || `https://ui-avatars.com/api/?name=${team.name}`} alt={team.name} className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-background shadow-md" />
              <h3 className="font-bold text-xl">{team.name}</h3>
            </CardHeader>
            <CardContent className="flex-1 text-center text-sm text-muted-foreground">
              <p>Coach: <span className="font-medium text-foreground">{team.coach}</span></p>
              <p>Stadium: <span className="font-medium text-foreground">{team.stadium}</span></p>
            </CardContent>
            <CardFooter>
              <Link href={`/teams/${team.id}`} className="w-full">
                <Button variant="outline" className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
}
