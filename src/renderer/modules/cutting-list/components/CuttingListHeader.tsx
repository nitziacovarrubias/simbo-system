import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CuttingListHeaderProps {
  projectId: string;
  projectName: string;
  clientName: string;
  designStatus: string;
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function CuttingListHeader(props: CuttingListHeaderProps): JSX.Element {
  return (
    <div className="module-page-header cutting-list-header">
      <div>
        <Link className="back-link" to={`/projects/${props.projectId}`}>
          <ArrowLeft size={17} aria-hidden="true" /> Volver al proyecto
        </Link>
        <p className="page-eyebrow">Manufactura</p>
        <h2 id="cutting-list-page-title">Despiece</h2>
        <p className="cutting-list-subtitle">
          <strong>{props.projectName}</strong> · {props.clientName} · Diseño: {props.designStatus}
        </p>
      </div>
      <button
        className="accent-button"
        type="button"
        disabled={!props.canGenerate || props.isGenerating}
        onClick={props.onGenerate}
      >
        <RefreshCw size={18} aria-hidden="true" />
        {props.isGenerating ? 'Generando...' : 'Generar lista de despiece'}
      </button>
    </div>
  );
}
