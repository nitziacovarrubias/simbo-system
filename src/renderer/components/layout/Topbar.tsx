import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { RoleBadge } from '@renderer/components/common/RoleBadge';
import { useSessionStore } from '@renderer/stores/session.store';

export function Topbar(): JSX.Element {
    const user = useSessionStore((state) => state.user);
    const [version, setVersion] = useState<string>('0.1.0');

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

    return (
        <header className="topbar">
            <div>
                <p className="topbar-eyebrow">Sistema Integral de Modelado y Despiece</p>
                <h1>SIMBO</h1>
            </div>

            <div className="topbar-actions">
                <span className="app-version">v{version}</span>

                {user ? (
                    <div className="user-summary" aria-label="Usuario actual">
                        <span>{user.fullName}</span>
                        <RoleBadge role={user.role} />
                    </div>
                ) : null}

                <button type="button" className="icon-button" aria-label="Abrir configuración">
                    <Settings size={22} aria-hidden="true" />
                </button>
            </div>
        </header>
    );
}