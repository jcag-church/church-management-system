import { Outlet } from 'react-router-dom';
import { Breadcrumbs } from './breadcrumbs';
import { Header } from './header';

export function Layout() {
  return (
    <div className="min-h-screen bg-background relative">
      <Header />
      <div className="container mx-auto py-4">
        <Breadcrumbs />
        <Outlet />
      </div>
    </div>
  );
}
