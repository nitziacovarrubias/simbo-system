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
    <header className="cutting-list-header">
      <div className="cutting-list-header__bar">
        <div>
          <Link className="cutting-back-link" to={`/projects/${props.projectId}`}>
            <ArrowLeft size={17} aria-hidden="true" />
            Volver al proyecto
          </Link>
          <h2 id="cutting-list-page-title">Despiece</h2>
        </div>

        <button
          className="cutting-generate-button"
          type="button"
          disabled={!props.canGenerate || props.isGenerating}
          onClick={props.onGenerate}
        >
          <RefreshCw size={18} aria-hidden="true" />
          {props.isGenerating ? 'Generando...' : 'Generar despiece'}
        </button>
      </div>

      <div className="cutting-list-header__project">
        <strong>{props.projectName}</strong>
        <span>{props.clientName}</span>
        <span>Diseño: {props.designStatus}</span>
      </div>
    </header>
  );
}
