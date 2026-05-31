import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Trophy, Activity, Users } from "lucide-react";

export default function About() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-12 py-8">
        
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-primary">MHCR Football™</h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light">Everything Football, One Place.</p>
        </div>

        <div className="prose dark:prose-invert prose-lg max-w-none text-center">
          <p>
            Welcome to MHCR Football™, the premier digital platform designed for football enthusiasts, analysts, and managers. 
            Our mission is to bring the beautiful game closer to you through cutting-edge technology, real-time data, and comprehensive analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/50 border-0 shadow-md">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Unrivaled Accuracy</h3>
              <p className="text-muted-foreground">Every match, every stat, every player detailed with precision. We ensure data integrity at every level.</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-0 shadow-md">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Real-time Updates</h3>
              <p className="text-muted-foreground">From live match scores to breaking news, experience the game as it happens, instantly.</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-0 shadow-md">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Users className="flex-shrink-0 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Community Driven</h3>
              <p className="text-muted-foreground">Built for the fans. A platform that evolves based on what the football community needs most.</p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-0 shadow-md">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">AI Intelligence</h3>
              <p className="text-muted-foreground">Powered by advanced algorithms that predict match outcomes and provide tactical analysis.</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-primary/5 rounded-3xl p-8 md:p-12 text-center mt-12 border border-primary/10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to experience the future of football management?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of users already tracking their favorite teams.</p>
        </div>

      </div>
    </MainLayout>
  );
}
