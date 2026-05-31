import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { collections, Settings } from "@/lib/firestore";
import { getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    appName: "MHCR Football™",
    logoUrl: "",
    themeColor: "#2563EB",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const snapshot = await getDocs(collections.settings);
      if (!snapshot.empty) {
        const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Settings;
        setSettings(data);
        setFormData({ appName: data.appName, logoUrl: data.logoUrl, themeColor: data.themeColor });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (settings?.id) {
        await updateDoc(doc(collections.settings, settings.id), formData);
      } else {
        await addDoc(collections.settings, formData);
      }
      toast({ title: "Settings saved successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Platform Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">App Name</label>
                <Input value={formData.appName} onChange={e => setFormData({ ...formData, appName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Logo URL</label>
                <Input value={formData.logoUrl} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Theme Color</label>
                <Input type="color" value={formData.themeColor} onChange={e => setFormData({ ...formData, themeColor: e.target.value })} className="h-12" required />
              </div>
              <Button type="submit" disabled={loading}>Save Settings</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
