import { CheckCircle2, Circle, ListChecks } from 'lucide-react';

const steps = [
  { number: 1, label: 'Marcar espacio', complete: true },
  { number: 2, label: 'Agregar módulos', complete: true },
  { number: 3, label: 'Diseño', complete: false },
  { number: 4, label: 'Finalizar', complete: false }
];

export function DesignWizardSidebar(): JSX.Element {
  return (
    <aside className="design-wizard-sidebar" aria-label="Pasos del editor">
      <div className="design-wizard-title">
        <ListChecks size={19} aria-hidden="true" />
        <span>Lista detallada</span>
      </div>
      <ol>
        {steps.map((step) => (
          <li key={step.number} className={step.number === 3 ? 'is-active' : ''}>
            <span className="design-step-number">{step.number}</span>
            <span>{step.label}</span>
            {step.complete ? (
              <CheckCircle2 size={17} aria-label="Completado" />
            ) : (
              <Circle size={15} aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </aside>
  );
}
