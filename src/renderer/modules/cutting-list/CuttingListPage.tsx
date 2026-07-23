import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, LockKeyhole } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { CuttingPiece, CuttingPieceInput } from '@shared/types';
import { getErrorMessage } from '@renderer/utils/formatters';
import { useProjectQuery } from '@renderer/modules/projects/project.queries';
import { CuttingListActions } from './components/CuttingListActions';
import { CuttingListHeader } from './components/CuttingListHeader';
import { CuttingListVersionSelector } from './components/CuttingListVersionSelector';
import { CuttingPieceForm } from './components/CuttingPieceForm';
import { CuttingPieceTable } from './components/CuttingPieceTable';
import { MaterialSummary } from './components/MaterialSummary';
import {
  useAddManualCuttingPieceMutation,
  useAuthorizeCuttingListMutation,
  useCuttingListQuery,
  useCuttingListsByProjectQuery,
  useExportCuttingListMutation,
  useGenerateCuttingListMutation,
  useRejectCuttingListMutation,
  useRemoveCuttingPieceMutation,
  useUpdateCuttingPieceMutation
} from './hooks/useCuttingListQueries';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING_VALIDATION: 'Pendiente de validación',
  AUTHORIZED: 'Autorizada',
  REJECTED: 'Rechazada',
  OUTDATED: 'Desactualizada'
};

