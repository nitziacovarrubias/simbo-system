# Módulo Editor 2D/3D de SIMBO

Este modulo permite tener un visualizador grafico de los modulos para que el arquitecto pueda modificarlos a criterio.

## Instalación y base de datos

```bash
npm install
npm run db:generate
npm run db:migrate
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
