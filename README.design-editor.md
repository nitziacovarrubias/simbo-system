# Módulo Editor 2D/3D de SIMBO

## Alcance implementado

- Ruta real `/projects/:projectId/design`.
- Lectura del espacio capturado en `roomSpaceJson`.
- Vista 2D de planta y vista 3D básica con React Three Fiber.
- Grid, zoom, restablecimiento de cámara y rotación en 3D.
- Catálogo paramétrico de seis módulos.
- Edición numérica de medidas, posición y rotación.
- Selección de material y color.
- Detección de superposiciones por bounding box en planta.
- Autosave con espera de 900 ms y guardado manual.
- Persistencia normalizada en `Design` y `DesignModule`.
- Finalización bloqueada cuando existen colisiones.

## Instalación y base de datos

```bash
npm install
npm run db:generate
npm run db:migrate
```

La migración `20260720070000_design_editor` agrega `colorHex` y `hasCollision`, crea las plantillas y materiales faltantes sin borrar datos existentes y completa relaciones de plantilla cuando es posible.

Para reconstruir todos los datos de demostración desde cero:

```bash
npm run db:seed
```

## Pruebas

```bash
npm test
npm run build
npm run dev
```

## Prueba manual

1. Inicia sesión como Arquitecto.
2. Abre **Proyectos** y entra al proyecto de demostración.
3. Confirma que existan medidas guardadas.
4. Presiona **Continuar a diseño**.
5. Alterna entre **2D** y **3D**.
6. Agrega módulos desde el catálogo.
7. Selecciona un módulo y modifica ancho, alto, profundidad, posición, rotación, material y color.
8. Coloca dos módulos en la misma posición y confirma que se muestren en rojo con el aviso de superposición.
9. Espera un segundo y verifica el estado **Diseño guardado**.
10. Regresa al proyecto y vuelve a abrir el editor para confirmar la persistencia.
11. Separa los módulos y presiona **Finalizar diseño**.

## Commit sugerido

```bash
git add .
git commit -m "feat: implement integrated 2D 3D design editor"
```
