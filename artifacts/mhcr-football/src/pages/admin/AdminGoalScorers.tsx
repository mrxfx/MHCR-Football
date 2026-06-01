import { AdminLayout } from "@/components/layout/AdminLayout";
import { useEffect, useState } from "react";
import {
  getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, Match, Team, GoalScorer } from "@/lib/firestore";
import { Plus, Pencil, Trash2, X, Flame } from "lucide-react";

type FormData = {
  matchId: string;
  teamId: string;
  playerName: string;
  goals: number;
  minute: string;
};

const empty: FormData = { matchId: "", teamId: "", playerName: "", goals: 1, minute: "" };

export default function AdminGoalScorers() {
  const [scorers, setScorers] = useState<GoalScorer[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GoalScorer | null>(null);
  const [form, setForm] = useState<FormData>(empty);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Derive eligible teams for the selected match
  const selectedMatch = matches.find(m => m.id === form.matchId);
  const eligibleTeams = selectedMatch
    ? teams.filter(t => t.id === selectedMatch.homeTeam || t.id === selectedMatch.awayTeam)
    : [];

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || id;
  const getMatchLabel = (m: Match) =>
    `${getTeamName(m.homeTeam)} vs ${getTeamName(m.awayTeam)} — ${m.date ? new Date(m.date).toLocaleDateString() : ""}`;
  const isLive = (m: Match) => (m as any).live === true || m.status === "live";

  useEffect(() => {
    Promise.all([
      getDocs(query(collections.matches, orderBy("date", "desc"))),
      getDocs(collections.teams),
    ]).then(([ms, ts]) => {
      setMatches(ms.docs.map(d => ({ id: d.id, ...d.data() } as Match)));
      setTeams(ts.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
    }).catch(e => console.warn(e));

    const unsub = onSnapshot(
      query(collections.goalScorers, orderBy("createdAt", "desc")),
      snap => {
        setScorers(snap.docs.map(d => ({ id: d.id, ...d.data() } as GoalScorer)));
        setLoading(false);
      },
      err => { console.warn(err); setLoading(false); }
    );
    return () => unsub();
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: GoalScorer) => {
    setEditing(s);
    setForm({ matchId: (s as any).matchId || "", teamId: s.teamId, playerName: s.playerName, goals: s.goals, minute: s.minute || "" });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing?.id) {
        const updatePayload = { ...form, goals: Number(form.goals) };
        await updateDoc(doc(db, "goalScorers", editing.id), updatePayload);
        showToast("Goal scorer updated!");
      } else {
        await addDoc(collections.goalScorers, { ...form, goals: Number(form.goals), createdAt: serverTimestamp() });
        showToast("Goal scorer added!");
      }
      setOpen(false);
    } catch (e: any) { showToast("Error: " + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this goal scorer?")) return;
    try { await deleteDoc(doc(db, "goalScorers", id)); showToast("Removed!"); }
    catch (e: any) { showToast("Error: " + e.message); }
  };

  // Group scorers by match for display
  const grouped = matches.map(m => ({
    match: m,
    entries: scorers.filter(s => (s as any).matchId === m.id),
  })).filter(g => g.entries.length > 0);

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Goal Scorers</h1>
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
              <Flame size={11} /> LIVE
            </span>
          </div>
          <p className="text-sm text-gray-400">Manage goal scorers per match — updates appear instantly on the home page</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md"
        >
          <Plus size={16} /> Add Goal Scorer
        </button>
      </div>

      {/* Grouped by match */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700" />)}
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-4xl mb-3">⚽</div>
          <p className="text-gray-500 font-medium mb-1">No goal scorers yet</p>
          <p className="text-sm text-gray-400">Add goal scorers to a match to see them here and on the home page</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ match, entries }) => (
            <div key={match.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
              {/* Match Header */}
              <div className={`px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between ${isLive(match) ? "bg-red-50 dark:bg-red-900/10" : "bg-gray-50 dark:bg-gray-700/30"}`}>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">{getTeamName(match.homeTeam)}</span>
                  <span className="font-black text-blue-600 text-sm">{match.homeScore} – {match.awayScore}</span>
                  <span className="font-bold text-sm">{getTeamName(match.awayTeam)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isLive(match) && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">LIVE</span>}
                  <span className="text-xs text-gray-400">{match.date ? new Date(match.date).toLocaleDateString() : ""}</span>
                </div>
              </div>

              {/* Scorer rows */}
              <div className="divide-y divide-gray-50 dark:divide-gray-700">
                {entries
                  .slice()
                  .sort((a, b) => parseInt((a.minute || "0").replace(/\D/g, "")) - parseInt((b.minute || "0").replace(/\D/g, "")))
                  .map(s => (
                    <div key={s.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-base">⚽</span>
                        <div>
                          <span className="font-semibold text-sm">{s.playerName}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">{getTeamName(s.teamId)}</span>
                            {s.minute && <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">{s.minute}</span>}
                            {s.goals > 1 && (
                              <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-600 px-1.5 py-0.5 rounded-full font-medium">
                                {"⚽".repeat(Math.min(s.goals, 5))} ×{s.goals}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(s.id!)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-lg">{editing ? "Edit Goal Scorer" : "Add Goal Scorer"}</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              {/* Match */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Match</label>
                <select
                  required
                  value={form.matchId}
                  onChange={e => setForm(p => ({ ...p, matchId: e.target.value, teamId: "" }))}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a match…</option>
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>
                      {isLive(m) ? "🔴 " : ""}{getMatchLabel(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team (filtered to match participants) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Team</label>
                <select
                  required
                  disabled={!form.matchId}
                  value={form.teamId}
                  onChange={e => setForm(p => ({ ...p, teamId: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Select team…</option>
                  {eligibleTeams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Player Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Player Name</label>
                <input
                  required
                  value={form.playerName}
                  onChange={e => setForm(p => ({ ...p, playerName: e.target.value }))}
                  placeholder="e.g. Rahul Haldar"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Minute + Goals */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Goal Minute</label>
                  <input
                    value={form.minute}
                    onChange={e => setForm(p => ({ ...p, minute: e.target.value }))}
                    placeholder="e.g. 23'"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Number of Goals</label>
                  <input
                    type="number" min={1} max={20} required
                    value={form.goals}
                    onChange={e => setForm(p => ({ ...p, goals: +e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : (editing ? "Update" : "Add Goal")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
