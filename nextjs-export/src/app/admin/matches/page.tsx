"use client";
import { useEffect, useState } from "react";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, Match, Team } from "@/lib/firestore";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

type FormData = { homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; status: "upcoming"|"live"|"finished"; live: boolean; date: string; };
const emptyForm: FormData = { homeTeam: "", awayTeam: "", homeScore: 0, awayScore: 0, status: "upcoming", live: false, date: new Date().toISOString().slice(0,16) };

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const fetch = async () => {
    try {
      const [ms, ts] = await Promise.all([getDocs(collections.matches), getDocs(collections.teams)]);
      setMatches(ms.docs.map(d => ({ id: d.id, ...d.data() } as Match)));
      setTeams(ts.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
    } catch(e) { console.warn(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const getName = (id: string) => teams.find(t => t.id === id)?.name || id;

  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (m: Match) => { setEditing(m); setForm({ homeTeam: m.homeTeam, awayTeam: m.awayTeam, homeScore: m.homeScore, awayScore: m.awayScore, status: m.status, live: (m as any).live || false, date: m.date }); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing?.id) { await updateDoc(doc(db, "matches", editing.id), form); showToast("Match updated!"); }
      else { await addDoc(collections.matches, form); showToast("Match created!"); }
      setOpen(false); fetch();
    } catch(e: any) { showToast("Error: " + e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    try { await deleteDoc(doc(db, "matches", id)); showToast("Deleted!"); fetch(); }
    catch(e: any) { showToast("Error: " + e.message); }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        {toast && <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">{toast}</div>}
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Matches</h1><p className="text-sm text-gray-400 mt-1">Manage fixtures and scores</p></div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md"><Plus size={16} /> Create Match</button>
        </div>

        {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700" />)}</div>
        : matches.length === 0 ? <div className="py-20 text-center text-gray-400">No matches yet.</div>
        : (
          <div className="space-y-3">
            {matches.map(m => (
              <div key={m.id} className={`bg-white dark:bg-gray-800 border rounded-2xl p-4 shadow-sm flex items-center gap-4 ${(m as any).live || m.status === "live" ? "border-red-200 dark:border-red-800" : "border-gray-100 dark:border-gray-700"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {(m as any).live || m.status === "live" ? <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">LIVE</span>
                    : <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${m.status === "upcoming" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{m.status}</span>}
                    <span className="text-xs text-gray-400">{formatDate(m.date)}</span>
                  </div>
                  <p className="text-sm font-bold">{getName(m.homeTeam)} <span className="text-blue-600 mx-2">{m.status !== "upcoming" ? `${m.homeScore} – ${m.awayScore}` : "vs"}</span> {getName(m.awayTeam)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(m)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(m.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="font-bold text-lg">{editing ? "Edit Match" : "Create Match"}</h2>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Team</label>
                    <select required value={form.homeTeam} onChange={e => setForm(p => ({ ...p, homeTeam: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Away Team</label>
                    <select required value={form.awayTeam} onChange={e => setForm(p => ({ ...p, awayTeam: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Score</label>
                    <input type="number" min={0} value={form.homeScore} onChange={e => setForm(p => ({ ...p, homeScore: +e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Away Score</label>
                    <input type="number" min={0} value={form.awayScore} onChange={e => setForm(p => ({ ...p, awayScore: +e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live</option>
                      <option value="finished">Finished</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                    <input type="datetime-local" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex items-center gap-3 px-1">
                  <input type="checkbox" id="live" checked={form.live} onChange={e => setForm(p => ({ ...p, live: e.target.checked }))} className="w-4 h-4 rounded accent-blue-600" />
                  <label htmlFor="live" className="text-sm text-gray-700 dark:text-gray-300">Mark as <span className="text-red-500 font-bold">LIVE</span> (real-time updates)</label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">
                    {saving ? "Saving..." : editing ? "Update" : "Create"}
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
