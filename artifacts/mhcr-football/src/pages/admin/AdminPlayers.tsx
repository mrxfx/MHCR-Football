import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { collections, Player, Team } from "@/lib/firestore";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    team: "",
    position: "",
    number: "",
    goals: 0,
    image: "",
  });

  const fetchData = async () => {
    try {
      const [playersSnap, teamsSnap] = await Promise.all([
        getDocs(collections.players),
        getDocs(collections.teams)
      ]);
      setPlayers(playersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player)));
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
      if (editingPlayer?.id) {
        await updateDoc(doc(collections.players, editingPlayer.id), formData);
        toast({ title: "Player updated successfully" });
      } else {
        await addDoc(collections.players, formData);
        toast({ title: "Player added successfully" });
      }
      setIsOpen(false);
      setEditingPlayer(null);
      setFormData({ name: "", team: "", position: "", number: "", goals: 0, image: "" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this player?")) {
      try {
        await deleteDoc(doc(collections.players, id));
        toast({ title: "Player deleted successfully" });
        fetchData();
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Players Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPlayer(null);
              setFormData({ name: "", team: "", position: "", number: "", goals: 0, image: "" });
            }}>Add Player</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlayer ? "Edit Player" : "Add Player"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              <Select value={formData.team} onValueChange={v => setFormData({ ...formData, team: v })}>
                <SelectTrigger><SelectValue placeholder="Select Team" /></SelectTrigger>
                <SelectContent>
                  {teams.map(t => <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Position" value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} required />
              <Input placeholder="Jersey Number" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} required />
              <Input placeholder="Goals" type="number" value={formData.goals} onChange={e => setFormData({ ...formData, goals: Number(e.target.value) })} required />
              <Input placeholder="Image URL" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} required />
              <Button type="submit" className="w-full">{editingPlayer ? "Update" : "Add"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Goals</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map(player => {
              const teamName = teams.find(t => t.id === player.team)?.name || "Unknown";
              return (
                <TableRow key={player.id}>
                  <TableCell><img src={player.image || `https://ui-avatars.com/api/?name=${player.name}`} alt={player.name} className="w-8 h-8 rounded-full" /></TableCell>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell>{teamName}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>#{player.number}</TableCell>
                  <TableCell>{player.goals}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditingPlayer(player);
                      setFormData({ name: player.name, team: player.team, position: player.position, number: player.number, goals: player.goals, image: player.image });
                      setIsOpen(true);
                    }}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(player.id!)}>Delete</Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!loading && players.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">No players found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
