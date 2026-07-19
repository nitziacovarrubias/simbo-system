import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { appRoutes } from '@renderer/routes/app-routes';
import { useSessionStore } from '@renderer/stores/session.store';

export function Sidebar(): JSX.Element {
    const navigate = useNavigate();
    const user = useSessionStore((state) => state.user);
    const logout = useSessionStore((state) => state.logout);

    const visibleRoutes = appRoutes.filter((route) => {
        return user ? route.allowedRoles.includes(user.role) : false;
    });

    function handleLogout(): void {
        logout();
        navigate('/login');
    }

    return (
        <aside className="sidebar" aria-label="Navegación principal">
            <div className="sidebar-brand" aria-label="SIMBO">
                <div className="brand-mark" aria-hidden="true">
                    S
                </div>
                <div>
                    <strong>SIMBO</strong>
                    <span>BOIS</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {visibleRoutes.map((route) => {
                    const Icon = route.Icon;

                    return (
                        <NavLink
                            key={route.path}
                            to={route.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'is-active' : ''}`}
                        >
                            <Icon size={20} aria-hidden="true" />
                            <span>{route.title}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <button type="button" className="sidebar-logout" onClick={handleLogout}>
                <LogOut size={20} aria-hidden="true" />
                <span>Cerrar sesión</span>
            </button>
        </aside>
    );
}