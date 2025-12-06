import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { signOut } from "supertokens-auth-react/recipe/session";

export function VisitorDashboard() {
  const onLogout = async () => {
    await signOut();
    window.location.href = "/auth";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome!</h1>
        <Button variant="outline" onClick={onLogout}>Sign Out</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Welcome to the Church Management System. Please contact an admin to upgrade your account if you are a worker or leader.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