export function CuttingListPage(): JSX.Element {
  const { projectId } = useParams();
  const projectQuery = useProjectQuery(projectId);
  const designQuery = useQuery({
    queryKey: ['design', projectId],
    queryFn: () => window.simboApi.getDesignByProjectId(projectId ?? ''),
    enabled: Boolean(projectId)
  });
  const materialsQuery = useQuery({ queryKey: ['materials'], queryFn: () => window.simboApi.listMaterials() });
  const listsQuery = useCuttingListsByProjectQuery(projectId);
  const [selectedId, setSelectedId] = useState('');
  const selectedQuery = useCuttingListQuery(selectedId || undefined);
  const [editingPiece, setEditingPiece] = useState<CuttingPiece | null>(null);
  const [showPieceForm, setShowPieceForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!selectedId && listsQuery.data?.[0]) setSelectedId(listsQuery.data[0].id);
  }, [listsQuery.data, selectedId]);

  const design = designQuery.data;
  const generateMutation = useGenerateCuttingListMutation(projectId ?? '', design?.id);
  const list = selectedQuery.data;
  const updateMutation = useUpdateCuttingPieceMutation(projectId ?? '', list?.id ?? '');
  const addMutation = useAddManualCuttingPieceMutation(projectId ?? '', list?.id ?? '');
  const removeMutation = useRemoveCuttingPieceMutation(projectId ?? '', list?.id ?? '');
  const authorizeMutation = useAuthorizeCuttingListMutation(projectId ?? '', list?.id ?? '');
  const rejectMutation = useRejectCuttingListMutation(projectId ?? '', list?.id ?? '');
  const exportMutation = useExportCuttingListMutation(projectId ?? '', list?.id ?? '');
  const busy = [updateMutation, addMutation, removeMutation, authorizeMutation, rejectMutation, exportMutation].some((mutation) => mutation.isPending);
  const error = [projectQuery.error, designQuery.error, listsQuery.error, selectedQuery.error, generateMutation.error, updateMutation.error, addMutation.error, removeMutation.error, authorizeMutation.error, rejectMutation.error, exportMutation.error].find(Boolean);
  const isReadOnly = list?.status === 'AUTHORIZED' || list?.status === 'OUTDATED';
  const canAuthorize = Boolean(list && list.pieces.length > 0 && !list.isDesignOutdated && list.status !== 'AUTHORIZED');

  const projectName = projectQuery.data?.name ?? 'Proyecto';
  const clientName = projectQuery.data?.client.fullName ?? 'Cliente';
  const designStatus = design ? `${design.status} · v${design.version}` : 'Sin diseño vigente';
  const lists = listsQuery.data ?? [];

  const selectedSummary = useMemo(() => lists.find((item) => item.id === selectedId), [lists, selectedId]);

  if (!projectId || projectQuery.isLoading || designQuery.isLoading || listsQuery.isLoading) {
    return <section className="page-panel state-card">Cargando módulo de despiece...</section>;
  }

  return (
    <section className="page-panel cutting-list-page" aria-labelledby="cutting-list-page-title">
      <CuttingListHeader
        projectId={projectId}
        projectName={projectName}
        clientName={clientName}
        designStatus={designStatus}
        canGenerate={Boolean(design)}
        isGenerating={generateMutation.isPending}
        onGenerate={() => {
          setMessage('');
          generateMutation.mutate(undefined, {
            onSuccess: (generated) => {
              setSelectedId(generated.id);
              setMessage('La lista fue generada correctamente');
            }
          });
        }}
      />

      {message ? <div className="state-card success-message" role="status">{message}</div> : null}
      {error ? <div className="state-card state-card-error" role="alert">{getErrorMessage(error)}</div> : null}

      {!design ? (
        <div className="state-card state-card-error"><AlertTriangle size={20} />El proyecto necesita un diseño guardado antes de generar el despiece.</div>
      ) : null}

      {lists.length === 0 ? (
        <div className="empty-cutting-state">
          <h3>Lista de despiece</h3>
          <p>Aún no existen versiones. Usa “Generar lista de despiece” para calcular las piezas del diseño vigente.</p>
        </div>
      ) : (
        <>
          <div className="cutting-version-bar">
            <CuttingListVersionSelector lists={lists} selectedId={selectedId} onChange={setSelectedId} />
            {selectedSummary ? <span className={`status-pill status-${selectedSummary.status.toLowerCase()}`}>{STATUS_LABELS[selectedSummary.status]}</span> : null}
          </div>

          {!selectedSummary?.isLatestVersion ? <div className="outdated-warning"><AlertTriangle size={18} />Esta no es la última versión del despiece.</div> : null}
          {list?.isDesignOutdated ? <div className="outdated-warning"><AlertTriangle size={18} />El diseño cambió después de generar esta lista.</div> : null}
          {list?.status === 'AUTHORIZED' ? <div className="authorized-lock"><LockKeyhole size={18} />No se puede editar una lista autorizada.</div> : null}

          {selectedQuery.isLoading || !list ? (
            <div className="state-card">Cargando versión...</div>
          ) : (
            <>
              <div className="cutting-list-meta">
                <div><span>Lista de despiece</span><strong>Versión {list.versionNumber}</strong></div>
                <div><span>Generada</span><strong>{new Date(list.generatedAt).toLocaleString('es-MX')}</strong></div>
                <div><span>Estado</span><strong>{STATUS_LABELS[list.status]}</strong></div>
                <div><span>Piezas</span><strong>{list.piecesCount}</strong></div>
              </div>

              {list.notes ? <div className="cutting-observations"><strong>Observaciones del generador</strong><pre>{list.notes}</pre></div> : null}
              {list.validationNotes ? <div className="cutting-observations"><strong>Nota de validación</strong><p>{list.validationNotes}</p></div> : null}

              <CuttingPieceTable
                pieces={list.pieces}
                isReadOnly={Boolean(isReadOnly)}
                isRemoving={removeMutation.isPending}
                onEdit={(piece) => { setEditingPiece(piece); setShowPieceForm(true); }}
                onRemove={(pieceId) => removeMutation.mutate(pieceId)}
              />

              <MaterialSummary summaries={list.materialSummary} />
              <CuttingListActions
                isReadOnly={Boolean(isReadOnly)}
                canAuthorize={canAuthorize}
                isBusy={busy}
                onAdd={() => { setEditingPiece(null); setShowPieceForm(true); }}
                onAuthorize={(notes) => authorizeMutation.mutate(notes, { onSuccess: () => setMessage('La lista fue autorizada correctamente.') })}
                onReject={(reason) => rejectMutation.mutate(reason, { onSuccess: () => setMessage('La lista fue rechazada.') })}
                onExport={() => exportMutation.mutate(undefined, { onSuccess: (result) => setMessage(`Excel exportado: ${result.filePath}`) })}
              />
            </>
          )}
        </>
      )}

      {showPieceForm && list ? (
        <CuttingPieceForm
          piece={editingPiece}
          materials={materialsQuery.data ?? []}
          isSaving={updateMutation.isPending || addMutation.isPending}
          onCancel={() => setShowPieceForm(false)}
          onSubmit={(input: CuttingPieceInput) => {
            if (editingPiece) {
              updateMutation.mutate({ pieceId: editingPiece.id, input }, { onSuccess: () => setShowPieceForm(false) });
            } else {
              addMutation.mutate(input, { onSuccess: () => setShowPieceForm(false) });
            }
          }}
        />
      ) : null}
    </section>
  );
}
