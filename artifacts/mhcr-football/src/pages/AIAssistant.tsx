import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, TrendingUp, ShieldAlert, Zap } from "lucide-react";
import { useState } from "react";

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am MHCR Intelligence. I can predict match outcomes, analyze team performance, and summarize recent news. What would you like to know?" }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "As an AI demo, I don't have real-time data access right now. But based on historical patterns, I'd say the team with higher possession usually wins 64% of the time in this league!" 
      }]);
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            MHCR Intelligence
          </h1>
          <p className="text-muted-foreground">Powered by advanced football analytics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/50 border-primary/20 hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <TrendingUp className="text-blue-500 w-6 h-6" />
              <h3 className="font-bold">Match Prediction</h3>
              <p className="text-xs text-muted-foreground">Win probabilities based on current form and historical data.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-primary/20 hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <ShieldAlert className="text-purple-500 w-6 h-6" />
              <h3 className="font-bold">Team Analysis</h3>
              <p className="text-xs text-muted-foreground">Deep dive into tactical setups and player performance metrics.</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-primary/20 hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
              <Zap className="text-amber-500 w-6 h-6" />
              <h3 className="font-bold">News Summary</h3>
              <p className="text-xs text-muted-foreground">Quick summaries of the latest transfers and injuries.</p>
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col h-[500px] shadow-xl border-primary/20">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" /> Chat with Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t p-4 bg-muted/10">
            <form onSubmit={handleSend} className="flex w-full gap-2">
              <Input 
                placeholder="Ask about team stats, predictions..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 bg-background"
              />
              <Button type="submit" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
