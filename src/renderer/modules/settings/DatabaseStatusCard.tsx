import { useEffect, useState } from 'react';
import type { DatabaseStatus, DashboardSummary } from '../../../shared/types';

export function DatabaseStatusCard(): JSX.Element {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadStatus(): Promise<void> {
    try {
      setErrorMessage(null);
      const [databaseStatus, dashboardSummary] = await Promise.all([
        window.simboApi.getDatabaseStatus(),
        window.simboApi.getDashboardSummary(),
      ]);
      setStatus(databaseStatus);
      setSummary(dashboardSummary);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo consultar la base de datos.');
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  return (
    <section aria-labelledby="database-status-title" className="database-status-card">
      <h2 id="database-status-title">Estado de base de datos</h2>

      {errorMessage ? <p role="alert">{errorMessage}</p> : null}

      <p>
        Estado:{' '}
        <strong>{status?.isConnected ? 'Conectada' : 'Sin conexión'}</strong>
      </p>
      <p>{status?.message ?? 'Consultando conexión...'}</p>

      {summary ? (
        <dl>
          <dt>Clientes activos</dt>
          <dd>{summary.clientsCount}</dd>
          <dt>Proyectos activos</dt>
          <dd>{summary.activeProjectsCount}</dd>
          <dt>Alertas abiertas</dt>
          <dd>{summary.openAlertsCount}</dd>
        </dl>
      ) : null}

      <button type="button" onClick={() => void loadStatus()}>
        Probar conexión
      </button>
    </section>
  );
}
