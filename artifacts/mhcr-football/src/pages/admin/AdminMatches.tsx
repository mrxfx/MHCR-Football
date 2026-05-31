import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { collections, Match, Team } from "@/lib/firestore";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<{
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    status: "upcoming" | "live" | "finished";
    date: string;
  }>({
    homeTeam: "",
    awayTeam: "",
    homeScore: 0,
    awayScore: 0,
    status: "upcoming",
    date: new Date().toISOString().slice(0, 16),
  });

  const fetchData = async () => {
    try {
      const [matchesSnap, teamsSnap] = await Promise.all([
        getDocs(collections.matches),
        getDocs(collections.teams)
      ]);
      setMatches(matchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
      setTeams(teamsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
    } catch (error) {
      console.warn("Firestore read error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMatch?.id) {
        await updateDoc(doc(collections.matches, editingMatch.id), formData);
        toast({ title: "Match updated successfully" });
      } else {
        await addDoc(collections.matches, formData);
        toast({ title: "Match added successfully" });
      }
      setIsOpen(false);
      setEditingMatch(null);
      setFormData({ homeTeam: "", awayTeam: "", homeScore: 0, awayScore: 0, status: "upcoming", date: new Date().toISOString().slice(0, 16) });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this match?")) {
      try {
        await deleteDoc(doc(collections.matches, id));
        toast({ title: "Match deleted successfully" });
        fetchData();
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Matches Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingMatch(null);
              setFormData({ homeTeam: "", awayTeam: "", homeScore: 0, awayScore: 0, status: "upcoming", date: new Date().toISOString().slice(0, 16) });
            }}>Add Match</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMatch ? "Edit Match" : "Add Match"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select value={formData.homeTeam} onValueChange={v => setFormData({ ...formData, homeTeam: v })}>
                <SelectTrigger><SelectValue placeholder="Select Home Team" /></SelectTrigger>
                <SelectContent>
                  {teams.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={formData.awayTeam} onValueChange={v => setFormData({ ...formData, awayTeam: v })}>
                <SelectTrigger><SelectValue placeholder="Select Away Team" /></SelectTrigger>
                <SelectContent>
                  {teams.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex gap-4">
                <Input placeholder="Home Score" type="number" value={formData.homeScore} onChange={e => setFormData({ ...formData, homeScore: Number(e.target.value) })} required />
                <Input placeholder="Away Score" type="number" value={formData.awayScore} onChange={e => setFormData({ ...formData, awayScore: Number(e.target.value) })} required />
              </div>
              <Select value={formData.status} onValueChange={(v: "upcoming"|"live"|"finished") => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
              <Input type="datetime-local" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
              <Button type="submit" className="w-full">{editingMatch ? "Update" : "Add"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map(match => {
              const home = teams.find(t => t.id === match.homeTeam)?.name || "Unknown";
              const away = teams.find(t => t.id === match.awayTeam)?.name || "Unknown";
              return (
                <TableRow key={match.id}>
                  <TableCell>{new Date(match.date).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{home} vs {away}</TableCell>
                  <TableCell>{match.homeScore} - {match.awayScore}</TableCell>
                  <TableCell>
                    <Badge variant={match.status === "live" ? "destructive" : match.status === "finished" ? "secondary" : "default"}>
                      {match.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditingMatch(match);
                      setFormData({ homeTeam: match.homeTeam, awayTeam: match.awayTeam, homeScore: match.homeScore, awayScore: match.awayScore, status: match.status, date: match.date });
                      setIsOpen(true);
                    }}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(match.id!)}>Delete</Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && matches.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">No matches found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
