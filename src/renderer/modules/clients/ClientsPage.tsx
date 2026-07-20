import { Search, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClientsQuery } from './client.queries';
import { CLIENT_STATUS_LABEL } from '@renderer/utils/domain-labels';
import { formatDate, getErrorMessage } from '@renderer/utils/formatters';

export function ClientsPage(): JSX.Element {
  const [search, setSearch] = useState('');
  const clientsQuery = useClientsQuery();

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return clientsQuery.data ?? [];
    }

    return (clientsQuery.data ?? []).filter((client) => {
      const searchable = [
        client.person.fullName,
        client.person.phone ?? '',
        client.person.email ?? ''
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(term);
    });
  }, [clientsQuery.data, search]);

  return (
    <section className="page-panel" aria-labelledby="clients-title">
      <div className="module-page-header">
        <div>
          <p className="page-eyebrow">Directorio</p>
          <h2 id="clients-title">Clientes</h2>
          <p>Consulta, registra y actualiza los datos de clientes de BOIS.</p>
        </div>

        <Link className="primary-link-button" to="/clients/new">
          <UserPlus size={18} aria-hidden="true" />
          Nuevo cliente
        </Link>
      </div>

      <div className="toolbar-card">
        <label className="search-field" htmlFor="client-search">
          <Search size={18} aria-hidden="true" />
          <input
            id="client-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, teléfono o correo"
          />
        </label>
        <span className="result-count">{filteredClients.length} cliente(s)</span>
      </div>

      {clientsQuery.isLoading ? <div className="state-card">Cargando clientes...</div> : null}

      {clientsQuery.isError ? (
        <div className="state-card state-card-error" role="alert">
          {getErrorMessage(clientsQuery.error)}
        </div>
      ) : null}

      {!clientsQuery.isLoading && !clientsQuery.isError && filteredClients.length === 0 ? (
        <div className="state-card">
          <h3>No hay clientes para mostrar</h3>
          <p>Registra un cliente nuevo o cambia el criterio de búsqueda.</p>
        </div>
      ) : null}

      {filteredClients.length > 0 ? (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Dirección de proyecto</th>
                <th>Proyectos</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <strong>{client.person.fullName}</strong>
                  </td>
                  <td>
                    <span>{client.person.phone ?? 'Sin teléfono'}</span>
                    <small>{client.person.email ?? 'Sin correo'}</small>
                  </td>
                  <td>{client.projectAddress ?? 'Sin dirección'}</td>
                  <td>{client.projectCount}</td>
                  <td>
                    <span className={`status-pill status-${client.status.toLowerCase()}`}>
                      {CLIENT_STATUS_LABEL[client.status]}
                    </span>
                  </td>
                  <td>{formatDate(client.updatedAt)}</td>
                  <td>
                    <Link className="table-action" to={`/clients/${client.id}`}>
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
