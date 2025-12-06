import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Providers } from './providers';
import { SuperTokensWrapper } from "supertokens-auth-react";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { SessionAuth, signOut } from "supertokens-auth-react/recipe/session";
import { initSuperTokens } from "./config/supertokens";
import * as reactRouterDom from "react-router-dom";
import MemberList from './pages/members';
import NewMemberPage from './pages/members/new';
import EditMemberPage from './pages/members/edit';
import EventList from './pages/events';
import NewEventPage from './pages/events/new';
import EditEventPage from './pages/events/edit';
import AttendanceDetail from '@/pages/events/attendance/detail';

initSuperTokens();

import { useQuery } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import api from '@/lib/axios';
import { AdminDashboard } from './pages/dashboard/admin';
import { WorkerDashboard } from './pages/dashboard/worker';
import { VisitorDashboard } from './pages/dashboard/visitor';
import { UsersPage } from './pages/admin/users';
import { FamiliesPage } from './pages/admin/families';
import { CellGroupsPage } from './pages/admin/cellgroups';
import ReportsDashboard from './pages/reports';
import { Layout } from './components/layout';
import LandingPage from './pages/landing';
import { ThemeProvider } from './components/theme-provider';

function RoleBasedDashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data;
    },
    retry: false, // Don't retry on 401/404 as interceptor handles it or we show error state
  });

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-4 space-y-4">
        <div>Error loading user profile.</div>
        <button 
          onClick={async () => {
            await signOut();
            window.location.href = "/auth";
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    );
  }

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'WORKER':
      return <WorkerDashboard />;
    case 'VISITOR':
    default:
      return <VisitorDashboard />;
  }
}

function App() {
  return (
    <SuperTokensWrapper>
      <Providers>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme" attribute="class">
          <Router>
          <Routes>
            {getSuperTokensRoutesForReactRouterDom(reactRouterDom, [ThirdPartyPreBuiltUI])}
            <Route path="/" element={<LandingPage />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={
                <SessionAuth>
                  <RoleBasedDashboard />
                </SessionAuth>
              } />
              <Route path="/members" element={
                <SessionAuth>
                  <MemberList />
                </SessionAuth>
              } />
              <Route path="/members/new" element={
                <SessionAuth>
                  <NewMemberPage />
                </SessionAuth>
              } />
              <Route path="/members/:id/edit" element={
                <SessionAuth>
                  <EditMemberPage />
                </SessionAuth>
              } />
              <Route path="/events" element={
                <SessionAuth>
                  <EventList />
                </SessionAuth>
              } />
              <Route path="/events/new" element={
                <SessionAuth>
                  <NewEventPage />
                </SessionAuth>
              } />
              <Route path="/events/:id/edit" element={
                <SessionAuth>
                  <EditEventPage />
                </SessionAuth>
              } />
              <Route path="/events/:eventId/attendance" element={
                <SessionAuth>
                  <AttendanceDetail />
                </SessionAuth>
              } />
              <Route path="/users" element={
                <SessionAuth>
                  <UsersPage />
                </SessionAuth>
              } />
              <Route path="/families" element={
                <SessionAuth>
                  <FamiliesPage />
                </SessionAuth>
              } />
              <Route path="/cellgroups" element={
                <SessionAuth>
                  <CellGroupsPage />
                </SessionAuth>
              } />
              <Route path="/reports" element={
                <SessionAuth>
                  <ReportsDashboard />
                </SessionAuth>
              } />
            </Route>
          </Routes>
          <Toaster />
        </Router>
        </ThemeProvider>
      </Providers>
    </SuperTokensWrapper>
  );
}

export default App;
