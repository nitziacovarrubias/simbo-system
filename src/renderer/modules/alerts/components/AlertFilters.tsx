import { AlertPriority } from '@shared/constants/alert-priority';
import { AlertStatus } from '@shared/constants/alert-status';
import { AlertType } from '@shared/constants/alert-type';
import { ALERT_PRIORITY_LABEL, ALERT_STATUS_LABEL, ALERT_TYPE_LABEL } from '@renderer/modules/schedule/schedule-labels';

export interface AlertFilterState {
  priority: 'ALL' | AlertPriority;
  status: 'ALL' | AlertStatus;
  type: 'ALL' | AlertType;
}

interface AlertFiltersProps {
  value: AlertFilterState;
  onChange: (value: AlertFilterState) => void;
}

export function AlertFilters({ value, onChange }: AlertFiltersProps): JSX.Element {
  return (
    <div className="alert-filters" aria-label="Filtros de alertas">
      <label><span>Prioridad</span><select value={value.priority} onChange={(event) => onChange({ ...value, priority: event.target.value as AlertFilterState['priority'] })}><option value="ALL">Todas</option>{Object.values(AlertPriority).map((priority) => <option key={priority} value={priority}>{ALERT_PRIORITY_LABEL[priority]}</option>)}</select></label>
      <label><span>Estado</span><select value={value.status} onChange={(event) => onChange({ ...value, status: event.target.value as AlertFilterState['status'] })}><option value="ALL">Todos</option>{Object.values(AlertStatus).map((status) => <option key={status} value={status}>{ALERT_STATUS_LABEL[status]}</option>)}</select></label>
      <label><span>Tipo</span><select value={value.type} onChange={(event) => onChange({ ...value, type: event.target.value as AlertFilterState['type'] })}><option value="ALL">Todos</option>{Object.values(AlertType).map((type) => <option key={type} value={type}>{ALERT_TYPE_LABEL[type]}</option>)}</select></label>
    </div>
  );
}
