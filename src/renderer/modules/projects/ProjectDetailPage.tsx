import { ArrowLeft, BellRing, CalendarDays, ClipboardList, Edit3, History, MapPin, MoveRight, UserRound, WalletCards } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PROJECT_STATUS_LABEL } from '@renderer/utils/domain-labels';
import { formatDate, getErrorMessage } from '@renderer/utils/formatters';
import { useProjectQuery } from './project.queries';
import { RoomSpaceForm } from './RoomSpaceForm';

export function ProjectDetailPage(): JSX.Element {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projectQuery = useProjectQuery(projectId);

  if (projectQuery.isLoading) {
    return <section className="page-panel state-card">Cargando detalle del proyecto...</section>;
  }

  if (projectQuery.isError || !projectQuery.data || !projectId) {
    return (
      <section className="page-panel">
        <div className="state-card state-card-error" role="alert">
          {getErrorMessage(projectQuery.error)}
        </div>
      </section>
    );
  }

  const project = projectQuery.data;

  return (
    <section className="page-panel" aria-labelledby="project-detail-title">
      <div className="module-page-header">
        <div>
          <Link className="back-link" to="/projects">
            <ArrowLeft size={17} aria-hidden="true" /> Volver a proyectos
          </Link>
          <p className="page-eyebrow">Expediente del proyecto</p>
          <h2 id="project-detail-title">{project.name}</h2>
          <span className={`status-pill status-${project.status.toLowerCase()}`}>
            {PROJECT_STATUS_LABEL[project.status]}
          </span>
        </div>

        <Link className="secondary-link-button" to={`/projects/${project.id}/edit`}>
          <Edit3 size={18} aria-hidden="true" />
          Editar proyecto
        </Link>
      </div>

      <div className="detail-grid three-columns">
        <article className="detail-card">
          <h3>Información general</h3>
          <dl className="detail-list">
            <div>
              <dt>
                <MapPin size={16} aria-hidden="true" /> Ubicación
              </dt>
              <dd>{project.location ?? 'Sin ubicación'}</dd>
            </div>
            <div>
              <dt>Fecha de inicio</dt>
              <dd>{formatDate(project.startDate)}</dd>
            </div>
            <div>
              <dt>Entrega estimada</dt>
              <dd>{formatDate(project.deliveryDate)}</dd>
            </div>
            <div>
              <dt>Descripción</dt>
              <dd>{project.description ?? 'Sin descripción'}</dd>
            </div>
          </dl>
        </article>

        <article className="detail-card">
          <h3>Datos del cliente</h3>
          <dl className="detail-list">
            <div>
              <dt>
                <UserRound size={16} aria-hidden="true" /> Cliente
              </dt>
              <dd>
                <Link className="text-link" to={`/clients/${project.client.id}`}>
                  {project.client.fullName}
                </Link>
              </dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>{project.client.phone ?? 'Sin teléfono'}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{project.client.email ?? 'Sin correo'}</dd>
            </div>
            <div>
              <dt>Dirección del proyecto</dt>
              <dd>{project.client.projectAddress ?? 'Sin dirección'}</dd>
            </div>
          </dl>
        </article>

        <article className="detail-card">
          <h3>Responsabilidad</h3>
          <dl className="detail-list">
            <div>
              <dt>Responsable principal</dt>
              <dd>{project.mainResponsibleName ?? 'Sin responsable asignado'}</dd>
            </div>
            <div>
              <dt>Última actualización</dt>
              <dd>{formatDate(project.updatedAt)}</dd>
            </div>
          </dl>
        </article>
      </div>

      <section className="room-space-card" aria-labelledby="room-space-title">
        <h3 id="room-space-title" className="visually-hidden">
          Captura de medidas
        </h3>
        <RoomSpaceForm projectId={project.id} initialRoomSpace={project.roomSpace} />
      </section>

      <div className="continue-design-card">
        <div>
          <h3>Continuar a diseño</h3>
          <p>
            {project.roomSpace
              ? 'Las medidas están guardadas. Puedes abrir el editor 2D/3D y continuar el diseño.'
              : 'Guarda primero las medidas para preparar el proyecto para diseño.'}
          </p>
        </div>
        <button
          className="accent-button"
          type="button"
          disabled={!project.roomSpace}
          onClick={() => navigate(`/projects/${project.id}/design`)}
        >
          Continuar a diseño <MoveRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="continue-design-card">
        <div>
          <h3>Generar despiece</h3>
          <p>Abre la lista de despiece para generar piezas desde el diseño guardado, validar versiones y exportar a Excel.</p>
        </div>
        <button
          className="accent-button"
          type="button"
          onClick={() => navigate(`/projects/${project.id}/cutting-list`)}
        >
          Abrir despiece <ClipboardList size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="continue-design-card">
        <div>
          <h3>Generar cotización</h3>
          <p>Calcula materiales, mano de obra, costos adicionales, IVA, anticipo y total desde el despiece guardado.</p>
        </div>
        <button
          className="accent-button"
          type="button"
          onClick={() => navigate(`/projects/${project.id}/quotes`)}
        >
          Abrir cotización <WalletCards size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="continue-design-card">
        <div>
          <h3>Cronograma y alertas</h3>
          <p>Asigna responsables, controla fechas, registra incidencias y consulta el avance del proyecto.</p>
        </div>
        <div className="project-module-actions">
          <button className="accent-button" type="button" onClick={() => navigate(`/projects/${project.id}/schedule`)}>
            Abrir cronograma <CalendarDays size={18} aria-hidden="true" />
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate(`/projects/${project.id}/alerts`)}>
            Ver alertas <BellRing size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <p className="page-eyebrow">Bitácora</p>
          <h3>
            <History size={20} aria-hidden="true" /> Historial básico
          </h3>
        </div>
      </div>

      {project.history.length === 0 ? (
        <div className="state-card">Todavía no hay movimientos registrados.</div>
      ) : (
        <ol className="history-list">
          {project.history.map((entry) => (
            <li key={entry.id}>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.description ?? 'Sin descripción'}</p>
              </div>
              <time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
