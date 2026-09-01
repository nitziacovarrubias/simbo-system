import type { MaterialCuttingSummary } from '@shared/types';

export function MaterialSummary({
  summaries
}: {
  summaries: MaterialCuttingSummary[];
}): JSX.Element {
  return (
    <section
      className="cutting-summary-card"
      aria-labelledby="material-summary-title"
    >
      <div className="cutting-summary-heading">
        <div>
          <span>Materiales</span>
          <h3 id="material-summary-title">Tipo de madera utilizada</h3>
        </div>

        <p>
          Resumen calculado a partir de las piezas de esta versión del
          despiece.
        </p>
      </div>

      {summaries.length === 0 ? (
        <p className="cutting-summary-empty">
          No hay materiales calculados.
        </p>
      ) : (
        <div className="material-summary-grid">
          {summaries.map((summary, index) => (
            <article
              key={`${summary.materialId ?? 'manual'}-${summary.materialName}-${summary.thicknessMm}`}
              className="material-summary-item"
            >
              <div
                className={`material-summary-swatch material-summary-swatch--${(index % 4) + 1}`}
                aria-hidden="true"
              >
                <span>{summary.thicknessMm}</span>
                <small>mm</small>
              </div>

              <div className="material-summary-copy">
                <strong>{summary.materialName}</strong>
                <span>{summary.totalQuantity} piezas</span>
                <small>{summary.totalAreaSquareMeters} m²</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
