import {
  ArrowLeft,
  BellRing,
  CalendarDays,
  ClipboardList,
  Edit3,
  History,
  Image,
  MapPin,
  MoveRight,
  UserRound,
  WalletCards
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PROJECT_STATUS_LABEL } from '@renderer/utils/domain-labels';
import { formatDate, getErrorMessage } from '@renderer/utils/formatters';
import { useProjectQuery } from './project.queries';
import { RoomSpaceForm } from './RoomSpaceForm';
import './projects.css';

export function ProjectDetailPage(): JSX.Element {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const projectQuery = useProjectQuery(projectId);

  if (projectQuery.isLoading) {
    return <section className="projects-state-card">Cargando detalle del proyecto...</section>;
  }

  if (projectQuery.isError || !projectQuery.data || !projectId) {
    return (
      <section className="projects-state-card projects-state-card--error" role="alert">
        {getErrorMessage(projectQuery.error)}
      </section>
    );
  }

  const project = projectQuery.data;

  return (
    <section className="project-detail-page" aria-labelledby="project-detail-title">
      <header className="project-detail-hero">
        <div>
          <Link className="project-detail-back" to="/projects">
            <ArrowLeft size={17} aria-hidden="true" /> Volver a proyectos
          </Link>
          <p>Expediente del proyecto</p>
          <h1 id="project-detail-title">{project.name}</h1>
          <span className={`project-detail-status status-${project.status.toLowerCase()}`}>
            {PROJECT_STATUS_LABEL[project.status]}
          </span>
        </div>

        <Link className="project-detail-edit" to={`/projects/${project.id}/edit`}>
          <Edit3 size={18} aria-hidden="true" /> Editar proyecto
        </Link>
      </header>

      <section className="project-detail-info" aria-label="Información del proyecto">
        <article>
          <h2>INFORMACIÓN GENERAL</h2>
          <dl>
            <div>
              <dt>
                <MapPin size={17} aria-hidden="true" /> Ubicación
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

        <article>
          <h2>DATOS DEL CLIENTE</h2>
          <dl>
            <div>
              <dt>
                <UserRound size={17} aria-hidden="true" /> Cliente
              </dt>
              <dd>
                <Link to={`/clients/${project.client.id}`}>{project.client.fullName}</Link>
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

        <article>
          <h2>RESPONSABILIDAD</h2>
          <dl>
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
      </section>

      <section className="project-room-wrapper" aria-labelledby="room-space-title">
        <h2 id="room-space-title" className="visually-hidden">
          Captura de medidas
        </h2>
        <RoomSpaceForm projectId={project.id} initialRoomSpace={project.roomSpace} />
      </section>

      <section className="project-modules-section" aria-labelledby="project-modules-title">
        <div className="project-modules-heading">
          <p>Flujo de trabajo</p>
          <h2 id="project-modules-title">CONTINUAR PROYECTO</h2>
        </div>

        <div className="project-module-grid">
          <article className="project-module-card">
            <div className="project-module-icon">
              <MoveRight size={26} aria-hidden="true" />
            </div>
            <h3>Diseño 2D/3D</h3>
            <p>
              {project.roomSpace
                ? 'Las medidas están guardadas. Puedes abrir el editor y continuar el diseño.'
                : 'Guarda primero las medidas para preparar el proyecto para diseño.'}
            </p>
            <button
              type="button"
              disabled={!project.roomSpace}
              onClick={() => navigate(`/projects/${project.id}/design`)}
            >
              Abrir diseño
            </button>
          </article>

          <article className="project-module-card">
            <div className="project-module-icon">
              <Image size={26} aria-hidden="true" />
            </div>
            <h3>Render</h3>
            <p>Genera y consulta imágenes de presentación a partir de la escena 3D guardada.</p>
            <button type="button" onClick={() => navigate(`/projects/${project.id}/renders`)}>
              Abrir renders
            </button>
          </article>

          <article className="project-module-card">
            <div className="project-module-icon">
              <ClipboardList size={26} aria-hidden="true" />
            </div>
            <h3>Despiece</h3>
            <p>Genera piezas desde el diseño guardado, valida la lista y exporta a Excel.</p>
            <button type="button" onClick={() => navigate(`/projects/${project.id}/cutting-list`)}>
              Abrir despiece
            </button>
          </article>

          <article className="project-module-card">
            <div className="project-module-icon">
              <WalletCards size={26} aria-hidden="true" />
            </div>
            <h3>Cotización</h3>
            <p>Calcula materiales, mano de obra, costos adicionales, IVA, anticipo y total.</p>
            <button type="button" onClick={() => navigate(`/projects/${project.id}/quotes`)}>
              Abrir cotización
            </button>
          </article>

          <article className="project-module-card">
            <div className="project-module-icon">
              <CalendarDays size={26} aria-hidden="true" />
            </div>
            <h3>Cronograma</h3>
            <p>Asigna responsables, controla fechas y consulta el avance general del proyecto.</p>
            <button type="button" onClick={() => navigate(`/projects/${project.id}/schedule`)}>
              Abrir cronograma
            </button>
          </article>

          <article className="project-module-card">
            <div className="project-module-icon">
              <BellRing size={26} aria-hidden="true" />
            </div>
            <h3>Alertas</h3>
            <p>Consulta incidencias, bloqueos y avisos relacionados con el expediente.</p>
            <button type="button" onClick={() => navigate(`/projects/${project.id}/alerts`)}>
              Ver alertas
            </button>
          </article>
        </div>
      </section>

      <section className="project-history-section" aria-labelledby="project-history-title">
        <div className="project-history-heading">
          <History size={22} aria-hidden="true" />
          <div>
            <p>Bitácora</p>
            <h2 id="project-history-title">HISTORIAL BÁSICO</h2>
          </div>
        </div>

        {project.history.length === 0 ? (
          <div className="projects-state-card">Todavía no hay movimientos registrados.</div>
        ) : (
          <ol className="project-history-list">
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
    </section>
  );
}
