import {
  ArrowLeft,
  Calculator,
  FileSpreadsheet
} from 'lucide-react';
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
    <header className="quote-header">
      <div className="quote-header__main">
        <div>
          <Link
            className="quote-back-link"
            to={`/projects/${projectId}`}
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Volver al proyecto
          </Link>

          <h2 id="quotes-page-title">Cotización</h2>
        </div>

        <button
          className="quote-generate-button"
          type="button"
          disabled={!canGenerate || isGenerating}
          onClick={onGenerate}
        >
          <Calculator size={18} aria-hidden="true" />
          {isGenerating ? 'Generando...' : 'Generar cotización'}
        </button>
      </div>

      <div className="quote-header__project">
        <strong>{projectName}</strong>
        <span>{clientName}</span>
        <span>Estado: {projectStatus}</span>
        <span className="quote-source-label">
          <FileSpreadsheet size={15} aria-hidden="true" />
          {cuttingListLabel}
        </span>
      </div>
    </header>
  );
}
