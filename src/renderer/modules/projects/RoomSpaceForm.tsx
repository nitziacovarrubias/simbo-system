import { Ruler, Save } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { roomSpaceSchema } from '@shared/schemas';
import type { RoomLayoutType, RoomSpace, RoomSpaceInput } from '@shared/types';
import { ROOM_LAYOUT_LABEL } from '@renderer/utils/domain-labels';
import { getFormErrors, type FormErrors } from '@renderer/utils/form-errors';
import { getErrorMessage } from '@renderer/utils/formatters';
import { useSaveRoomSpaceMutation } from './project.queries';
import './projects.css';

interface RoomSpaceFormState {
  layoutType: RoomLayoutType;
  widthMm: string;
  depthMm: string;
  heightMm: string;
  wallThicknessMm: string;
  notes: string;
}

interface RoomSpaceFormProps {
  projectId: string;
  initialRoomSpace: RoomSpace | null;
}

function createInitialState(roomSpace: RoomSpace | null): RoomSpaceFormState {
  return {
    layoutType: roomSpace?.layoutType ?? 'RECTANGULAR',
    widthMm: roomSpace ? String(roomSpace.widthMm) : '',
    depthMm: roomSpace ? String(roomSpace.depthMm) : '',
    heightMm: roomSpace ? String(roomSpace.heightMm) : '',
    wallThicknessMm:
      roomSpace?.wallThicknessMm !== null && roomSpace?.wallThicknessMm !== undefined
        ? String(roomSpace.wallThicknessMm)
        : '',
    notes: roomSpace?.notes ?? ''
  };
}

function fieldError(errors: FormErrors, field: keyof RoomSpaceFormState): JSX.Element | null {
  return errors[field] ? <span className="field-error">{errors[field]}</span> : null;
}

export function RoomSpaceForm({ projectId, initialRoomSpace }: RoomSpaceFormProps): JSX.Element {
  const saveMutation = useSaveRoomSpaceMutation(projectId);
  const [form, setForm] = useState<RoomSpaceFormState>(() => createInitialState(initialRoomSpace));
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setForm(createInitialState(initialRoomSpace));
  }, [initialRoomSpace]);

  function updateField<K extends keyof RoomSpaceFormState>(
    field: K,
    value: RoomSpaceFormState[K]
  ): void {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setSuccessMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const input: RoomSpaceInput = {
      layoutType: form.layoutType,
      widthMm: Number(form.widthMm),
      depthMm: Number(form.depthMm),
      heightMm: Number(form.heightMm),
      wallThicknessMm: form.wallThicknessMm ? Number(form.wallThicknessMm) : undefined,
      notes: form.notes.trim() || undefined,
      openings: initialRoomSpace?.openings ?? []
    };

    const result = roomSpaceSchema.safeParse(input);
    if (!result.success) {
      setErrors(getFormErrors(result.error));
      return;
    }

    setErrors({});
    try {
      await saveMutation.mutateAsync(result.data);
      setSuccessMessage(
        'Las medidas se guardaron correctamente. El proyecto está listo para continuar a diseño.'
      );
    } catch {
      setSuccessMessage('');
    }
  }

  return (
    <form className="project-room-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className="project-room-heading">
        <div className="project-room-icon">
          <Ruler size={28} aria-hidden="true" />
        </div>
        <div>
          <p>Captura de medidas</p>
          <h3>ESPACIO DEL PROYECTO</h3>
          <span>Registra las dimensiones físicas en milímetros para preparar el editor 2D/3D.</span>
        </div>
      </div>

      <div className="project-room-grid">
        <label className="project-room-span-two">
          Tipo de plano
          <select
            value={form.layoutType}
            onChange={(event) => updateField('layoutType', event.target.value as RoomLayoutType)}
          >
            {(Object.keys(ROOM_LAYOUT_LABEL) as RoomLayoutType[]).map((layoutType) => (
              <option key={layoutType} value={layoutType}>
                {ROOM_LAYOUT_LABEL[layoutType]}
              </option>
            ))}
          </select>
          {fieldError(errors, 'layoutType')}
        </label>

        <label>
          Ancho en mm
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={form.widthMm}
            onChange={(event) => updateField('widthMm', event.target.value)}
            aria-invalid={Boolean(errors.widthMm)}
          />
          {fieldError(errors, 'widthMm')}
        </label>

        <label>
          Largo / profundidad en mm
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={form.depthMm}
            onChange={(event) => updateField('depthMm', event.target.value)}
            aria-invalid={Boolean(errors.depthMm)}
          />
          {fieldError(errors, 'depthMm')}
        </label>

        <label>
          Alto en mm
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={form.heightMm}
            onChange={(event) => updateField('heightMm', event.target.value)}
            aria-invalid={Boolean(errors.heightMm)}
          />
          {fieldError(errors, 'heightMm')}
        </label>

        <label>
          Grosor de muro en mm
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={form.wallThicknessMm}
            onChange={(event) => updateField('wallThicknessMm', event.target.value)}
            aria-invalid={Boolean(errors.wallThicknessMm)}
          />
          {fieldError(errors, 'wallThicknessMm')}
        </label>

        <label className="project-room-span-two">
          Notas del espacio
          <textarea
            rows={4}
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            aria-invalid={Boolean(errors.notes)}
            placeholder="Ej. Espacio base para cocina integral"
          />
          {fieldError(errors, 'notes')}
        </label>
      </div>

      {saveMutation.isError ? (
        <div className="project-form-message project-form-message--error" role="alert">
          {getErrorMessage(saveMutation.error)}
        </div>
      ) : null}
      {successMessage ? (
        <div className="project-form-message project-form-message--success" role="status">
          {successMessage}
        </div>
      ) : null}

      <div className="project-room-actions">
        <button type="submit" disabled={saveMutation.isPending}>
          <Save size={18} aria-hidden="true" />
          {saveMutation.isPending ? 'Guardando...' : 'Guardar medidas'}
        </button>
      </div>

      {initialRoomSpace ? (
        <div className="project-room-summary" aria-label="Resumen de medidas guardadas">
          <h4>Resumen de medidas guardadas</h4>
          <div>
            <span>
              <strong>Plano:</strong> {ROOM_LAYOUT_LABEL[initialRoomSpace.layoutType]}
            </span>
            <span>
              <strong>Ancho:</strong> {initialRoomSpace.widthMm} mm
            </span>
            <span>
              <strong>Profundidad:</strong> {initialRoomSpace.depthMm} mm
            </span>
            <span>
              <strong>Alto:</strong> {initialRoomSpace.heightMm} mm
            </span>
            <span>
              <strong>Muro:</strong>{' '}
              {initialRoomSpace.wallThicknessMm
                ? `${initialRoomSpace.wallThicknessMm} mm`
                : 'No indicado'}
            </span>
            <span>
              <strong>Aberturas:</strong> {initialRoomSpace.openings.length}
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
