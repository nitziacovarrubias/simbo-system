import {
  ArrowLeft,
  Edit3,
  FolderKanban,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useClientQuery } from './client.queries';
import {
  CLIENT_STATUS_LABEL,
  PROJECT_STATUS_LABEL
} from '@renderer/utils/domain-labels';
import {
  formatDate,
  getErrorMessage
} from '@renderer/utils/formatters';

import './clients.css';

export function ClientDetailPage(): JSX.Element {
  const { clientId } = useParams();
  const clientQuery = useClientQuery(clientId);

  if (clientQuery.isLoading) {
    return (
      <section className="page-panel state-card">
        Cargando detalle del cliente...
      </section>
    );
  }

  if (
    clientQuery.isError ||
    !clientQuery.data
  ) {
    return (
      <section className="page-panel">
        <div
          className="state-card state-card-error"
          role="alert"
        >
          {getErrorMessage(
            clientQuery.error
          )}
        </div>
      </section>
    );
  }

  const client = clientQuery.data;

  return (
    <section
      className="client-detail-page"
      aria-labelledby="client-detail-title"
    >
      <header className="client-detail-header">
        <div>
          <Link
            className="client-back-link"
            to="/clients"
          >
            <ArrowLeft
              size={17}
              aria-hidden="true"
            />
            Volver a clientes
          </Link>

          <span>Detalle del cliente</span>

          <h2 id="client-detail-title">
            {client.fullName}
          </h2>

          <span
            className={`client-status-badge client-status-badge--${client.status.toLowerCase()}`}
          >
            {
              CLIENT_STATUS_LABEL[
                client.status
              ]
            }
          </span>
        </div>

        <Link
          className="client-edit-button"
          to={`/clients/${client.id}/edit`}
        >
          <Edit3
            size={18}
            aria-hidden="true"
          />
          Editar cliente
        </Link>
      </header>

      <div className="client-detail-content">
        <div className="client-detail-grid">
          <article className="client-detail-card">
            <div className="client-detail-card__heading">
              <span>Información</span>
              <h3>
                Información personal
              </h3>
            </div>

            <dl className="client-detail-list">
              <div>
                <dt>
                  <Phone
                    size={16}
                    aria-hidden="true"
                  />
                  Teléfono
                </dt>
                <dd>
                  {client.phone ??
                    'Sin teléfono'}
                </dd>
              </div>

              <div>
                <dt>
                  <Mail
                    size={16}
                    aria-hidden="true"
                  />
                  Correo
                </dt>
                <dd>
                  {client.email ??
                    'Sin correo'}
                </dd>
              </div>

              <div>
                <dt>
                  <MapPin
                    size={16}
                    aria-hidden="true"
                  />
                  Dirección
                </dt>
                <dd>
                  {client.address ??
                    'Sin dirección'}
                </dd>
              </div>

              <div>
                <dt>RFC</dt>
                <dd>
                  {client.rfc ??
                    'Sin RFC'}
                </dd>
              </div>
            </dl>
          </article>

          <article className="client-detail-card">
            <div className="client-detail-card__heading">
              <span>Seguimiento</span>
              <h3>
                Datos del cliente
              </h3>
            </div>

            <dl className="client-detail-list">
              <div>
                <dt>
                  Dirección del proyecto
                </dt>
                <dd>
                  {client.projectAddress ??
                    'Sin dirección de proyecto'}
                </dd>
              </div>

              <div>
                <dt>
                  Contacto inicial
                </dt>
                <dd>
                  {formatDate(
                    client.initialContactDate
                  )}
                </dd>
              </div>

              <div>
                <dt>Notas</dt>
                <dd>
                  {client.notes ??
                    'Sin notas'}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <section
          className="client-projects-section"
          aria-labelledby="client-projects-title"
        >
          <div className="client-projects-heading">
            <div>
              <span>Relación</span>
              <h3 id="client-projects-title">
                Proyectos asociados
              </h3>
            </div>

            <Link
              className="client-create-project-button"
              to={`/projects/new?clientId=${client.id}`}
            >
              <FolderKanban
                size={17}
                aria-hidden="true"
              />
              Crear proyecto
            </Link>
          </div>

          {client.projects.length === 0 ? (
            <div className="clients-state-card">
              Este cliente todavía no tiene proyectos
              asociados.
            </div>
          ) : (
            <div className="client-project-list">
              {client.projects.map(
                (project) => (
                  <Link
                    className="client-project-card"
                    key={project.id}
                    to={`/projects/${project.id}`}
                  >
                    <div>
                      <strong>
                        {project.name}
                      </strong>
                      <span>
                        {project.location ??
                          'Sin ubicación'}
                      </span>
                    </div>

                    <div>
                      <span
                        className={`client-project-status client-project-status--${project.status.toLowerCase()}`}
                      >
                        {
                          PROJECT_STATUS_LABEL[
                            project.status
                          ]
                        }
                      </span>

                      <small>
                        Entrega:{' '}
                        {formatDate(
                          project.deliveryDate
                        )}
                      </small>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
