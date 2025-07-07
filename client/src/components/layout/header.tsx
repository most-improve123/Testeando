import { GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentView: 'graduate' | 'verifier' | 'admin';
  onViewChange: (view: 'graduate' | 'verifier' | 'admin') => void;
  user?: { name: string; email: string };
}

export function Header({ currentView, onViewChange, user }: HeaderProps) {
  const getButtonClass = (view: string) => {
    return currentView === view
      ? "bg-primary text-white"
      : "text-neutral-800 hover:bg-neutral-100";
  };

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <GraduationCap className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-neutral-800">WeSpark</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-1">
              <Button
                variant="ghost"
                className={`px-4 py-2 rounded-md text-sm font-medium ${getButtonClass('graduate')}`}
                onClick={() => onViewChange('graduate')}
              >
                Graduate
              </Button>
              <Button
                variant="ghost"
                className={`px-4 py-2 rounded-md text-sm font-medium ${getButtonClass('verifier')}`}
                onClick={() => onViewChange('verifier')}
              >
                Verifier
              </Button>
              <Button
                variant="ghost"
                className={`px-4 py-2 rounded-md text-sm font-medium ${getButtonClass('admin')}`}
                onClick={() => onViewChange('admin')}
              >
                Admin
              </Button>
            </div>
            
            {user && (
              <div className="flex items-center space-x-2">
                <User className="text-neutral-400 text-xl" />
                <span className="text-sm text-neutral-800">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
