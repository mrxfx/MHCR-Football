"use client";
import { useEffect, useState } from "react";
import { getDocs, query, orderBy } from "firebase/firestore";
import { collections, News } from "@/lib/firestore";
import MainLayout from "@/components/layout/MainLayout";
import { Newspaper } from "lucide-react";

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(query(collections.news, orderBy("date", "desc")))
      .then(s => setNews(s.docs.map(d => ({ id: d.id, ...d.data() } as News))))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div><h1 className="text-2xl font-black">News</h1><p className="text-sm text-gray-400 mt-1">Latest football news & updates</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
              <div className="p-4 space-y-2"><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" /></div>
            </div>
          )) : news.length === 0 ? (
            <div className="col-span-3 py-16 text-center">
              <Newspaper size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No news articles yet</p>
            </div>
          ) : news.map(a => (
            <div key={a.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={a.image || "https://placehold.co/600x338?text=MHCR+Football"} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-base group-hover:text-blue-600 transition-colors leading-snug">{a.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{a.description}</p>
                <p className="text-xs text-gray-400">{a.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
