import { AlertTriangle, CheckCircle2, Clock, Hammer } from 'lucide-react';
import type { AppRoute } from '@shared/types/route.types';
import { USER_ROLE_LABEL } from '@shared/constants/roles';
import { useSessionStore } from '@renderer/stores/session.store';

interface PlaceholderPageProps {
    route: AppRoute;
}

export function PlaceholderPage({ route }: PlaceholderPageProps): JSX.Element {
    const user = useSessionStore((state) => state.user);
    const Icon = route.Icon;

    const canAccess = user ? route.allowedRoles.includes(user.role) : false;

    if (!canAccess) {
        return (
            <section className="page-panel">
                <div className="access-denied">
                    <AlertTriangle size={42} aria-hidden="true" />
                    <h2>Acceso restringido</h2>
                    <p>Tu rol actual no tiene permisos para entrar a este módulo.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="page-panel" aria-labelledby="page-title">
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon" aria-hidden="true">
                        <Icon size={28} />
                    </div>

                    <div>
                        <p className="page-eyebrow">Módulo SIMBO</p>
                        <h2 id="page-title">{route.title}</h2>
                        <p>{route.description}</p>
                    </div>
                </div>

                <button type="button" className="secondary-button">
                    Preparar módulo
                </button>
            </div>

            <div className="module-grid">
                <article className="status-card">
                    <CheckCircle2 size={24} aria-hidden="true" />
                    <h3>Ruta configurada</h3>
                    <p>La pantalla ya está conectada a la navegación principal.</p>
                </article>

                <article className="status-card">
                    <Clock size={24} aria-hidden="true" />
                    <h3>Integración pendiente</h3>
                    <p>La lógica real se implementará en el módulo correspondiente.</p>
                </article>

                <article className="status-card">
                    <Hammer size={24} aria-hidden="true" />
                    <h3>Preparado para crecer</h3>
                    <p>El módulo queda listo para servicios, validaciones y pruebas.</p>
                </article>
            </div>

            <div className="details-card">
                <h3>Responsabilidad inicial</h3>
                <p>
                    Esta pantalla funciona como placeholder profesional. En siguientes módulos se agregará
                    lógica de negocio, formularios, servicios IPC, validaciones y persistencia local.
                </p>

                <dl className="metadata-list">
                    <div>
                        <dt>Ruta</dt>
                        <dd>{route.path}</dd>
                    </div>

                    <div>
                        <dt>Clave interna</dt>
                        <dd>{route.moduleKey}</dd>
                    </div>

                    <div>
                        <dt>Roles permitidos</dt>
                        <dd>{route.allowedRoles.map((role) => USER_ROLE_LABEL[role]).join(', ')}</dd>
                    </div>
                </dl>
            </div>
        </section>
    );
}