import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor = "text-primary", bgColor = "bg-primary/10" }: StatsCardProps) {
  return (
    <Card className="border border-neutral-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Icon className={`text-xl ${iconColor}`} />
          </div>
          <div className="ml-4">
            <p className="text-sm text-neutral-600">{title}</p>
            <p className="text-2xl font-bold text-neutral-800">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
