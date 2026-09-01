import type { RenderSummary } from '@shared/types';

interface RenderVersionSelectorProps {
  renders: RenderSummary[];
  currentId: string;
  onSelect: (renderId: string) => void;
}

export function RenderVersionSelector({
  renders,
  currentId,
  onSelect
}: RenderVersionSelectorProps): JSX.Element {
  return (
    <label className="render-version-selector">
      <span className="visually-hidden">Versión</span>
      <select value={currentId} onChange={(event) => onSelect(event.target.value)}>
        {renders.map((render) => (
          <option key={render.id} value={render.id}>
            v{render.versionNumber} · {render.title}
            {render.isSourceOutdated ? ' · desactualizado' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
