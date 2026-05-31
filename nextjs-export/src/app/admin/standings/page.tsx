"use client";
import { useEffect, useState } from "react";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, Standing, Team } from "@/lib/firestore";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Pencil, Trash2, X } from "lucide-react";

type FormData = { team: string; played: number; won: number; draw: number; lost: number; points: number; };
const emptyForm: FormData = { team: "", played: 0, won: 0, draw: 0, lost: 0, points: 0 };

export default function AdminStandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Standing | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const fetchData = async () => {
    try {
      const [ss, ts] = await Promise.all([getDocs(collections.standings), getDocs(collections.teams)]);
      const data = ss.docs.map(d => ({ id: d.id, ...d.data() } as Standing));
      data.sort((a, b) => b.points - a.points);
      setStandings(data);
      setTeams(ts.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
    } catch(e) { console.warn(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const getName = (id: string) => teams.find(t => t.id === id)?.name || id;
  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (s: Standing) => { setEditing(s); setForm({ team: s.team, played: s.played, won: s.won, draw: s.draw, lost: s.lost, points: s.points }); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing?.id) { await updateDoc(doc(db, "standings", editing.id), form); showToast("Standing updated!"); }
      else { await addDoc(collections.standings, form); showToast("Standing added!"); }
      setOpen(false); fetchData();
    } catch(e: any) { showToast("Error: " + e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try { await deleteDoc(doc(db, "standings", id)); showToast("Deleted!"); fetchData(); }
    catch(e: any) { showToast("Error: " + e.message); }
  };

  const numField = (field: keyof FormData, label: string) => (
    <div key={field}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type="number" min={0} value={form[field] as number} onChange={e => setForm(p => ({ ...p, [field]: +e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <ProtectedRoute>
      <AdminLayout>
        {toast && <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">{toast}</div>}
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Standings</h1><p className="text-sm text-gray-400 mt-1">Manage the league table</p></div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md"><Plus size={16} /> Add Entry</button>
        </div>

        {loading ? <div className="h-48 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700" />
        : (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-semibold"><th className="text-left px-5 py-3 w-8">#</th><th className="text-left px-3 py-3">Team</th><th className="text-center px-3 py-3">P</th><th className="text-center px-3 py-3">W</th><th className="text-center px-3 py-3">D</th><th className="text-center px-3 py-3">L</th><th className="text-center px-3 py-3 text-blue-600">Pts</th><th className="px-3 py-3"></th></tr></thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {standings.length === 0 ? <tr><td colSpan={8} className="py-12 text-center text-gray-400">No standings yet.</td></tr>
                  : standings.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3 text-xs font-black text-gray-400">{i + 1}</td>
                      <td className="px-3 py-3 font-semibold">{getName(s.team)}</td>
                      <td className="text-center px-3 py-3 text-gray-500">{s.played}</td>
                      <td className="text-center px-3 py-3 text-green-600 font-medium">{s.won}</td>
                      <td className="text-center px-3 py-3 text-gray-500">{s.draw}</td>
                      <td className="text-center px-3 py-3 text-red-500">{s.lost}</td>
                      <td className="text-center px-3 py-3 font-black text-blue-600">{s.points}</td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-lg">{editing ? "Edit Standing" : "Add Standing"}</h2>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
                  <select required value={form.team} onChange={e => setForm(p => ({ ...p, team: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {numField("played","Played")}{numField("won","Won")}{numField("draw","Draw")}
                  {numField("lost","Lost")}{numField("points","Points")}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">{saving ? "Saving..." : editing ? "Update" : "Add"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
