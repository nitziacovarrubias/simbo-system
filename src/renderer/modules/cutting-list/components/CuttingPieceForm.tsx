import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { EDGE_BANDING_OPTIONS, EDGE_BANDING_LABELS } from '@shared/constants/edge-banding';
import { GRAIN_DIRECTIONS, GRAIN_DIRECTION_LABELS } from '@shared/constants/grain-direction';
import type { CuttingPiece, CuttingPieceInput, MaterialListItem } from '@shared/types';

interface CuttingPieceFormProps {
  piece: CuttingPiece | null;
  materials: MaterialListItem[];
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (input: CuttingPieceInput) => void;
}

function initialInput(piece: CuttingPiece | null): CuttingPieceInput {
  return piece
    ? {
        sourceModuleId: piece.sourceModuleId,
        sourceModuleName: piece.sourceModuleName,
        pieceName: piece.pieceName,
        category: piece.category,
        quantity: piece.quantity,
        materialId: piece.materialId,
        materialName: piece.materialName,
        thicknessMm: piece.thicknessMm,
        widthMm: piece.widthMm,
        heightMm: piece.heightMm,
        depthMm: piece.depthMm,
        grainDirection: piece.grainDirection,
        edgeBanding: piece.edgeBanding,
        comments: piece.comments,
        sortOrder: piece.sortOrder
      }
    : {
        sourceModuleId: null,
        sourceModuleName: 'Pieza manual',
        pieceName: '',
        category: 'Manual',
        quantity: 1,
        materialId: null,
        materialName: '',
        thicknessMm: 18,
        widthMm: 1,
        heightMm: 1,
        depthMm: null,
        grainDirection: 'NONE',
        edgeBanding: 'NONE',
        comments: '',
        sortOrder: 999
      };
}

export function CuttingPieceForm(props: CuttingPieceFormProps): JSX.Element {
  const [input, setInput] = useState<CuttingPieceInput>(() => initialInput(props.piece));

  useEffect(() => {
    setInput(initialInput(props.piece));
  }, [props.piece]);

  function updateNumber(field: 'quantity' | 'thicknessMm' | 'widthMm' | 'heightMm' | 'depthMm', value: string): void {
    const parsed = value === '' ? null : Number(value);
    setInput((current) => {
      if (field === 'depthMm') return { ...current, depthMm: parsed };
      if (field === 'quantity') return { ...current, quantity: parsed ?? 0 };
      if (field === 'thicknessMm') return { ...current, thicknessMm: parsed ?? 0 };
      if (field === 'widthMm') return { ...current, widthMm: parsed ?? 0 };
      return { ...current, heightMm: parsed ?? 0 };
    });
  }

  function selectMaterial(materialId: string): void {
    const material = props.materials.find((item) => item.id === materialId);
    setInput((current) => ({
      ...current,
      materialId: material?.id ?? null,
      materialName: material?.name ?? '',
      thicknessMm: material?.thicknessMm ?? current.thicknessMm
    }));
  }

  return (
    <div className="cutting-form-backdrop" role="presentation">
      <section className="cutting-piece-form" role="dialog" aria-modal="true" aria-labelledby="cutting-piece-form-title">
        <header>
          <div>
            <p className="page-eyebrow">{props.piece ? 'Edición puntual' : 'Nueva pieza'}</p>
            <h3 id="cutting-piece-form-title">{props.piece ? 'Editar pieza' : 'Agregar pieza manual'}</h3>
          </div>
          <button className="icon-button" type="button" onClick={props.onCancel} aria-label="Cerrar formulario"><X size={20} /></button>
        </header>

        <form
          className="cutting-form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            props.onSubmit(input);
          }}
        >
          <label>Módulo origen<input value={input.sourceModuleName} onChange={(event) => setInput({ ...input, sourceModuleName: event.target.value })} required /></label>
          <label>Nombre de pieza<input value={input.pieceName} onChange={(event) => setInput({ ...input, pieceName: event.target.value })} required /></label>
          <label>Categoría<input value={input.category} onChange={(event) => setInput({ ...input, category: event.target.value })} required /></label>
          <label>Cantidad<input type="number" min="1" step="1" value={input.quantity} onChange={(event) => updateNumber('quantity', event.target.value)} required /></label>
          <label>Material<select value={input.materialId ?? ''} onChange={(event) => selectMaterial(event.target.value)} required><option value="">Selecciona material</option>{props.materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}</select></label>
          <label>Espesor (mm)<input type="number" min="0" step="0.1" value={input.thicknessMm} onChange={(event) => updateNumber('thicknessMm', event.target.value)} required /></label>
          <label>Ancho (mm)<input type="number" min="0.1" step="0.1" value={input.widthMm} onChange={(event) => updateNumber('widthMm', event.target.value)} required /></label>
          <label>Alto (mm)<input type="number" min="0.1" step="0.1" value={input.heightMm} onChange={(event) => updateNumber('heightMm', event.target.value)} required /></label>
          <label>Profundidad (mm, opcional)<input type="number" min="0.1" step="0.1" value={input.depthMm ?? ''} onChange={(event) => updateNumber('depthMm', event.target.value)} /></label>
          <label>Orientación de veta<select value={input.grainDirection} onChange={(event) => setInput({ ...input, grainDirection: event.target.value as CuttingPieceInput['grainDirection'] })}>{GRAIN_DIRECTIONS.map((direction) => <option key={direction} value={direction}>{GRAIN_DIRECTION_LABELS[direction]}</option>)}</select></label>
          <label>Canteado<select value={input.edgeBanding} onChange={(event) => setInput({ ...input, edgeBanding: event.target.value as CuttingPieceInput['edgeBanding'] })}>{EDGE_BANDING_OPTIONS.map((edge) => <option key={edge} value={edge}>{EDGE_BANDING_LABELS[edge]}</option>)}</select></label>
          <label className="full-width">Comentarios<textarea rows={3} value={input.comments ?? ''} onChange={(event) => setInput({ ...input, comments: event.target.value })} /></label>
          <div className="form-actions full-width">
            <button type="button" className="secondary-link-button" onClick={props.onCancel}>Cancelar</button>
            <button type="submit" className="accent-button" disabled={props.isSaving}>{props.isSaving ? 'Guardando...' : 'Guardar pieza'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
