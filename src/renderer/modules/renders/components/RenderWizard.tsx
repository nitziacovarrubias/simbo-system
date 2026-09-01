import type { RenderSettingsInput } from '@shared/types';
import {
  RENDER_IMAGE_FORMATS,
  RENDER_QUALITY_LEVELS,
  RENDER_RESOLUTION_PRESETS,
  RENDER_VIEW_TYPES
} from '@shared/constants/render-options';

const FORMAT_LABEL: Record<(typeof RENDER_IMAGE_FORMATS)[number], string> = {
  PNG: 'PNG',
  JPEG: 'JPEG'
};

const VIEW_LABEL: Record<(typeof RENDER_VIEW_TYPES)[number], string> = {
  ISOMETRIC: 'Isométrica',
  FRONT: 'Frontal',
  TOP: 'Planta',
  CUSTOM: 'Personalizada'
};

const QUALITY_LABEL: Record<(typeof RENDER_QUALITY_LEVELS)[number], string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  ULTRA: 'Ultra'
};

interface RenderWizardProps {
  value: RenderSettingsInput;
  onChange: (value: RenderSettingsInput) => void;
  onCancel: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generationLabel: string;
  errorMessage?: string;
}

export function RenderWizard({
  value,
  onChange,
  onCancel,
  onGenerate,
  isGenerating,
  generationLabel,
  errorMessage
}: RenderWizardProps): JSX.Element {
  const update = <K extends keyof RenderSettingsInput>(
    key: K,
    nextValue: RenderSettingsInput[K]
  ): void => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <form
      className="render-wizard"
      onSubmit={(event) => {
        event.preventDefault();
        onGenerate();
      }}
    >
      <div className="render-wizard-heading">
        <p className="render-kicker">Paso final</p>
        <h3>Finalizar render</h3>
        <p>Configura la imagen que se generará desde la escena 3D de SIMBO.</p>
      </div>

      <label>
        Título del render
        <input
          value={value.title}
          onChange={(event) => update('title', event.target.value)}
          maxLength={160}
          required
        />
      </label>

      <div className="render-wizard-grid">
        <label>
          Resolución
          <select
            value={value.resolution}
            onChange={(event) =>
              update('resolution', event.target.value as RenderSettingsInput['resolution'])
            }
          >
            {Object.entries(RENDER_RESOLUTION_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Formato
          <select
            value={value.imageFormat}
            onChange={(event) =>
              update('imageFormat', event.target.value as RenderSettingsInput['imageFormat'])
            }
          >
            {RENDER_IMAGE_FORMATS.map((format) => (
              <option key={format} value={format}>
                {FORMAT_LABEL[format]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tipo de vista
          <select
            value={value.viewType}
            onChange={(event) =>
              update('viewType', event.target.value as RenderSettingsInput['viewType'])
            }
          >
            {RENDER_VIEW_TYPES.map((view) => (
              <option key={view} value={view}>
                {VIEW_LABEL[view]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Calidad
          <select
            value={value.quality}
            onChange={(event) =>
              update('quality', event.target.value as RenderSettingsInput['quality'])
            }
          >
            {RENDER_QUALITY_LEVELS.map((quality) => (
              <option key={quality} value={quality}>
                {QUALITY_LABEL[quality]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Notas
        <textarea
          value={value.notes ?? ''}
          onChange={(event) => update('notes', event.target.value)}
          rows={4}
          maxLength={2000}
        />
      </label>

      {errorMessage ? (
        <div className="render-form-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {isGenerating ? (
        <div className="render-generation-status" role="status">
          {generationLabel}
        </div>
      ) : null}

      <div className="render-wizard-actions">
        <button
          className="render-secondary-button"
          type="button"
          onClick={onCancel}
          disabled={isGenerating}
        >
          Cancelar
        </button>
        <button className="render-primary-button" type="submit" disabled={isGenerating}>
          {isGenerating ? generationLabel : 'Generar render'}
        </button>
      </div>
    </form>
  );
}
