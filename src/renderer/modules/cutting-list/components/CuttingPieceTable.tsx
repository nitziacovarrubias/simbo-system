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
            <th>#</th>
            <th>Concepto</th>
            <th>Cantidad</th>
            <th>Material</th>
            <th>Espesor</th>
            <th>Medidas (Ancho × Alto)</th>
            <th>Veta</th>
            <th>Canteado</th>
            <th>Comentarios</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>

        <tbody>
          {props.pieces.map((piece, index) => (
            <tr key={piece.id}>
              <td className="cutting-row-number">{index + 1}.</td>

              <td className="cutting-piece-name">
                <strong>{piece.pieceName}</strong>
                <small>
                  {piece.sourceModuleName}
                  {piece.isManual ? ' · Manual' : ''}
                </small>
              </td>

              <td>{piece.quantity}</td>
              <td>{piece.materialName}</td>
              <td>{piece.thicknessMm} mm</td>

              <td>
                {piece.widthMm} × {piece.heightMm}
                {piece.depthMm ? ` × ${piece.depthMm}` : ''} mm
              </td>

              <td>{GRAIN_DIRECTION_LABELS[piece.grainDirection]}</td>
              <td>{EDGE_BANDING_LABELS[piece.edgeBanding]}</td>
              <td className="cutting-comments-cell">
                {piece.comments || 'Sin comentarios'}
              </td>

              <td>
                <div className="cutting-table-actions">
                  <button
                    type="button"
                    className="cutting-icon-button"
                    disabled={props.isReadOnly}
                    onClick={() => props.onEdit(piece)}
                    aria-label={`Editar ${piece.pieceName}`}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="cutting-icon-button cutting-icon-button--danger"
                    disabled={props.isReadOnly || props.isRemoving}
                    onClick={() => props.onRemove(piece.id)}
                    aria-label={`Eliminar ${piece.pieceName}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
