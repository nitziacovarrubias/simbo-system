import {
  Search,
  SlidersHorizontal,
  UserPlus
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClientStatus } from '@shared/constants/domain.enums';
import { useClientsQuery } from './client.queries';
import { CLIENT_STATUS_LABEL } from '@renderer/utils/domain-labels';
import {
  formatDate,
  getErrorMessage
} from '@renderer/utils/formatters';

import './clients.css';

type ClientStatusFilter = 'ALL' | ClientStatus;

export function ClientsPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<ClientStatusFilter>('ALL');

  const clientsQuery = useClientsQuery();

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (clientsQuery.data ?? []).filter((client) => {
      const searchable = [
        client.person.fullName,
        client.person.phone ?? '',
        client.person.email ?? '',
        client.projectAddress ?? ''
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !term || searchable.includes(term);

      const matchesStatus =
        statusFilter === 'ALL' ||
        client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    clientsQuery.data,
    search,
    statusFilter
  ]);

  return (
    <section
      className="clients-page"
      aria-labelledby="clients-title"
    >
      <header className="clients-page-header">
        <div>
          <span>Directorio</span>
          <h2 id="clients-title">
            Listado de clientes
          </h2>
          <p>
            Administra los datos, proyectos y seguimiento
            de todos tus clientes desde un solo lugar.
          </p>
        </div>

        <Link
          className="clients-new-button"
          to="/clients/new"
        >
          <UserPlus
            size={18}
            aria-hidden="true"
          />
          Nuevo cliente
        </Link>
      </header>

      <div className="clients-content">
        <div className="clients-toolbar">
          <div className="clients-toolbar-title">
            <SlidersHorizontal
              size={28}
              aria-hidden="true"
            />
            <strong>Actividad</strong>
          </div>

          <div className="clients-toolbar-controls">
            <label
              className="clients-search-field"
              htmlFor="client-search"
            >
              <Search
                size={18}
                aria-hidden="true"
              />
              <input
                id="client-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar por nombre, teléfono, correo o dirección"
              />
            </label>

            <label className="clients-status-filter">
              <span>Estado</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as ClientStatusFilter
                  )
                }
              >
                <option value="ALL">
                  Todos
                </option>

                {Object.values(ClientStatus).map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {CLIENT_STATUS_LABEL[status]}
                    </option>
                  )
                )}
              </select>
            </label>

            <span className="clients-result-count">
              {filteredClients.length}{' '}
              cliente(s)
            </span>
          </div>
        </div>

        {clientsQuery.isLoading ? (
          <div className="clients-state-card">
            Cargando clientes...
          </div>
        ) : null}

        {clientsQuery.isError ? (
          <div
            className="clients-state-card clients-state-card--error"
            role="alert"
          >
            {getErrorMessage(
              clientsQuery.error
            )}
          </div>
        ) : null}

        {!clientsQuery.isLoading &&
        !clientsQuery.isError &&
        filteredClients.length === 0 ? (
          <div className="clients-state-card">
            <h3>
              No hay clientes para mostrar
            </h3>
            <p>
              Registra un cliente nuevo o cambia los
              filtros.
            </p>
          </div>
        ) : null}

        {filteredClients.length > 0 ? (
          <div className="clients-table-wrap">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Correo electrónico</th>
                  <th>Estado del cliente</th>
                  <th>Proyectos realizados</th>
                  <th>Dirección de proyecto</th>
                  <th>Última actualización</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>

              <tbody>
                {filteredClients.map(
                  (client, index) => (
                    <tr key={client.id}>
                      <td className="clients-row-number">
                        {index + 1}
                      </td>

                      <td className="clients-name-cell">
                        <strong>
                          {client.person.fullName}
                        </strong>
                      </td>

                      <td>
                        {client.person.phone ??
                          'Sin teléfono'}
                      </td>

                      <td>
                        {client.person.email ??
                          'Sin correo'}
                      </td>

                      <td>
                        <span
                          className={`client-status-badge client-status-badge--${client.status.toLowerCase()}`}
                        >
                          {
                            CLIENT_STATUS_LABEL[
                              client.status
                            ]
                          }
                        </span>
                      </td>

                      <td className="clients-project-count">
                        {client.projectCount}
                      </td>

                      <td>
                        {client.projectAddress ??
                          'Sin dirección'}
                      </td>

                      <td>
                        {formatDate(
                          client.updatedAt
                        )}
                      </td>

                      <td>
                        <Link
                          className="clients-detail-link"
                          to={`/clients/${client.id}`}
                        >
                          Ver detalle
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
