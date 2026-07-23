import type { CuttingListSummary } from '@shared/types';

interface CuttingListVersionSelectorProps {
  lists: CuttingListSummary[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function CuttingListVersionSelector({ lists, selectedId, onChange }: CuttingListVersionSelectorProps): JSX.Element {
  return (
    <label className="cutting-version-selector">
      <span>Versión</span>
      <select value={selectedId} onChange={(event) => onChange(event.target.value)}>
        {lists.map((list) => (
          <option key={list.id} value={list.id}>
            Versión {list.versionNumber} · {list.status.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
    </label>
  );
}
