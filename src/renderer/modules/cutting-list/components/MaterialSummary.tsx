import type { MaterialCuttingSummary } from '@shared/types';

export function MaterialSummary({ summaries }: { summaries: MaterialCuttingSummary[] }): JSX.Element {
  return (
    <section className="cutting-summary-card" aria-labelledby="material-summary-title">
      <h3 id="material-summary-title">Totales por material</h3>
      {summaries.length === 0 ? (
        <p>No hay materiales calculados.</p>
      ) : (
        <div className="material-summary-grid">
          {summaries.map((summary) => (
            <article key={`${summary.materialId ?? 'manual'}-${summary.materialName}-${summary.thicknessMm}`}>
              <strong>{summary.materialName}</strong>
              <span>{summary.thicknessMm} mm</span>
              <small>{summary.totalQuantity} piezas · {summary.totalAreaSquareMeters} m²</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
