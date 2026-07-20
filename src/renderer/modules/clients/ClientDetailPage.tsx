import { ArrowLeft, Edit3, FolderKanban, Mail, MapPin, Phone } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useClientQuery } from './client.queries';
import { CLIENT_STATUS_LABEL, PROJECT_STATUS_LABEL } from '@renderer/utils/domain-labels';
import { formatDate, getErrorMessage } from '@renderer/utils/formatters';

export function ClientDetailPage(): JSX.Element {
  const { clientId } = useParams();
  const clientQuery = useClientQuery(clientId);

  if (clientQuery.isLoading) {
    return <section className="page-panel state-card">Cargando detalle del cliente...</section>;
  }

  if (clientQuery.isError || !clientQuery.data) {
    return (
      <section className="page-panel">
        <div className="state-card state-card-error" role="alert">
          {getErrorMessage(clientQuery.error)}
        </div>
      </section>
    );
  }

  const client = clientQuery.data;

  return (
    <section className="page-panel" aria-labelledby="client-detail-title">
      <div className="module-page-header">
        <div>
          <Link className="back-link" to="/clients">
            <ArrowLeft size={17} aria-hidden="true" /> Volver a clientes
          </Link>
          <p className="page-eyebrow">Detalle del cliente</p>
          <h2 id="client-detail-title">{client.fullName}</h2>
          <span className={`status-pill status-${client.status.toLowerCase()}`}>
            {CLIENT_STATUS_LABEL[client.status]}
          </span>
        </div>

        <Link className="secondary-link-button" to={`/clients/${client.id}/edit`}>
          <Edit3 size={18} aria-hidden="true" />
          Editar cliente
        </Link>
      </div>

      <div className="detail-grid">
        <article className="detail-card">
          <h3>Información personal</h3>
          <dl className="detail-list">
            <div>
              <dt>
                <Phone size={16} aria-hidden="true" /> Teléfono
              </dt>
              <dd>{client.phone ?? 'Sin teléfono'}</dd>
            </div>
            <div>
              <dt>
                <Mail size={16} aria-hidden="true" /> Correo
              </dt>
              <dd>{client.email ?? 'Sin correo'}</dd>
            </div>
            <div>
              <dt>
                <MapPin size={16} aria-hidden="true" /> Dirección
              </dt>
              <dd>{client.address ?? 'Sin dirección'}</dd>
            </div>
            <div>
              <dt>RFC</dt>
              <dd>{client.rfc ?? 'Sin RFC'}</dd>
            </div>
          </dl>
        </article>

        <article className="detail-card">
          <h3>Datos del cliente</h3>
          <dl className="detail-list">
            <div>
              <dt>Dirección del proyecto</dt>
              <dd>{client.projectAddress ?? 'Sin dirección de proyecto'}</dd>
            </div>
            <div>
              <dt>Contacto inicial</dt>
              <dd>{formatDate(client.initialContactDate)}</dd>
            </div>
            <div>
              <dt>Notas</dt>
              <dd>{client.notes ?? 'Sin notas'}</dd>
            </div>
          </dl>
        </article>
      </div>

      <div className="section-heading">
        <div>
          <p className="page-eyebrow">Relación</p>
          <h3>Proyectos asociados</h3>
        </div>
        <Link className="text-link" to={`/projects/new?clientId=${client.id}`}>
          <FolderKanban size={17} aria-hidden="true" /> Crear proyecto
        </Link>
      </div>

      {client.projects.length === 0 ? (
        <div className="state-card">Este cliente todavía no tiene proyectos asociados.</div>
      ) : (
        <div className="cards-list">
          {client.projects.map((project) => (
            <Link className="project-summary-card" key={project.id} to={`/projects/${project.id}`}>
              <div>
                <strong>{project.name}</strong>
                <span>{project.location ?? 'Sin ubicación'}</span>
              </div>
              <div>
                <span className={`status-pill status-${project.status.toLowerCase()}`}>
                  {PROJECT_STATUS_LABEL[project.status]}
                </span>
                <small>Entrega: {formatDate(project.deliveryDate)}</small>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
