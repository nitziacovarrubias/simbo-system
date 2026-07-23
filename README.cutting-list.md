# Módulo de Despiece Automático

## Plan técnico

El módulo toma el diseño vigente guardado, valida que tenga módulos y que no existan colisiones, aplica reglas de dominio por tipo de módulo y crea una versión persistente de la lista de despiece. La UI usa TanStack Query y solo se comunica con Electron Main mediante APIs específicas del preload. La exportación `.xlsx` se construye con ExcelJS en Main y se guarda en `userData/exports/cutting-lists/`.

## Archivos nuevos principales

- `prisma/migrations/20260723010000_cutting_list_module/migration.sql`
- `src/shared/types/cutting-list.types.ts`
- `src/shared/schemas/cutting-list.schema.ts`
- `src/shared/constants/cutting-list-status.ts`
- `src/shared/constants/grain-direction.ts`
- `src/shared/constants/edge-banding.ts`
- `src/main/ipc/cutting-list.ipc.ts`
- `src/main/services/cutting-list-generator.service.ts`
- `src/main/services/cutting-list-export.service.ts`
- `src/main/services/cutting-list.utils.ts`
- `src/main/services/cutting-rules/*`
- `src/renderer/modules/cutting-list/CuttingListPage.tsx`
- `src/renderer/modules/cutting-list/components/*`
- `src/renderer/modules/cutting-list/hooks/useCuttingListQueries.ts`
- Pruebas unitarias de reglas, schemas, utilidades y workbook.

## Archivos modificados principales

- `package.json`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/main/ipc/index.ts`
- `src/main/ipc/ipc-channels.ts`
- `src/main/ipc/persistence.ipc.ts`
- `src/main/repositories/cutting-list.repository.ts`
- `src/main/repositories/material.repository.ts`
- `src/main/services/cutting-list.service.ts`
- `src/main/services/design.service.ts`
- `src/preload/index.ts`
- `src/shared/types/index.ts`
- `src/shared/types/simbo-api.types.ts`
- `src/shared/schemas/index.ts`
- `src/shared/constants/domain.enums.ts`
- `src/renderer/App.tsx`
- `src/renderer/routes/app-routes.tsx`
- `src/renderer/modules/projects/ProjectDetailPage.tsx`
- `src/renderer/styles/globals.css`

## Instalación y migración

```bash
npm install
npm run db:generate
npm run db:migrate -- --name cutting_list_module
npm run db:seed
```

La única dependencia nueva es `exceljs@^4.4.0`; ya está declarada en `package.json`. La migración ya está incluida. Si Prisma indica que ya existe, usa:

```bash
npm run db:generate
npm run db:migrate
```

## Prueba manual

1. Ejecuta `npm run dev`.
2. Inicia sesión como Arquitecto o Supervisor.
3. Abre un proyecto con medidas y diseño guardado.
4. Desde el detalle del proyecto, selecciona **Abrir despiece**.
5. Presiona **Generar lista de despiece**.
6. Verifica que los módulos fabricables generen piezas y que el electrodoméstico aparezca en observaciones.
7. Edita una pieza y confirma que se mantenga en **Pendiente de validación**.
8. Agrega y elimina una pieza manual.
9. Rechaza sin nota y verifica el bloqueo; después rechaza con motivo.
10. Genera una nueva versión y usa el selector de versiones.
11. Autoriza una lista válida y confirma que sus controles de edición queden bloqueados.
12. Exporta a Excel y revisa las hojas **Despiece** y **Resumen materiales**.
13. Regresa al editor, modifica un módulo y guarda. Comprueba que la lista anterior aparezca como **Desactualizada**.
14. Ejecuta `npm run test`, `npm run lint` y `npm run build`.

## Checklist funcional

- [ ] Ruta real de despiece por proyecto.
- [ ] Generación desde diseño vigente.
- [ ] Bloqueo por diseño sin módulos.
- [ ] Bloqueo por colisiones.
- [ ] Reglas para gabinete bajo, alacena, torre, repisa, isla y electrodoméstico.
- [ ] Nombre, dimensiones, veta, cantidad, material, espesor y canteado.
- [ ] Edición puntual y pieza manual.
- [ ] Validaciones Zod.
- [ ] Versionado sin eliminar versiones anteriores.
- [ ] Aviso de versión no vigente.
- [ ] Estado desactualizado al modificar el diseño.
- [ ] Autorización y rechazo con observación.
- [ ] Bloqueo de edición autorizada.
- [ ] Exportación Excel en Main.
- [ ] Hoja de resumen por material.
- [ ] Historial de generación, edición, alta manual, eliminación, autorización, rechazo y exportación.
- [ ] Preload e IPC específicos.
- [ ] TanStack Query e invalidación de caché.
- [ ] Pruebas unitarias del dominio y workbook.

## Commit sugerido

```bash
git add .
git commit -m "feat(cutting-list): implement automatic cutting list workflow"
```
