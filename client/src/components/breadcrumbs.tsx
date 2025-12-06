import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"
import React from 'react';

const routeNameMap: Record<string, string> = {
  'members': 'Members',
  'new': 'New',
  'edit': 'Edit',
  'events': 'Events',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Remove 'dashboard' from pathnames as it is hardcoded as the root breadcrumb
  if (pathnames[0] === 'dashboard') {
    pathnames.shift();
  }

  if (pathnames.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4 ml-8">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((value, index) => {
          // Since we removed 'dashboard', we need to construct the path correctly
          // If the original path started with dashboard, we need to prepend it back for the link
          const isDashboardRoute = location.pathname.startsWith('/dashboard');
          const basePath = isDashboardRoute ? '/dashboard' : '';
          const to = `${basePath}/${pathnames.slice(0, index + 1).join('/')}`;
          
          const isLast = index === pathnames.length - 1;
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
          const name = routeNameMap[value] || (isUuid ? 'Details' : value.charAt(0).toUpperCase() + value.slice(1));
          
          // Logic for responsive breadcrumbs
          // Hide intermediate items on mobile (md:hidden)
          // Show ellipsis on mobile if there are intermediate items
          const isIntermediate = index < pathnames.length - 1;
          const showEllipsis = index === 0 && pathnames.length > 1;

          return (
            <React.Fragment key={to}>
              {/* Desktop Separator / Item */}
              <BreadcrumbSeparator className={isIntermediate ? "hidden md:block" : ""} />
              <BreadcrumbItem className={isIntermediate ? "hidden md:inline-flex" : ""}>
                {isLast || isUuid ? (
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={to}>{name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {/* Mobile Ellipsis (only for the first intermediate item) */}
              {showEllipsis && (
                <>
                  <BreadcrumbSeparator className="md:hidden" />
                  <BreadcrumbItem className="md:hidden">
                    <BreadcrumbEllipsis />
                  </BreadcrumbItem>
                </>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
