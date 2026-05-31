"use client";
import { useEffect, useState } from "react";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, Player, Team } from "@/lib/firestore";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Pencil, Trash2, X } from "lucide-react";

type FormData = { name: string; team: string; position: string; number: string; goals: number; image: string; };
const emptyForm: FormData = { name: "", team: "", position: "", number: "", goals: 0, image: "" };

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const fetchData = async () => {
    try {
      const [ps, ts] = await Promise.all([getDocs(collections.players), getDocs(collections.teams)]);
      setPlayers(ps.docs.map(d => ({ id: d.id, ...d.data() } as Player)));
      setTeams(ts.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
    } catch(e) { console.warn(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const getName = (id: string) => teams.find(t => t.id === id)?.name || id;
  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (p: Player) => { setEditing(p); setForm({ name: p.name, team: p.team, position: p.position, number: p.number, goals: p.goals, image: p.image }); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing?.id) { await updateDoc(doc(db, "players", editing.id), form); showToast("Player updated!"); }
      else { await addDoc(collections.players, form); showToast("Player added!"); }
      setOpen(false); fetchData();
    } catch(e: any) { showToast("Error: " + e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    try { await deleteDoc(doc(db, "players", id)); showToast("Deleted!"); fetchData(); }
    catch(e: any) { showToast("Error: " + e.message); }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        {toast && <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">{toast}</div>}
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Players</h1><p className="text-sm text-gray-400 mt-1">Manage all players</p></div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md"><Plus size={16} /> Add Player</button>
        </div>

        {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700" />)}</div>
        : players.length === 0 ? <div className="py-20 text-center text-gray-400">No players yet.</div>
        : (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-semibold"><th className="text-left px-5 py-3">Player</th><th className="text-left px-3 py-3 hidden sm:table-cell">Team</th><th className="text-left px-3 py-3 hidden md:table-cell">Position</th><th className="text-center px-3 py-3">⚽</th><th className="px-3 py-3"></th></tr></thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {players.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=2563eb&color=fff&bold=true`} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500 hidden sm:table-cell">{getName(p.team)}</td>
                    <td className="px-3 py-3 text-gray-500 hidden md:table-cell">{p.position}</td>
                    <td className="px-3 py-3 text-center font-bold">{p.goals}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-lg">{editing ? "Edit Player" : "Add Player"}</h2>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {[["name","Name","text",true],["position","Position","text",false],["number","Jersey Number","text",false],["image","Photo URL","url",false]].map(([f, l, t, r]) => (
                  <div key={f as string}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{l as string}</label>
                    <input type={t as string} required={!!r} value={(form as any)[f as string]} onChange={e => setForm(p => ({ ...p, [f as string]: e.target.value }))}
                      className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
                  <select value={form.team} onChange={e => setForm(p => ({ ...p, team: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goals</label>
                  <input type="number" min={0} value={form.goals} onChange={e => setForm(p => ({ ...p, goals: +e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">{saving ? "Saving..." : editing ? "Update" : "Add Player"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
