# BDR-0001: Salto de Scroll hacia Arriba por Layout Shift durante Recreación del Canvas de Chart.js

- **Fecha:** 2026-10-11
- **Severidad:** Media (Defecto visual perceptible en UX)
- **Estado:** Resuelto
- **Componentes Afectados:** `frontend/src/App.jsx`, `frontend/src/components/StageChart.jsx`, `frontend/src/components/MetricCards.jsx`

---

## 1. Síntoma Observado

Al scrollear la página hasta la sección inferior de proyectos y hacer clic en cualquiera de los botones de filtro (salud o fase) o ingresar texto en la barra de búsqueda, la ventana del navegador parecía saltar hacia arriba por una fracción de segundo y luego restaurarse a la posición previa.

---

## 2. Análisis de Causa Raíz (Root Cause Analysis - RCA)

El bug se produjo por una combinación de acoplamiento de estado y comportamiento del canvas de Chart.js:

1. **Re-fetch Innecesario de Métricas Globales:**
   En `App.jsx`, la función `fetchData()` ejecutaba `Promise.all([apiClient.getProjects(params), apiClient.getMetrics()])` ante cualquier cambio de filtro o tipeo en la búsqueda. Si bien las métricas del portafolio son globales y no dependen de los filtros locales de proyectos, `setMetrics()` actualizaba el estado con una nueva referencia de objeto.
2. **Recreación de la Instancia de Chart.js:**
   En `StageChart.jsx`, los objetos `data` y `options` se declaraban como literales sin `useMemo`. Al recibir nuevas métricas (o re-renderizarse el padre), la librería `react-chartjs-2` detectaba un cambio por referencia en `options`, ejecutando `chart.destroy()` e instanciando un nuevo gráfico mediante `new Chart()`.
3. **Layout Shift y Scroll Clamping del Navegador:**
   El contenedor del canvas (`<div className="h-64 sm:h-72 w-full">`) carecía de la propiedad `position: relative` (requerida por Chart.js cuando `maintainAspectRatio: false`). Durante el fotograma en que el canvas se destruía y reconstruía, el contenedor colapsaba a altura 0 px (~256 px de pérdida vertical).
   Al estar scrolleado al fondo, el navegador detectaba que la altura total del documento se reducía instantáneamente en 256 px, obligándolo a recortar el scroll hacia arriba (*scroll clamping*). Al montarse el nuevo canvas un fotograma después, la altura se restauraba y el scroll volvía abajo, provocando el salto perceptible.

---

## 3. Decisión de Corrección Adoptada

Se descartaron parches superficiales (como guardar artificialmente `window.scrollY` antes de filtrar) y se resolvió la causa arquitectónica de raíz:

1. **Desacoplamiento de Peticiones en `App.jsx`:**
   Se separó `fetchProjects()` de `fetchMetrics()`.
   - Al filtrar o buscar, **únicamente** se invoca `fetchProjects(params)`. El estado de métricas globales no se muta, evitando cualquier re-render en tarjetas KPI y gráficos.
   - Las métricas se actualizan únicamente al inicio o ante mutaciones CRUD reales.
2. **Memoización y Eliminación de Animaciones en `StageChart.jsx`:**
   - Se memoizaron `data` y `options` mediante `useMemo`.
   - Se configuró `animation: false` para evitar recálculos por RequestAnimationFrame.
   - Se envolvió el contenedor con `relative h-64 sm:h-72 w-full overflow-hidden`, garantizando que la altura jamás colapse a 0 px.
   - Se envolvió el componente en `React.memo(StageChart)`.
3. **Memoización en `MetricCards.jsx`:**
   - Se exportó con `React.memo(MetricCards)` para aislarlo de re-renders de filtrado.
4. **Estabilidad Vertical en Sección de Proyectos:**
   - Se aplicó `min-h-[350px]` al contenedor de proyectos para mantener altura mínima garantizada.

---

## 4. Verificación

- `npm run build` en `frontend/` compilado limpiamente con código 0.
- Validación manual en navegador: scrolleando al final y alternando filtros rápidamente; el scroll permanece 100% inmóvil y la respuesta es instantánea.
- Suite de backend intacta: 31/31 tests pasando con Pytest.

---

## 5. Medidas Preventivas

- **Regla de Memoización de Gráficos:** Cualquier componente que renderice canvas con librerías externas (Chart.js, D3) debe memoizar estrictamente sus opciones/datos y declarar un contenedor padre `relative` con altura fija explícita.
- **Separación de Consultas:** Parámetros de vista local (filtros de listados) nunca deben disparar recálculos de métricas globales del sistema.

