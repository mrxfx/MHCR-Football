"use client";
import { useEffect, useState } from "react";
import { getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections, News } from "@/lib/firestore";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus, Pencil, Trash2, X } from "lucide-react";

type FormData = { title: string; description: string; image: string; date: string; };
const emptyForm: FormData = { title: "", description: "", image: "", date: new Date().toISOString().slice(0,10) };

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const fetchNews = async () => {
    try {
      const s = await getDocs(query(collections.news, orderBy("date","desc")));
      setNews(s.docs.map(d => ({ id: d.id, ...d.data() } as News)));
    } catch(e) { console.warn(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchNews(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const openAdd = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (a: News) => { setEditing(a); setForm({ title: a.title, description: a.description, image: a.image, date: a.date }); setOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing?.id) { await updateDoc(doc(db, "news", editing.id), form); showToast("Article updated!"); }
      else { await addDoc(collections.news, form); showToast("Published!"); }
      setOpen(false); fetchNews();
    } catch(e: any) { showToast("Error: " + e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try { await deleteDoc(doc(db, "news", id)); showToast("Deleted!"); fetchNews(); }
    catch(e: any) { showToast("Error: " + e.message); }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        {toast && <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">{toast}</div>}
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">News</h1><p className="text-sm text-gray-400 mt-1">Manage news articles</p></div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-md"><Plus size={16} /> Publish News</button>
        </div>

        {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700" />)}</div>
        : news.length === 0 ? <div className="py-20 text-center text-gray-400">No articles yet.</div>
        : (
          <div className="space-y-3">
            {news.map(a => (
              <div key={a.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                  <img src={a.image || "https://placehold.co/56x56?text=📰"} alt={a.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{a.description?.slice(0,80)}{a.description?.length > 80 ? "…" : ""}</p>
                  <p className="text-xs text-gray-400">{a.date}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(a)} className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(a.id)} className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="font-bold text-lg">{editing ? "Edit Article" : "Publish News"}</h2>
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea required rows={4} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                  <input type="url" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60">{saving ? "Saving..." : editing ? "Update" : "Publish"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
