import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, LockKeyhole } from 'lucide-react';
import { useParams } from 'react-router-dom';
import type { QuoteItem, QuoteItemInput } from '@shared/types';
import { useProjectQuery } from '@renderer/modules/projects/project.queries';
import { useCuttingListsByProjectQuery } from '@renderer/modules/cutting-list/hooks/useCuttingListQueries';
import { PROJECT_STATUS_LABEL } from '@renderer/utils/domain-labels';
import { getErrorMessage } from '@renderer/utils/formatters';
import { QuoteActions } from './components/QuoteActions';
import { QuoteHeader } from './components/QuoteHeader';
import { QuoteItemForm } from './components/QuoteItemForm';
import { QuoteItemTable } from './components/QuoteItemTable';
import { QuoteStatusBadge } from './components/QuoteStatusBadge';
import { QuoteSummaryPanel } from './components/QuoteSummaryPanel';
import { QuoteVersionSelector } from './components/QuoteVersionSelector';
import {
  useAddQuoteItemMutation,
  useApproveQuoteMutation,
  useExportQuoteMutation,
  useGenerateQuoteMutation,
  useQuoteQuery,
  useQuotesByProjectQuery,
  useRejectQuoteMutation,
  useRemoveQuoteItemMutation,
  useUpdateQuoteAdjustmentsMutation,
  useUpdateQuoteItemMutation
} from './hooks/useQuoteQueries';

