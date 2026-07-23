import { Pencil, Trash2 } from 'lucide-react';
import { EDGE_BANDING_LABELS } from '@shared/constants/edge-banding';
import { GRAIN_DIRECTION_LABELS } from '@shared/constants/grain-direction';
import type { CuttingPiece } from '@shared/types';

interface CuttingPieceTableProps {
  pieces: CuttingPiece[];
  isReadOnly: boolean;
  isRemoving: boolean;
  onEdit: (piece: CuttingPiece) => void;
  onRemove: (pieceId: string) => void;
}

export function CuttingPieceTable(props: CuttingPieceTableProps): JSX.Element {
  return (
    <div className="cutting-table-wrap">
      <table className="cutting-piece-table">
        <thead>
          <tr>
            <th>#</th><th>Módulo origen</th><th>Concepto / pieza</th><th>Cantidad</th>
            <th>Material</th><th>Espesor</th><th>Medidas</th><th>Veta</th><th>Canteado</th><th>Comentarios</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {props.pieces.map((piece, index) => (
            <tr key={piece.id}>
              <td>{index + 1}</td>
              <td>{piece.sourceModuleName}{piece.isManual ? <small className="manual-tag">Manual</small> : null}</td>
              <td><strong>{piece.pieceName}</strong><small>{piece.category}</small></td>
              <td>{piece.quantity}</td>
              <td>{piece.materialName}</td>
              <td>{piece.thicknessMm} mm</td>
              <td>{piece.widthMm} × {piece.heightMm}{piece.depthMm ? ` × ${piece.depthMm}` : ''} mm</td>
              <td>{GRAIN_DIRECTION_LABELS[piece.grainDirection]}</td>
              <td>{EDGE_BANDING_LABELS[piece.edgeBanding]}</td>
              <td>{piece.comments || 'Sin comentarios'}</td>
              <td>
                <div className="table-action-group">
                  <button type="button" className="icon-button" disabled={props.isReadOnly} onClick={() => props.onEdit(piece)} aria-label={`Editar ${piece.pieceName}`}><Pencil size={16} /></button>
                  <button type="button" className="icon-button danger" disabled={props.isReadOnly || props.isRemoving} onClick={() => props.onRemove(piece.id)} aria-label={`Eliminar ${piece.pieceName}`}><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
