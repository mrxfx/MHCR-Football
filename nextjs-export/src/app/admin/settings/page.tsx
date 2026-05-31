"use client";
import { useEffect, useState } from "react";
import { getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { collections } from "@/lib/firestore";
import AdminLayout from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [form, setForm] = useState({ appName: "MHCR Football™", logoUrl: "", themeColor: "#2563EB" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getDocs(collections.settings).then(s => {
      if (!s.empty) {
        const d = s.docs[0];
        setSettingsId(d.id);
        const data = d.data() as any;
        setForm({ appName: data.appName || "MHCR Football™", logoUrl: data.logoUrl || "", themeColor: data.themeColor || "#2563EB" });
      }
    }).catch(() => {});
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (settingsId) { await updateDoc(doc(db, "settings", settingsId), form); }
      else { const r = await addDoc(collections.settings, form); setSettingsId(r.id); }
      showToast("Settings saved!");
    } catch(e: any) { showToast("Error: " + e.message); } finally { setSaving(false); }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        {toast && <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg">{toast}</div>}
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1><p className="text-sm text-gray-400 mt-1">App configuration</p></div>

        <div className="max-w-lg">
          <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">App Name</label>
              <input value={form.appName} onChange={e => setForm(p => ({ ...p, appName: e.target.value }))}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo URL</label>
              <input type="url" value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))} placeholder="https://..."
                className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.themeColor} onChange={e => setForm(p => ({ ...p, themeColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input value={form.themeColor} onChange={e => setForm(p => ({ ...p, themeColor: e.target.value }))} className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors shadow-md">
              <Save size={16} />{saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
