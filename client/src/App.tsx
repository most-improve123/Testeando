import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import GraduateDashboard from "@/pages/graduate-dashboard";
import Verifier from "@/pages/verifier";
import VerifierFirebase from "@/pages/verifier-firebase";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/graduate" component={GraduateDashboard} />
      <Route path="/verifier" component={Verifier} />
      <Route path="/verify/:certificateId" component={Verifier} />
      <Route path="/verifier-firebase" component={VerifierFirebase} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
