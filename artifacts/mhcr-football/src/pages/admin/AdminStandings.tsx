import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { collections, Standing, Team } from "@/lib/firestore";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminStandings() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingStanding, setEditingStanding] = useState<Standing | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    team: "",
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    points: 0,
  });

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
      if (editingStanding?.id) {
        await updateDoc(doc(collections.standings, editingStanding.id), formData);
        toast({ title: "Standing updated successfully" });
      } else {
        await addDoc(collections.standings, formData);
        toast({ title: "Standing added successfully" });
      }
      setIsOpen(false);
      setEditingStanding(null);
      setFormData({ team: "", played: 0, won: 0, draw: 0, lost: 0, points: 0 });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this standing?")) {
      try {
        await deleteDoc(doc(collections.standings, id));
        toast({ title: "Standing deleted successfully" });
        fetchData();
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Standings Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingStanding(null);
              setFormData({ team: "", played: 0, won: 0, draw: 0, lost: 0, points: 0 });
            }}>Add Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStanding ? "Edit Standing" : "Add Standing"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select value={formData.team} onValueChange={v => setFormData({ ...formData, team: v })}>
                <SelectTrigger><SelectValue placeholder="Select Team" /></SelectTrigger>
                <SelectContent>
                  {teams.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Played" type="number" value={formData.played} onChange={e => setFormData({ ...formData, played: Number(e.target.value) })} required />
                <Input placeholder="Won" type="number" value={formData.won} onChange={e => setFormData({ ...formData, won: Number(e.target.value) })} required />
                <Input placeholder="Draw" type="number" value={formData.draw} onChange={e => setFormData({ ...formData, draw: Number(e.target.value) })} required />
                <Input placeholder="Lost" type="number" value={formData.lost} onChange={e => setFormData({ ...formData, lost: Number(e.target.value) })} required />
              </div>
              <Input placeholder="Points" type="number" value={formData.points} onChange={e => setFormData({ ...formData, points: Number(e.target.value) })} required />
              <Button type="submit" className="w-full">{editingStanding ? "Update" : "Add"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pos</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>P</TableHead>
              <TableHead>W</TableHead>
              <TableHead>D</TableHead>
              <TableHead>L</TableHead>
              <TableHead>Pts</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((standing, i) => {
              const teamName = teams.find(t => t.id === standing.team)?.name || "Unknown";
              return (
                <TableRow key={standing.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{teamName}</TableCell>
                  <TableCell>{standing.played}</TableCell>
                  <TableCell>{standing.won}</TableCell>
                  <TableCell>{standing.draw}</TableCell>
                  <TableCell>{standing.lost}</TableCell>
                  <TableCell className="font-bold text-primary">{standing.points}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditingStanding(standing);
                      setFormData({ team: standing.team, played: standing.played, won: standing.won, draw: standing.draw, lost: standing.lost, points: standing.points });
                      setIsOpen(true);
                    }}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(standing.id!)}>Delete</Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && standings.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">No standings found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
