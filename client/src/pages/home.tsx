import { useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import GraduateDashboard from "./graduate-dashboard";
import Verifier from "./verifier";
import Admin from "./admin";

export default function Home() {
  const [currentView, setCurrentView] = useState<'graduate' | 'verifier' | 'admin'>('graduate');

  // Mock user for demo - in real app this would come from auth context
  const user = {
    name: "John Doe",
    email: "john.doe@example.com"
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'graduate':
        return <GraduateDashboard />;
      case 'verifier':
        return <Verifier />;
      case 'admin':
        return <Admin />;
      default:
        return <GraduateDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView}
        user={user}
      />
      {renderCurrentView()}
      <MobileNav 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />
    </div>
  );
}
