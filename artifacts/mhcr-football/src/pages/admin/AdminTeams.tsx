import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { collections, Team } from "@/lib/firestore";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    coach: "",
    stadium: "",
    founded: "",
    active: true,
    logo: "",
  });

  const fetchTeams = async () => {
    try {
      const snapshot = await getDocs(collections.teams);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
      setTeams(data);
    } catch (error) {
      console.warn("Firestore read error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam?.id) {
        await updateDoc(doc(collections.teams, editingTeam.id), formData);
        toast({ title: "Team updated successfully" });
      } else {
        await addDoc(collections.teams, formData);
        toast({ title: "Team added successfully" });
      }
      setIsOpen(false);
      setEditingTeam(null);
      setFormData({ name: "", coach: "", stadium: "", founded: "", active: true, logo: "" });
      fetchTeams();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this team?")) {
      try {
        await deleteDoc(doc(collections.teams, id));
        toast({ title: "Team deleted successfully" });
        fetchTeams();
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTeam(null);
              setFormData({ name: "", coach: "", stadium: "", founded: "", active: true, logo: "" });
            }}>Add Team</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Edit Team" : "Add Team"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              <Input placeholder="Coach" value={formData.coach} onChange={e => setFormData({ ...formData, coach: e.target.value })} required />
              <Input placeholder="Stadium" value={formData.stadium} onChange={e => setFormData({ ...formData, stadium: e.target.value })} required />
              <Input placeholder="Founded Year" type="number" value={formData.founded} onChange={e => setFormData({ ...formData, founded: e.target.value })} required />
              <Input placeholder="Logo URL" value={formData.logo} onChange={e => setFormData({ ...formData, logo: e.target.value })} required />
              <Button type="submit" className="w-full">{editingTeam ? "Update" : "Add"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead>Stadium</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map(team => (
              <TableRow key={team.id}>
                <TableCell><img src={team.logo || `https://ui-avatars.com/api/?name=${team.name}`} alt={team.name} className="w-8 h-8 rounded-full" /></TableCell>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.coach}</TableCell>
                <TableCell>{team.stadium}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingTeam(team);
                    setFormData({ name: team.name, coach: team.coach, stadium: team.stadium, founded: team.founded, active: team.active, logo: team.logo });
                    setIsOpen(true);
                  }}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(team.id!)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">No teams found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
