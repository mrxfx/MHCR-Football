import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { collections, News } from "@/lib/firestore";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const fetchNews = async () => {
    try {
      const snapshot = await getDocs(collections.news);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as News));
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setNews(data);
    } catch (error) {
      console.warn("Firestore read error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNews?.id) {
        await updateDoc(doc(collections.news, editingNews.id), formData);
        toast({ title: "News updated successfully" });
      } else {
        await addDoc(collections.news, formData);
        toast({ title: "News published successfully" });
      }
      setIsOpen(false);
      setEditingNews(null);
      setFormData({ title: "", description: "", image: "", date: new Date().toISOString().slice(0, 10) });
      fetchNews();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteDoc(doc(collections.news, id));
        toast({ title: "News deleted successfully" });
        fetchNews();
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">News Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingNews(null);
              setFormData({ title: "", description: "", image: "", date: new Date().toISOString().slice(0, 10) });
            }}>Publish News</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingNews ? "Edit News" : "Publish News"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              <Textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={4} />
              <Input placeholder="Image URL" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} required />
              <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
              <Button type="submit" className="w-full">{editingNews ? "Update" : "Publish"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map(article => (
              <TableRow key={article.id}>
                <TableCell>{new Date(article.date).toLocaleDateString()}</TableCell>
                <TableCell><img src={article.image || "https://placehold.co/100x100"} alt="news" className="w-12 h-8 object-cover rounded" /></TableCell>
                <TableCell className="font-medium max-w-xs truncate">{article.title}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setEditingNews(article);
                    setFormData({ title: article.title, description: article.description, image: article.image, date: article.date });
                    setIsOpen(true);
                  }}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(article.id!)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && news.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No news found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
