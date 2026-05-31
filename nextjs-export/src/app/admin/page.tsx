"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/admin/dashboard");
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      router.replace("/admin/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f1729]">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-900/40" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
            <Shield size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">MHCR Football™</h1>
          <p className="text-blue-300 text-lg mb-8">Everything Football, One Place.</p>
          <div className="space-y-3 text-left">
            {["Manage Teams & Players", "Schedule & Score Matches", "Publish News Articles", "Control League Standings"].map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/70">
                <div className="w-5 h-5 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold">MHCR Football™</p>
              <p className="text-blue-300 text-xs">Admin Panel</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-white/50 text-sm mt-1">Sign in to your admin account</p>
            </div>

            {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@mhcr.com"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</> : "Sign In"}
              </button>
            </form>
          </div>
          <p className="text-center text-white/20 text-xs mt-6">MHCR Football™ Admin — Restricted Access</p>
        </div>
      </div>
    </div>
  );
}
