"use client";
import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Who are the top scorers this season?",
  "Predict the next match outcome",
  "Analyze the current league standings",
  "What are the latest match results?",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm the MHCR Football™ AI Assistant. Ask me anything about teams, players, match predictions, or league analysis! ⚽" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const reply = generateReply(text);
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  const generateReply = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes("predict") || lower.includes("outcome")) return "Based on current form and head-to-head records, I'd expect a competitive match. The home team typically has a slight advantage. Final prediction: Home win with a 2-1 scoreline! 🏆";
    if (lower.includes("top scorer") || lower.includes("goals")) return "The top scorers list is updated based on your Firestore data. Make sure player records in the admin panel are up to date to get accurate stats. ⚽";
    if (lower.includes("standing") || lower.includes("table") || lower.includes("league")) return "The current standings show the teams ranked by points. Check the Standings page for the full table. The top team has been performing consistently well this season! 📊";
    if (lower.includes("news") || lower.includes("latest")) return "The latest news is published through the admin panel. Head to the News page for all the latest articles and updates. 📰";
    if (lower.includes("team") || lower.includes("squad")) return "All team information including squad details, coaches, and stadiums is available on the Teams page. Each team page shows full squad details. 👥";
    return "Great question! MHCR Football™ tracks all the key stats — teams, players, matches, and standings. Explore the platform or ask me something more specific and I'll do my best to help! ⚽🏟️";
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div><h1 className="text-2xl font-black">AI Assistant</h1><p className="text-sm text-gray-400 mt-1">Ask anything about MHCR Football™</p></div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm flex flex-col" style={{ height: "60vh" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "assistant" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
                  {m.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "assistant" ? "bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100" : "bg-blue-600 text-white"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 flex items-center gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 p-4">
            <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about teams, players, matches..." className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" disabled={!input.trim() || loading} className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-white transition-colors">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2 font-medium">Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => sendMessage(s)} className="text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-300 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full transition-colors hover:text-blue-600">
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
