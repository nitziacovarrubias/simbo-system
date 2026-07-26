import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@renderer/components/layout/AppLayout';
import { LoginPage } from '@renderer/modules/auth/LoginPage';
import { ClientDetailPage } from '@renderer/modules/clients/ClientDetailPage';
import { EditClientPage, NewClientPage } from '@renderer/modules/clients/ClientForm';
import { ClientsPage } from '@renderer/modules/clients/ClientsPage';
import { EditProjectPage, NewProjectPage } from '@renderer/modules/projects/ProjectForm';
import { ProjectDetailPage } from '@renderer/modules/projects/ProjectDetailPage';
import { ProjectsPage } from '@renderer/modules/projects/ProjectsPage';
import { PlaceholderPage } from '@renderer/modules/placeholder/PlaceholderPage';
import { DesignEditorPage } from '@renderer/modules/design-editor/DesignEditorPage';
import { CuttingListPage } from '@renderer/modules/cutting-list/CuttingListPage';
import { QuotesPage } from '@renderer/modules/quotes/QuotesPage';
import { appRoutes } from '@renderer/routes/app-routes';
import { useSessionStore } from '@renderer/stores/session.store';
import type { UserRole } from '@shared/constants/roles';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1
    }
  }
});

interface RequireRoleProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

function RequireRole({ allowedRoles, children }: RequireRoleProps): JSX.Element {
  const user = useSessionStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <section className="page-panel">
        <div className="access-denied" role="alert">
          <h2>Acceso restringido</h2>
          <p>Tu rol actual no tiene permisos para entrar a este módulo.</p>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}

function ProtectedRoutes(): JSX.Element {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

export function App(): JSX.Element {
  const clientsRoute = appRoutes.find((route) => route.path === '/clients');
  const projectsRoute = appRoutes.find((route) => route.path === '/projects');
  const designRoute = appRoutes.find((route) => route.path === '/design-editor');
  const cuttingListRoute = appRoutes.find((route) => route.path === '/cutting-list');
  const quotationsRoute = appRoutes.find((route) => route.path === '/quotations');
  const placeholderRoutes = appRoutes.filter(
    (route) =>
      route.path !== '/clients' && route.path !== '/projects' && route.path !== '/design-editor' && route.path !== '/cutting-list' && route.path !== '/quotations'
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoutes />}>
            <Route
              path="/clients"
              element={
                <RequireRole allowedRoles={clientsRoute?.allowedRoles ?? []}>
                  <ClientsPage />
                </RequireRole>
              }
            />
            <Route
              path="/clients/new"
              element={
                <RequireRole allowedRoles={clientsRoute?.allowedRoles ?? []}>
                  <NewClientPage />
                </RequireRole>
              }
            />
            <Route
              path="/clients/:clientId"
              element={
                <RequireRole allowedRoles={clientsRoute?.allowedRoles ?? []}>
                  <ClientDetailPage />
                </RequireRole>
              }
            />
            <Route
              path="/clients/:clientId/edit"
              element={
                <RequireRole allowedRoles={clientsRoute?.allowedRoles ?? []}>
                  <EditClientPage />
                </RequireRole>
              }
            />

            <Route
              path="/projects"
              element={
                <RequireRole allowedRoles={projectsRoute?.allowedRoles ?? []}>
                  <ProjectsPage />
                </RequireRole>
              }
            />
            <Route
              path="/projects/new"
              element={
                <RequireRole allowedRoles={projectsRoute?.allowedRoles ?? []}>
                  <NewProjectPage />
                </RequireRole>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <RequireRole allowedRoles={projectsRoute?.allowedRoles ?? []}>
                  <ProjectDetailPage />
                </RequireRole>
              }
            />
            <Route
              path="/projects/:projectId/edit"
              element={
                <RequireRole allowedRoles={projectsRoute?.allowedRoles ?? []}>
                  <EditProjectPage />
                </RequireRole>
              }
            />
            <Route
              path="/projects/:projectId/design"
              element={
                <RequireRole allowedRoles={designRoute?.allowedRoles ?? []}>
                  <DesignEditorPage />
                </RequireRole>
              }
            />
            <Route path="/design-editor" element={<Navigate to="/projects" replace />} />
            <Route
              path="/projects/:projectId/cutting-list"
              element={
                <RequireRole allowedRoles={cuttingListRoute?.allowedRoles ?? []}>
                  <CuttingListPage />
                </RequireRole>
              }
            />
            <Route path="/cutting-list" element={<Navigate to="/projects" replace />} />
            <Route
              path="/projects/:projectId/quotes"
              element={
                <RequireRole allowedRoles={quotationsRoute?.allowedRoles ?? []}>
                  <QuotesPage />
                </RequireRole>
              }
            />
            <Route path="/quotations" element={<Navigate to="/projects" replace />} />

            {placeholderRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<PlaceholderPage route={route} />}
              />
            ))}
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}
