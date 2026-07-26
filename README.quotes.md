# Módulo de cotizaciones

El módulo genera versiones de cotización desde la lista de despiece autorizada más reciente. Si no existe una versión autorizada, usa la lista pendiente más reciente y muestra una advertencia.

## Flujo

1. Abrir un proyecto con despiece.
2. Entrar a **Cotización**.
3. Generar una versión.
4. Editar o agregar conceptos.
5. Guardar mano de obra, costos adicionales, descuento, IVA, anticipo y notas.
6. Aprobar o rechazar con nota.
7. Exportar a Excel.

Los archivos se guardan en `userData/exports/quotes/`.

## Comandos

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run test
npm run build
npm run dev
```
