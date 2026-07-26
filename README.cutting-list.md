# Módulo de Despiece Automático

## Plan técnico

El módulo toma el diseño vigente guardado, valida que tenga módulos y que no existan colisiones, aplica reglas de dominio por tipo de módulo y crea una versión persistente de la lista de despiece. La UI usa TanStack Query y solo se comunica con Electron Main mediante APIs específicas del preload. La exportación `.xlsx` se construye con ExcelJS en Main y se guarda en `userData/exports/cutting-lists/`.

## Instalación y migración

```bash
npm install
npm run db:generate
npm run db:migrate -- --name cutting_list_module
npm run db:seed
```

```bash
npm run db:generate
npm run db:migrate
```

## Prueba manual

1. Inicia sesión como Arquitecto o Supervisor.
2. Abre un proyecto con medidas y diseño guardado.
3. Desde el detalle del proyecto, selecciona **Abrir despiece**.
4. Presiona **Generar lista de despiece**.
5. Verifica que los módulos fabricables generen piezas y que el electrodoméstico aparezca en observaciones.
6. Edita una pieza y confirma que se mantenga en **Pendiente de validación**.
7. Agrega y elimina una pieza manual.
8. Rechaza sin nota y verifica el bloqueo; después rechaza con motivo.
9.  Genera una nueva versión y usa el selector de versiones.
10. Autoriza una lista válida y confirma que sus controles de edición queden bloqueados.
11.  Exporta a Excel y revisa las hojas **Despiece** y **Resumen materiales**.
12.  Regresa al editor, modifica un módulo y guarda. Comprueba que la lista anterior aparezca como **Desactualizada**.
