import { MainLayout } from "@/components/layout/MainLayout";
import { useEffect, useState } from "react";
import { collections, News as NewsType } from "@/lib/firestore";
import { getDocs, query, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function News() {
  const [news, setNews] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const snap = await getDocs(query(collections.news, orderBy("date", "desc")));
        setNews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsType)));
      } catch (error) {
        console.warn("Firestore read error (check Security Rules):", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Latest News</h1>
        <p className="text-muted-foreground text-lg">Stay updated with breaking news, transfers, and match reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-sm">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-2/3 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : news.map(article => (
          <Card key={article.id} className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer bg-card/50">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={article.image || "https://placehold.co/600x400"} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h3 className="font-bold text-xl mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
              <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                {article.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {!loading && news.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed">
          <p className="text-xl text-muted-foreground">No news articles found.</p>
        </div>
      )}
    </MainLayout>
  );
}
