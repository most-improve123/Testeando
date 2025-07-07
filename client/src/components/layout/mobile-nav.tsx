import { GraduationCap, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  currentView: 'graduate' | 'verifier' | 'admin';
  onViewChange: (view: 'graduate' | 'verifier' | 'admin') => void;
}

export function MobileNav({ currentView, onViewChange }: MobileNavProps) {
  const getButtonClass = (view: string) => {
    return currentView === view ? "text-primary" : "text-neutral-500";
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-2">
      <div className="flex justify-around">
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 ${getButtonClass('graduate')}`}
          onClick={() => onViewChange('graduate')}
        >
          <GraduationCap className="text-lg" />
          <span className="text-xs mt-1">Graduate</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 ${getButtonClass('verifier')}`}
          onClick={() => onViewChange('verifier')}
        >
          <Search className="text-lg" />
          <span className="text-xs mt-1">Verify</span>
        </Button>
        
        <Button
          variant="ghost"
          className={`flex flex-col items-center py-2 ${getButtonClass('admin')}`}
          onClick={() => onViewChange('admin')}
        >
          <Settings className="text-lg" />
          <span className="text-xs mt-1">Admin</span>
        </Button>
      </div>
    </div>
  );
}
