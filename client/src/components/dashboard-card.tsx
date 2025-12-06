import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  mainText: string;
  description: string;
  children?: ReactNode;
}

export function DashboardCard({ title, icon, mainText, description, children }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{mainText}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <div className="mt-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
