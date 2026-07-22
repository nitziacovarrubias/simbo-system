import { Copy, Trash2 } from 'lucide-react';
import type { DesignMaterialItem, DesignModuleMutationInput } from '@shared/types';
import { useEditorStore } from '@renderer/stores/editor.store';

interface SelectedModulePanelProps {
  materials: DesignMaterialItem[];
}

function NumberField({
  label,
  value,
  onChange,
  min
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}): JSX.Element {
  return (
    <label className="editor-field">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        step={10}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function SelectedModulePanel({ materials }: SelectedModulePanelProps): JSX.Element {
  const selectedModuleId = useEditorStore((state) => state.selectedModuleId);
  const selectedModule = useEditorStore((state) =>
    state.modules.find((module) => module.id === state.selectedModuleId)
  );
  const updateModule = useEditorStore((state) => state.updateModule);
  const removeModule = useEditorStore((state) => state.removeModule);
  const duplicateModule = useEditorStore((state) => state.duplicateModule);

  if (!selectedModule || !selectedModuleId) {
    return (
      <section className="selected-module-panel empty-selection">
        <h3>Propiedades del módulo</h3>
        <p>Selecciona un módulo en el espacio para editar sus medidas y apariencia.</p>
      </section>
    );
  }

  const update = (changes: Partial<DesignModuleMutationInput>): void =>
    updateModule(selectedModuleId, changes);

  return (
    <section className="selected-module-panel" aria-labelledby="selected-module-title">
      <div className="editor-panel-heading">
        <h3 id="selected-module-title">Propiedades del módulo</h3>
        {selectedModule.hasCollision ? <span className="collision-badge">Superpuesto</span> : null}
      </div>

      <label className="editor-field span-two">
        <span>Nombre</span>
        <input
          value={selectedModule.displayName}
          onChange={(event) => update({ displayName: event.target.value })}
        />
      </label>

      <div className="selected-module-grid">
        <NumberField
          label="Ancho"
          value={selectedModule.widthMm}
          min={1}
          onChange={(widthMm) => update({ widthMm })}
        />
        <NumberField
          label="Alto"
          value={selectedModule.heightMm}
          min={1}
          onChange={(heightMm) => update({ heightMm })}
        />
        <NumberField
          label="Profundidad"
          value={selectedModule.depthMm}
          min={1}
          onChange={(depthMm) => update({ depthMm })}
        />
        <NumberField
          label="Posición X"
          value={selectedModule.positionX}
          onChange={(positionX) => update({ positionX })}
        />
        <NumberField
          label="Posición Y"
          value={selectedModule.positionY}
          onChange={(positionY) => update({ positionY })}
        />
        <NumberField
          label="Posición Z"
          value={selectedModule.positionZ}
          onChange={(positionZ) => update({ positionZ })}
        />
        <label className="editor-field">
          <span>Rotación</span>
          <select
            value={selectedModule.rotationY}
            onChange={(event) => update({ rotationY: Number(event.target.value) })}
          >
            <option value={0}>0°</option>
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </label>
        <label className="editor-field">
          <span>Color</span>
          <input
            type="color"
            value={selectedModule.colorHex}
            onChange={(event) => update({ colorHex: event.target.value.toUpperCase() })}
          />
        </label>
      </div>

      <label className="editor-field span-two">
        <span>Material</span>
        <select
          value={selectedModule.materialId ?? ''}
          onChange={(event) => {
            const materialId = event.target.value || null;
            const material = materials.find((item) => item.id === materialId);
            update({ materialId, colorHex: material?.colorHex ?? selectedModule.colorHex });
          }}
        >
          <option value="">Sin material</option>
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>
      </label>

      <label className="editor-field span-two">
        <span>Notas</span>
        <textarea
          rows={3}
          value={selectedModule.notes}
          onChange={(event) => update({ notes: event.target.value })}
        />
      </label>

      <div className="selected-module-actions">
        <button
          type="button"
          className="secondary-link-button"
          onClick={() => duplicateModule(selectedModuleId)}
        >
          <Copy size={16} aria-hidden="true" /> Duplicar módulo
        </button>
        <button
          type="button"
          className="danger-button"
          onClick={() => removeModule(selectedModuleId)}
        >
          <Trash2 size={16} aria-hidden="true" /> Eliminar módulo
        </button>
      </div>
    </section>
  );
}
