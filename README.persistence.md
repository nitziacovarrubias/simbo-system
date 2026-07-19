# Persistencia local SIMBO

Este módulo agrega persistencia local con SQLite + Prisma, validaciones con Zod, repositorios, servicios e IPC seguro.

## Instalación

```bash
npm install @prisma/client zod dotenv
npm install -D prisma tsx
```

## Scripts recomendados para package.json

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## Configuración

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Crear base de datos

```bash
npm run db:generate
npm run db:migrate -- --name init_local_persistence
npm run db:seed
```

## Probar

```bash
npm run test
npm run dev
```

## Conectar IPC en Electron Main

En el archivo principal de Electron, importa y ejecuta el registro de handlers antes de crear la ventana o durante la inicialización de la app:

```ts
import { registerIpcHandlers } from './ipc';

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});
```

## Probar desde React

Puedes usar `DatabaseStatusCard` temporalmente en Settings o Dashboard:

```tsx
import { DatabaseStatusCard } from './modules/settings/DatabaseStatusCard';

<DatabaseStatusCard />
```

## APIs expuestas por preload

- `getAppInfo`
- `getDatabaseStatus`
- `getDashboardSummary`
- `listUsers`
- `listClients`
- `listProjects`
- `listDesignsByProject`
- `listMaterials`
- `listRendersByProject`
- `listCuttingListsByProject`
- `listQuotesByProject`
- `listActivitiesByProject`
- `listAlertsByProject`
- `listDocumentsByProject`
- `listHistoryByProject`

No se expone ninguna API genérica para SQL ni acceso directo a Prisma.
