import {
  CalendarDays,
  Filter,
  FolderKanban,
  FolderPlus,
  MapPin,
  Ruler,
  Search,
  UserRound
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProjectStatus } from '@shared/constants/domain.enums';
import { ACTIVE_PROJECT_STATUSES, PROJECT_STATUS_LABEL } from '@renderer/utils/domain-labels';
import { formatDate, getErrorMessage } from '@renderer/utils/formatters';
import { useProjectsQuery } from './project.queries';
import './projects.css';

type ProjectFilter = 'ALL' | 'ACTIVE' | 'FINISHED' | ProjectStatus;

const FINISHED_STATUSES = [ProjectStatus.CLOSED, ProjectStatus.ARCHIVED];

export function ProjectsPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectFilter>('ALL');
  const projectsQuery = useProjectsQuery();

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (projectsQuery.data ?? []).filter((project) => {
      const matchesSearch =
        !term ||
        [project.name, project.clientName, project.location ?? '']
          .join(' ')
          .toLowerCase()
          .includes(term);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && ACTIVE_PROJECT_STATUSES.includes(project.status)) ||
        (statusFilter === 'FINISHED' && FINISHED_STATUSES.includes(project.status)) ||
        project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projectsQuery.data, search, statusFilter]);

  const activeProjects = useMemo(
    () => filteredProjects.filter((project) => ACTIVE_PROJECT_STATUSES.includes(project.status)),
    [filteredProjects]
  );

  const finishedProjects = useMemo(
    () => filteredProjects.filter((project) => FINISHED_STATUSES.includes(project.status)),
    [filteredProjects]
  );

  const activeStatusSummary = useMemo(() => {
    return Object.values(ProjectStatus)
      .filter((status) => ACTIVE_PROJECT_STATUSES.includes(status))
      .map((status) => ({
        status,
        count: (projectsQuery.data ?? []).filter((project) => project.status === status).length
      }))
      .filter((item) => item.count > 0)
      .slice(0, 4);
  }, [projectsQuery.data]);

  return (
    <section className="projects-design-page" aria-labelledby="projects-title">
      <header className="projects-hero">
        <div>
          <p className="projects-hero-kicker">Gestión de proyectos</p>
          <h1 id="projects-title">LISTADO DE PROYECTOS</h1>
          <p>
            Este es tu flujo de actividad actual. Consulta el estado de cada proyecto y continúa
            con las tareas pendientes.
          </p>
        </div>

        <Link className="projects-new-button" to="/projects/new">
          <FolderPlus size={19} aria-hidden="true" />
          Nuevo proyecto
        </Link>
      </header>

      <div className="projects-toolbar" aria-label="Filtros de proyectos">
        <label className="projects-search" htmlFor="project-search">
          <Search size={18} aria-hidden="true" />
          <input
            id="project-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar proyecto, cliente o ubicación"
          />
        </label>

        <label className="projects-filter" htmlFor="project-status-filter">
          <Filter size={18} aria-hidden="true" />
          <select
            id="project-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ProjectFilter)}
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Proyectos activos</option>
            <option value="FINISHED">Proyectos finalizados</option>
            {Object.values(ProjectStatus).map((status) => (
              <option key={status} value={status}>
                {PROJECT_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>

        <span className="projects-result-count">{filteredProjects.length} proyecto(s)</span>
      </div>

      {projectsQuery.isLoading ? (
        <div className="projects-state-card">Cargando proyectos...</div>
      ) : null}

      {projectsQuery.isError ? (
        <div className="projects-state-card projects-state-card--error" role="alert">
          {getErrorMessage(projectsQuery.error)}
        </div>
      ) : null}

      {!projectsQuery.isLoading && !projectsQuery.isError ? (
        <>
          <section className="projects-section projects-section--active" aria-labelledby="active-projects-title">
            <div className="projects-section-heading">
              <h2 id="active-projects-title">PROYECTOS ACTIVOS</h2>

              {activeStatusSummary.length > 0 ? (
                <div className="projects-status-summary" aria-label="Resumen de estados activos">
                  {activeStatusSummary.map(({ status, count }) => (
                    <span key={status}>
                      <strong>{PROJECT_STATUS_LABEL[status]}:</strong> {count}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {activeProjects.length === 0 ? (
              <div className="projects-state-card">
                <h3>No hay proyectos activos para mostrar</h3>
                <p>Cambia los filtros o crea un proyecto nuevo.</p>
              </div>
            ) : (
              <div className="projects-active-grid">
                {activeProjects.map((project, index) => (
                  <article className="projects-active-card" key={project.id}>
                    <div className={`projects-status-ribbon status-${project.status.toLowerCase()}`}>
                      <FolderKanban size={18} aria-hidden="true" />
                      {PROJECT_STATUS_LABEL[project.status]}
                    </div>

                    <div className="projects-active-card-copy">
                      <h3>{project.name}</h3>

                      <dl>
                        <div>
                          <dt>
                            <UserRound size={15} aria-hidden="true" /> Cliente
                          </dt>
                          <dd>{project.clientName}</dd>
                        </div>
                        <div>
                          <dt>
                            <MapPin size={15} aria-hidden="true" /> Ubicación
                          </dt>
                          <dd>{project.location ?? 'Sin ubicación'}</dd>
                        </div>
                        <div>
                          <dt>
                            <CalendarDays size={15} aria-hidden="true" /> Entrega
                          </dt>
                          <dd>{formatDate(project.deliveryDate)}</dd>
                        </div>
                      </dl>

                      <div className="projects-card-meta">
                        <span className={project.hasRoomSpace ? 'is-ready' : ''}>
                          <Ruler size={15} aria-hidden="true" />
                          {project.hasRoomSpace ? 'Medidas listas' : 'Sin medidas'}
                        </span>
                        <span>{project.mainResponsibleName ?? 'Sin responsable'}</span>
                      </div>

                      <Link className="projects-show-button" to={`/projects/${project.id}`}>
                        Mostrar
                      </Link>
                    </div>

                    <div className={`projects-active-card-visual projects-active-card-visual--${index % 4}`}>
                      <FolderKanban size={54} strokeWidth={1.35} aria-hidden="true" />
                      <span>{project.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="projects-section projects-section--finished" aria-labelledby="finished-projects-title">
            <div className="projects-section-heading">
              <h2 id="finished-projects-title">PROYECTOS FINALIZADOS</h2>
              <p>
                Este es tu historial de proyectos concluidos. Puedes abrir cualquier expediente para
                consultar su información.
              </p>
            </div>

            {finishedProjects.length === 0 ? (
              <div className="projects-state-card">
                <h3>No hay proyectos finalizados para mostrar</h3>
                <p>Los proyectos cerrados o archivados aparecerán aquí.</p>
              </div>
            ) : (
              <div className="projects-finished-grid">
                {finishedProjects.map((project, index) => (
                  <article className="projects-finished-card" key={project.id}>
                    <div className={`projects-finished-visual projects-finished-visual--${index % 3}`}>
                      <FolderKanban size={42} strokeWidth={1.35} aria-hidden="true" />
                    </div>
                    <div className="projects-finished-copy">
                      <p>
                        <MapPin size={14} aria-hidden="true" />
                        {project.location ?? 'Sin ubicación'}
                      </p>
                      <h3>
                        <Link to={`/projects/${project.id}`}>{project.name}</Link>
                      </h3>
                      <span>{project.clientName}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
