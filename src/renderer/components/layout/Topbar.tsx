import { useEffect, useRef, useState } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

import { RoleBadge } from '@renderer/components/common/RoleBadge';
import { appRoutes } from '@renderer/routes/app-routes';
import { useSessionStore } from '@renderer/stores/session.store';
import simboLogo from '@renderer/assets/logo-simbo.svg';
import './Topbar.css';

const PRIMARY_NAVIGATION_PATHS = [
    '/dashboard',
    '/projects',
    '/clients'
];

const NAVIGATION_LABELS: Record<string, string> = {
    '/dashboard': 'Inicio',
    '/projects': 'Proyectos',
    '/clients': 'Clientes'
};

export function Topbar(): JSX.Element {
    const navigate = useNavigate();

    const user = useSessionStore((state) => state.user);
    const logout = useSessionStore((state) => state.logout);

    const [version, setVersion] = useState<string>('0.1.0');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    const visibleRoutes = appRoutes.filter((route) => {
        if (!user) {
            return false;
        }

        return (
            PRIMARY_NAVIGATION_PATHS.includes(route.path) &&
            route.allowedRoles.includes(user.role)
        );
    });

    useEffect(() => {
        if (!window.simboApi?.getAppInfo) {
            setVersion('0.1.0');
            return;
        }

        window.simboApi
            .getAppInfo()
            .then((info) => {
                setVersion(info.version);
            })
            .catch(() => {
                setVersion('0.1.0');
            });
    }, []);

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        function handleOutsideClick(event: MouseEvent): void {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (!menuRef.current?.contains(target)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isMenuOpen]);

    function handleLogout(): void {
        setIsMenuOpen(false);
        logout();
        navigate('/login');
    }

    function handleOpenSettings(): void {
        setIsMenuOpen(false);
        navigate('/settings');
    }

    return (
        <header className="main-topbar">
            <NavLink
                to="/dashboard"
                className="main-topbar-brand"
                aria-label="Ir al inicio de SIMBO"
            >
                <img
                    src={simboLogo}
                    alt=""
                    className="main-topbar-logo"
                    />

                <span>SIMBO</span>
            </NavLink>

            <nav
                className="main-topbar-navigation"
                aria-label="Navegación principal"
            >
                {visibleRoutes.map((route) => {
                    const label = NAVIGATION_LABELS[route.path] ?? route.title;

                    return (
                        <NavLink
                            key={route.path}
                            to={route.path}
                            className={({ isActive }) =>
                                [
                                    'main-topbar-link',
                                    isActive ? 'is-active' : ''
                                ]
                                    .filter(Boolean)
                                    .join(' ')
                            }
                        >
                            {label}
                        </NavLink>
                    );
                })}
            </nav>

            <div
                ref={menuRef}
                className="main-topbar-settings"
            >
                <button
                    type="button"
                    className="main-topbar-settings-button"
                    aria-label="Abrir menú de usuario"
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    onClick={() => {
                        setIsMenuOpen((currentValue) => !currentValue);
                    }}
                >
                    <Settings
                        size={32}
                        strokeWidth={1.8}
                        aria-hidden="true"
                    />
                </button>

                {isMenuOpen ? (
                    <div
                        className="main-topbar-menu"
                        role="menu"
                        aria-label="Opciones de usuario"
                    >
                        {user ? (
                            <div className="main-topbar-user">
                                <span className="main-topbar-user-label">
                                    Sesión actual
                                </span>

                                <strong>{user.fullName}</strong>

                                <RoleBadge role={user.role} />
                            </div>
                        ) : null}

                        <div className="main-topbar-menu-divider" />

                        <button
                            type="button"
                            className="main-topbar-menu-item"
                            role="menuitem"
                            onClick={handleOpenSettings}
                        >
                            <Settings
                                size={18}
                                aria-hidden="true"
                            />

                            <span>Configuración</span>
                        </button>

                        <button
                            type="button"
                            className="main-topbar-menu-item main-topbar-menu-item--logout"
                            role="menuitem"
                            onClick={handleLogout}
                        >
                            <LogOut
                                size={18}
                                aria-hidden="true"
                            />

                            <span>Cerrar sesión</span>
                        </button>

                        <div className="main-topbar-version">
                            SIMBO v{version}
                        </div>
                    </div>
                ) : null}
            </div>
        </header>
    );
}