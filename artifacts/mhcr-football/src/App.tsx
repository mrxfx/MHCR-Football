import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import Teams from "@/pages/Teams";
import TeamDetail from "@/pages/TeamDetail";
import Players from "@/pages/Players";
import Matches from "@/pages/Matches";
import Standings from "@/pages/Standings";
import News from "@/pages/News";
import AIAssistant from "@/pages/AIAssistant";
import About from "@/pages/About";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTeams from "@/pages/admin/AdminTeams";
import AdminPlayers from "@/pages/admin/AdminPlayers";
import AdminMatches from "@/pages/admin/AdminMatches";
import AdminStandings from "@/pages/admin/AdminStandings";
import AdminNews from "@/pages/admin/AdminNews";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminGoalScorers from "@/pages/admin/AdminGoalScorers";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/teams" component={Teams} />
      <Route path="/teams/:id" component={TeamDetail} />
      <Route path="/players" component={Players} />
      <Route path="/matches" component={Matches} />
      <Route path="/standings" component={Standings} />
      <Route path="/news" component={News} />
      <Route path="/ai-assistant" component={AIAssistant} />
      <Route path="/about" component={About} />
      
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard">
        {() => (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/teams">
        {() => (
          <ProtectedRoute>
            <AdminTeams />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/players">
        {() => (
          <ProtectedRoute>
            <AdminPlayers />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/matches">
        {() => (
          <ProtectedRoute>
            <AdminMatches />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/standings">
        {() => (
          <ProtectedRoute>
            <AdminStandings />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/news">
        {() => (
          <ProtectedRoute>
            <AdminNews />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/goal-scorers">
        {() => (
          <ProtectedRoute>
            <AdminGoalScorers />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mhcr-theme">
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
