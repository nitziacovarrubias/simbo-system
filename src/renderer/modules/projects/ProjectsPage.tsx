import { Filter, FolderPlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProjectStatus } from '@shared/constants/domain.enums';
import { ACTIVE_PROJECT_STATUSES, PROJECT_STATUS_LABEL } from '@renderer/utils/domain-labels';
import { formatDate, getErrorMessage } from '@renderer/utils/formatters';
import { useProjectsQuery } from './project.queries';

type ProjectFilter = 'ALL' | 'ACTIVE' | 'FINISHED' | ProjectStatus;

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
        (statusFilter === 'FINISHED' &&
          [ProjectStatus.CLOSED, ProjectStatus.ARCHIVED].includes(project.status)) ||
        project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projectsQuery.data, search, statusFilter]);

  return (
    <section className="page-panel" aria-labelledby="projects-title">
      <div className="module-page-header">
        <div>
          <p className="page-eyebrow">Expedientes</p>
          <h2 id="projects-title">Proyectos</h2>
          <p>Administra proyectos activos, finalizados, clientes, fechas y medidas.</p>
        </div>

        <Link className="primary-link-button" to="/projects/new">
          <FolderPlus size={18} aria-hidden="true" />
          Nuevo proyecto
        </Link>
      </div>

      <div className="toolbar-card toolbar-grid">
        <label className="search-field" htmlFor="project-search">
          <Search size={18} aria-hidden="true" />
          <input
            id="project-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar proyecto, cliente o ubicación"
          />
        </label>

        <label className="filter-field" htmlFor="project-status-filter">
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

        <span className="result-count">{filteredProjects.length} proyecto(s)</span>
      </div>

      {projectsQuery.isLoading ? <div className="state-card">Cargando proyectos...</div> : null}
      {projectsQuery.isError ? (
        <div className="state-card state-card-error" role="alert">
          {getErrorMessage(projectsQuery.error)}
        </div>
      ) : null}

      {!projectsQuery.isLoading && !projectsQuery.isError && filteredProjects.length === 0 ? (
        <div className="state-card">
          <h3>No hay proyectos para mostrar</h3>
          <p>Crea un proyecto nuevo o cambia los filtros.</p>
        </div>
      ) : null}

      {filteredProjects.length > 0 ? (
        <div className="project-card-grid">
          {filteredProjects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-card-header">
                <div>
                  <span className={`status-pill status-${project.status.toLowerCase()}`}>
                    {PROJECT_STATUS_LABEL[project.status]}
                  </span>
                  <h3>{project.name}</h3>
                  <p>{project.clientName}</p>
                </div>
                <span className={`measure-indicator ${project.hasRoomSpace ? 'is-complete' : ''}`}>
                  {project.hasRoomSpace ? 'Medidas listas' : 'Sin medidas'}
                </span>
              </div>

              <dl className="compact-detail-list">
                <div>
                  <dt>Ubicación</dt>
                  <dd>{project.location ?? 'Sin ubicación'}</dd>
                </div>
                <div>
                  <dt>Inicio</dt>
                  <dd>{formatDate(project.startDate)}</dd>
                </div>
                <div>
                  <dt>Entrega estimada</dt>
                  <dd>{formatDate(project.deliveryDate)}</dd>
                </div>
                <div>
                  <dt>Responsable</dt>
                  <dd>{project.mainResponsibleName ?? 'Sin responsable asignado'}</dd>
                </div>
              </dl>

              <Link className="card-link" to={`/projects/${project.id}`}>
                Ver proyecto
              </Link>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
