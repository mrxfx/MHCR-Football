"use client";
import { useEffect, useState } from "react";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, Team } from "@/lib/firestore";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { teamAvatar } from "@/lib/utils";

const emptyForm = { name: "", coach: "", stadium: "", founded: "", active: true, logo: "" };

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const fetchTeams = async () => {
    try {
      const s = await getDocs(collections.teams);
      setTeams(s.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
    } catch (e) { console.warn(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTeams(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (t: Team) => { setEditing(t); setForm({ name: t.name, coach: t.coach, stadium: t.stadium, founded: t.founded, active: t.active, logo: t.logo }); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing?.id) { await updateDoc(doc(db, "teams", editing.id), form); showToast("Team updated!"); }
      else { await addDoc(collections.teams, form); showToast("Team added!"); }
      setOpen(false); fetchTeams();
    } catch (e: any) { showToast("Error: " + e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    try { await deleteDoc(doc(db, "teams", id)); showToast("Deleted!"); fetchTeams(); }
    catch (e: any) { showToast("Error: " + e.message); }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        {toast && <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">{toast}</div>}
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1><p className="text-sm text-gray-400 mt-1">Manage all teams</p></div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md">
            <Plus size={16} /> Add Team
          </button>
        </div>

        {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700" />)}</div>
        : teams.length === 0 ? <div className="py-20 text-center text-gray-400">No teams yet. Add your first team!</div>
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(t => (
              <div key={t.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <img src={teamAvatar(t.name, t.logo)} alt={t.name} className="w-14 h-14 rounded-full border-2 border-gray-100 dark:border-gray-700 object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{t.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{t.coach || "—"}</p>
                  <p className="text-xs text-gray-400">{t.stadium || "—"}</p>
                  <p className="text-xs text-gray-400">{t.founded ? `Est. ${t.founded}` : ""}</p>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(t)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(t.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-lg">{editing ? "Edit Team" : "Add Team"}</h2>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {[["name","Team Name","text",true],["coach","Coach","text",false],["stadium","Stadium","text",false],["founded","Founded Year","text",false],["logo","Logo URL","url",false]].map(([field, label, type, req]) => (
                  <div key={field as string}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label as string}</label>
                    <input type={type as string} required={!!req} value={(form as any)[field as string]} onChange={e => setForm(p => ({ ...p, [field as string]: e.target.value }))}
                      className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                    {saving ? "Saving..." : editing ? "Update" : "Add Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
