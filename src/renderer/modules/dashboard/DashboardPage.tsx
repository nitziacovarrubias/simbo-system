import { useQuery } from '@tanstack/react-query';
import {
    BellRing,
    CalendarDays,
    ChartPie,
    CircleAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

export function DashboardPage(): JSX.Element {
    const navigate = useNavigate();

    const dashboardQuery = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: () => window.simboApi.getDashboardSummary()
    });

    const summary = dashboardQuery.data;

    return (
        <main className="dashboard-page">
            <section className="dashboard-hero">
                <div className="dashboard-hero-content">
                    <div className="dashboard-copy">
                        <h1>
                            Bienvenido a tu panel de
                            <br />
                            control.
                        </h1>

                        <span className="dashboard-divider" aria-hidden="true" />

                        <p>
                            Consulta el estado actual de tus proyectos y atiende lo
                            que necesita tu atención.
                        </p>

                        <button
                            type="button"
                            className="dashboard-control-button"
                            onClick={() => navigate('/projects')}
                        >
                            Ir a mi panel de control
                        </button>
                    </div>

                    <div className="dashboard-image" aria-hidden="true">
                        <div className="dashboard-image-overlay" />
                    </div>
                </div>
            </section>

            <section
                className="dashboard-metrics"
                aria-label="Resumen de proyectos"
            >
                {dashboardQuery.isLoading ? (
                    <div className="dashboard-state">
                        Cargando información del panel...
                    </div>
                ) : dashboardQuery.isError ? (
                    <div className="dashboard-state dashboard-state-error" role="alert">
                        No se pudo cargar el resumen del panel.
                    </div>
                ) : (
                    <>
                        <article className="dashboard-metric">
                            <BellRing size={52} strokeWidth={2.1} aria-hidden="true" />

                            <h2>Activos</h2>

                            <strong>
                                {summary?.activeProjectsCount ?? 0}
                            </strong>
                        </article>

                        <article className="dashboard-metric">
                            <ChartPie size={54} strokeWidth={2.1} aria-hidden="true" />

                            <h2>En producción</h2>

                            <strong>
                                {summary?.productionProjectsCount ?? 0}
                            </strong>
                        </article>

                        <article className="dashboard-metric">
                            <CalendarDays size={54} strokeWidth={2.1} aria-hidden="true" />

                            <h2>Por entregar esta semana</h2>

                            <strong>
                                {summary?.upcomingActivitiesCount ?? 0}
                            </strong>
                        </article>

                        <article className="dashboard-metric">
                            <CircleAlert size={54} strokeWidth={2.1} aria-hidden="true" />

                            <h2>Retrasados</h2>

                            <strong>
                                {summary?.overdueProjectsCount ?? 0}
                            </strong>
                        </article>
                    </>
                )}
            </section>
        </main>
    );
}