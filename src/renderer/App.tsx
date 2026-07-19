import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './modules/auth/LoginPage';
import { PlaceholderPage } from './modules/placeholder/PlaceholderPage';
import { appRoutes } from './routes/app-routes';
import { useSessionStore } from './stores/session.store';

const queryClient = new QueryClient();

function ProtectedRoutes(): JSX.Element {
    const isAuthenticated = useSessionStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <AppLayout />;
}

export function App(): JSX.Element {
    return (
        <QueryClientProvider client={queryClient}>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<ProtectedRoutes />}>
                        {appRoutes.map((route) => (
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