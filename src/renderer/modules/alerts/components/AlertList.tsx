import type { ProjectAlert } from '@shared/types';
import { AlertCard } from './AlertCard';

interface AlertListProps {
  alerts: ProjectAlert[];
  isBusy: boolean;
  onResolve: (alertId: string, notes: string) => void;
  onDismiss: (alertId: string, notes: string) => void;
}

export function AlertList({ alerts, isBusy, onResolve, onDismiss }: AlertListProps): JSX.Element {
  if (alerts.length === 0) return <div className="state-card"><h3>No hay alertas pendientes</h3><p>Las alertas atendidas o nuevas aparecerán aquí según los filtros.</p></div>;
  return <div className="alert-card-list">{alerts.map((alert) => <AlertCard key={alert.id} alert={alert} isBusy={isBusy} onResolve={onResolve} onDismiss={onDismiss} />)}</div>;
}
