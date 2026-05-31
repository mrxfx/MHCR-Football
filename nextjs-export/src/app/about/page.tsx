import MainLayout from "@/components/layout/MainLayout";
import { Trophy, UserSquare, Calendar, BarChart2, Newspaper, Smartphone } from "lucide-react";

const features = [
  { icon: Trophy, label: "Team Management" },
  { icon: UserSquare, label: "Player Profiles & Statistics" },
  { icon: Calendar, label: "Match Fixtures & Results" },
  { icon: BarChart2, label: "League Standings" },
  { icon: Newspaper, label: "Football News & Updates" },
  { icon: Smartphone, label: "Fast & Mobile Friendly Design" },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-4 space-y-8">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-3xl font-black text-blue-600">About MHCR Football™</h1>
          <p className="text-gray-400 text-sm">Everything Football, One Place.</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
          <p className="text-base leading-relaxed">Welcome to <span className="font-bold text-blue-600">MHCR Football™</span>, your all-in-one football platform.</p>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 mt-3">
            MHCR Football™ is designed to bring football fans, players, and teams together in one place. Stay updated with the latest football news, match results, league standings, team information, and player statistics.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-blue-600" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            Our mission is to create a simple, modern, and accessible football experience for everyone. Whether you're following your favorite team, checking player stats, or staying updated with match results, <span className="font-semibold text-gray-800 dark:text-white">MHCR Football™</span> has you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Version", value: "Version 1.0" },
            { label: "Sponsored By", value: "Haldar Family" },
            { label: "Developed By", value: "Rahul Haldar" },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 text-center shadow-sm">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
              <p className="font-bold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="text-center bg-gradient-to-r from-blue-900 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="text-3xl mb-3">🙏</div>
          <p className="text-base font-medium leading-relaxed">Thank you for using MHCR Football™ and being part of our football community.</p>
        </div>
      </div>
    </MainLayout>
  );
}