export function QuotesPage(): JSX.Element {
  const { projectId } = useParams();
  const projectQuery = useProjectQuery(projectId);
  const cuttingListsQuery = useCuttingListsByProjectQuery(projectId);
  const quotesQuery = useQuotesByProjectQuery(projectId);
  const [selectedId, setSelectedId] = useState('');
  const selectedQuery = useQuoteQuery(selectedId || undefined);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!selectedId && quotesQuery.data?.[0]) {
      setSelectedId(quotesQuery.data[0].id);
    }
  }, [quotesQuery.data, selectedId]);

  const eligibleCuttingList = useMemo(() => {
    const lists = cuttingListsQuery.data ?? [];
    return (
      lists.find((list) => list.status === 'AUTHORIZED') ??
      lists.find((list) => list.status === 'PENDING_VALIDATION')
    );
  }, [cuttingListsQuery.data]);

  const generateMutation = useGenerateQuoteMutation(projectId ?? '');
  const quote = selectedQuery.data;
  const updateItemMutation = useUpdateQuoteItemMutation(projectId ?? '', quote?.id ?? '');
  const addItemMutation = useAddQuoteItemMutation(projectId ?? '', quote?.id ?? '');
  const removeItemMutation = useRemoveQuoteItemMutation(projectId ?? '', quote?.id ?? '');
  const adjustmentsMutation = useUpdateQuoteAdjustmentsMutation(projectId ?? '', quote?.id ?? '');
  const approveMutation = useApproveQuoteMutation(projectId ?? '', quote?.id ?? '');
  const rejectMutation = useRejectQuoteMutation(projectId ?? '', quote?.id ?? '');
  const exportMutation = useExportQuoteMutation(projectId ?? '', quote?.id ?? '');

  const busy = [
    updateItemMutation,
    addItemMutation,
    removeItemMutation,
    adjustmentsMutation,
    approveMutation,
    rejectMutation,
    exportMutation
  ].some((mutation) => mutation.isPending);

  const error = [
    projectQuery.error,
    cuttingListsQuery.error,
    quotesQuery.error,
    selectedQuery.error,
    generateMutation.error,
    updateItemMutation.error,
    addItemMutation.error,
    removeItemMutation.error,
    adjustmentsMutation.error,
    approveMutation.error,
    rejectMutation.error,
    exportMutation.error
  ].find(Boolean);

  const quotes = quotesQuery.data ?? [];
  const selectedSummary = quotes.find((item) => item.id === selectedId);
  const isReadOnly = quote?.status === 'APPROVED' || quote?.status === 'OUTDATED';
  const canApprove = Boolean(
    quote &&
    quote.items.length > 0 &&
    !quote.isSourceOutdated &&
    ['DRAFT', 'PENDING'].includes(quote.status)
  );

  if (!projectId || projectQuery.isLoading || cuttingListsQuery.isLoading || quotesQuery.isLoading) {
    return <section className="page-panel state-card">Cargando módulo de cotización...</section>;
  }

  const project = projectQuery.data;
  if (!project) {
    return <section className="page-panel state-card state-card-error">No se encontró el proyecto.</section>;
  }

  const cuttingListLabel = eligibleCuttingList
    ? `Despiece v${eligibleCuttingList.versionNumber} · ${eligibleCuttingList.status === 'AUTHORIZED' ? 'Autorizado' : 'Pendiente de validación'}`
    : 'Primero genera una lista de despiece';

  return (
    <section className="page-panel quotes-page" aria-labelledby="quotes-page-title">
      <QuoteHeader
        projectId={projectId}
        projectName={project.name}
        clientName={project.client.fullName}
        projectStatus={PROJECT_STATUS_LABEL[project.status]}
        cuttingListLabel={cuttingListLabel}
        canGenerate={Boolean(eligibleCuttingList)}
        isGenerating={generateMutation.isPending}
        onGenerate={() => {
          setMessage('');
          generateMutation.mutate(undefined, {
            onSuccess: (generated) => {
              setSelectedId(generated.id);
              setMessage('La cotización fue generada correctamente');
            }
          });
        }}
      />

      {message ? <div className="state-card success-message" role="status">{message}</div> : null}
      {error ? <div className="state-card state-card-error" role="alert">{getErrorMessage(error)}</div> : null}

      {!eligibleCuttingList ? (
        <div className="state-card state-card-error">
          <AlertTriangle size={20} aria-hidden="true" /> Primero genera una lista de despiece para crear la cotización.
        </div>
      ) : eligibleCuttingList.status === 'PENDING_VALIDATION' ? (
        <div className="outdated-warning">
          <AlertTriangle size={18} aria-hidden="true" /> Esta cotización se generará con una lista de despiece pendiente de validación.
        </div>
      ) : null}

      {quotes.length === 0 ? (
        <div className="empty-quote-state">
          <h3>Cotización</h3>
          <p>Aún no existen versiones. Usa “Generar cotización” para calcular materiales, mano de obra, IVA y anticipo.</p>
        </div>
      ) : (
        <>
          <div className="quote-version-bar">
            <QuoteVersionSelector quotes={quotes} selectedId={selectedId} onChange={setSelectedId} />
            {selectedSummary ? <QuoteStatusBadge status={selectedSummary.status} /> : null}
          </div>

          {!selectedSummary?.isLatestVersion ? (
            <div className="outdated-warning"><AlertTriangle size={18} />Esta no es la versión vigente de la cotización.</div>
          ) : null}
          {quote?.isSourceOutdated ? (
            <div className="outdated-warning"><AlertTriangle size={18} />Esta cotización está desactualizada.</div>
          ) : null}
          {quote?.status === 'APPROVED' ? (
            <div className="authorized-lock"><LockKeyhole size={18} />No se puede editar una cotización aprobada.</div>
          ) : null}

          {selectedQuery.isLoading || !quote ? (
            <div className="state-card">Cargando versión...</div>
          ) : (
            <>
              <div className="quote-meta-grid">
                <div><span>Versión</span><strong>{quote.versionNumber}</strong></div>
                <div><span>Estado</span><strong><QuoteStatusBadge status={quote.status} /></strong></div>
                <div><span>Generada</span><strong>{new Date(quote.generatedAt).toLocaleString('es-MX')}</strong></div>
                <div><span>Despiece origen</span><strong>{quote.cuttingListVersion ? `v${quote.cuttingListVersion}` : 'No vinculado'}</strong></div>
              </div>

              {quote.generationWarnings.map((warning) => (
                <div className="outdated-warning" key={warning}>
                  <AlertTriangle size={18} aria-hidden="true" /> {warning}
                </div>
              ))}

              {quote.clientDecisionNotes ? (
                <div className="quote-decision-note">
                  <strong>Nota de decisión del cliente</strong>
                  <p>{quote.clientDecisionNotes}</p>
                </div>
              ) : null}

              <div className="quote-content-grid">
                <div className="quote-concepts-column">
                  <div className="section-heading">
                    <div>
                      <p className="page-eyebrow">Conceptos</p>
                      <h3>Materiales y servicios</h3>
                    </div>
                  </div>
                  <QuoteItemTable
                    items={quote.items}
                    currency={quote.currency}
                    isReadOnly={Boolean(isReadOnly)}
                    isRemoving={removeItemMutation.isPending}
                    onEdit={(item) => {
                      setEditingItem(item);
                      setShowItemForm(true);
                    }}
                    onRemove={(itemId) => removeItemMutation.mutate(itemId)}
                  />
                </div>

                <QuoteSummaryPanel
                  quote={quote}
                  isReadOnly={Boolean(isReadOnly)}
                  isSaving={adjustmentsMutation.isPending}
                  onSave={(input) => adjustmentsMutation.mutate(input, {
                    onSuccess: () => setMessage('Los cambios de la cotización fueron guardados.')
                  })}
                />
              </div>

              <QuoteActions
                key={quote.id}
                isReadOnly={Boolean(isReadOnly)}
                canApprove={canApprove}
                canExport={quote.items.length > 0}
                isBusy={busy}
                onAdd={() => {
                  setEditingItem(null);
                  setShowItemForm(true);
                }}
                onApprove={(notes) => approveMutation.mutate(notes, {
                  onSuccess: () => setMessage('La cotización fue aprobada correctamente.')
                })}
                onReject={(reason) => rejectMutation.mutate(reason, {
                  onSuccess: () => setMessage('La cotización fue rechazada.')
                })}
                onExport={() => exportMutation.mutate(undefined, {
                  onSuccess: (result) => setMessage(`Excel exportado: ${result.filePath}`)
                })}
              />
            </>
          )}
        </>
      )}

      {showItemForm && quote ? (
        <QuoteItemForm
          item={editingItem}
          isSaving={updateItemMutation.isPending || addItemMutation.isPending}
          onCancel={() => setShowItemForm(false)}
          onSubmit={(input: QuoteItemInput) => {
            if (editingItem) {
              updateItemMutation.mutate(
                { itemId: editingItem.id, input },
                { onSuccess: () => setShowItemForm(false) }
              );
            } else {
              addItemMutation.mutate(input, { onSuccess: () => setShowItemForm(false) });
            }
          }}
        />
      ) : null}
    </section>
  );
}
