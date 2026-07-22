import { Box, Plus } from 'lucide-react';
import type { ModuleTemplateItem } from '@shared/types';
import { useEditorStore } from '@renderer/stores/editor.store';

interface ModuleCatalogProps {
  templates: ModuleTemplateItem[];
}

export function ModuleCatalog({ templates }: ModuleCatalogProps): JSX.Element {
  const addModule = useEditorStore((state) => state.addModule);

  return (
    <section className="module-catalog" aria-labelledby="module-catalog-title">
      <div className="editor-panel-heading">
        <Box size={18} aria-hidden="true" />
        <h3 id="module-catalog-title">Catálogo de módulos</h3>
      </div>
      <div className="module-catalog-grid">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            className="module-template-button"
            onClick={() => addModule(template)}
          >
            <span className="module-template-icon">
              <Box size={22} aria-hidden="true" />
            </span>
            <span>
              <strong>{template.displayName}</strong>
              <small>
                {template.defaultWidthMm} × {template.defaultHeightMm} × {template.defaultDepthMm}{' '}
                mm
              </small>
            </span>
            <Plus size={17} aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}
