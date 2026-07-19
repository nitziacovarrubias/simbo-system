import { Outlet } from 'react-router-dom';
import { Sidebar } from '@renderer/components/layout/Sidebar';
import { Topbar } from '@renderer/components/layout/Topbar';

export function AppLayout(): JSX.Element {
    return (
        <div className="app-shell">
            <Sidebar />

            <div className="app-main">
                <Topbar />

                <main className="app-content" aria-label="Contenido principal de SIMBO">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}