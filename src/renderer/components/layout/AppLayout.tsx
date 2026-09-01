import { Outlet, useLocation } from 'react-router-dom';
import { Topbar } from '@renderer/components/layout/Topbar';

import './AppLayout.css';

export function AppLayout(): JSX.Element {
    const location = useLocation();

    const isDashboard = location.pathname === '/dashboard';

    return (
        <div className="main-layout">
            <Topbar />

            <main
                className={[
                    'main-layout-content',
                    isDashboard ? 'main-layout-content--dashboard' : ''
                ]
                    .filter(Boolean)
                    .join(' ')}
                aria-label="Contenido principal de SIMBO"
            >
                <Outlet />
            </main>
        </div>
    );
}