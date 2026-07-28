# Módulo de cronograma, alertas y cierre

## Alcance

- Actividades por proyecto con responsable de usuario o manual.
- Estados, prioridades, etapas, fechas y porcentaje de avance.
- Alertas automáticas por vencimiento, fecha próxima y actividad bloqueada.
- Incidencias manuales, resolución y descarte con nota.
- Reporte básico de avance, pendientes, bloqueos, vencimientos e incidencias.
- Cierre y archivado del proyecto por supervisor.
- Historial en cambios importantes.

## Preparación

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Pruebas

```bash
npm run test
npm run build
```

Inicia sesión como Supervisor, abre un proyecto y entra a **Cronograma** desde el expediente. Desde ahí se pueden crear actividades, generar alertas y cerrar el proyecto. La ruta **Alertas** muestra la bandeja global y permite registrar incidencias.
