import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/dashboard-card';
import { Users, Calendar, CheckSquare } from 'lucide-react';

export function AdminDashboard() {

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title=""
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          mainText="Manage Members"
          description="View and edit member records"
        >
          <div className="flex flex-col gap-2">
            <Link to="/members">
              <Button className="w-full">Go to Members</Button>
            </Link>
            <Link to="/users">
              <Button variant="outline" className="w-full">Manage Users</Button>
            </Link>
            <Link to="/families">
              <Button variant="outline" className="w-full">Manage Families</Button>
            </Link>
            <Link to="/cellgroups">
              <Button variant="outline" className="w-full">Manage Cell Groups</Button>
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard
          title=""
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          mainText="Manage Events"
          description="Schedule and edit events"
        >
          <Link to="/events" className="block">
            <Button className="w-full">Go to Events</Button>
          </Link>
        </DashboardCard>

        <DashboardCard
          title=""
          icon={<CheckSquare className="h-4 w-4 text-muted-foreground" />}
          mainText="Reports"
          description="View attendance stats"
        >
          <Link to="/reports">
            <Button className="w-full">View Reports</Button>
          </Link>
        </DashboardCard>
      </div>
    </div>
  );
}
