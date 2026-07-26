import { ArrowLeft, Calculator, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuoteHeaderProps {
  projectId: string;
  projectName: string;
  clientName: string;
  projectStatus: string;
  cuttingListLabel: string;
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function QuoteHeader({
  projectId,
  projectName,
  clientName,
  projectStatus,
  cuttingListLabel,
  canGenerate,
  isGenerating,
  onGenerate
}: QuoteHeaderProps): JSX.Element {
  return (
    <header className="module-page-header quote-header">
      <div>
        <Link className="back-link" to={`/projects/${projectId}`}>
          <ArrowLeft size={17} aria-hidden="true" /> Volver al proyecto
        </Link>
        <p className="page-eyebrow">Presupuesto del proyecto</p>
        <h2 id="quotes-page-title">Cotización</h2>
        <p className="quote-subtitle">
          <strong>{projectName}</strong> · {clientName} · Estado: {projectStatus}
        </p>
        <p className="quote-source-label">
          <FileSpreadsheet size={16} aria-hidden="true" /> {cuttingListLabel}
        </p>
      </div>
      <button
        className="accent-button"
        type="button"
        disabled={!canGenerate || isGenerating}
        onClick={onGenerate}
      >
        <Calculator size={18} aria-hidden="true" />
        {isGenerating ? 'Generando...' : 'Generar cotización'}
      </button>
    </header>
  );
}
