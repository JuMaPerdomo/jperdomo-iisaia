# BDR-0002: Parpadeo Transitorio de Tarjetas Esqueleto al Alternar Filtros sin Resultados

- **Fecha:** 2026-10-11
- **Severidad:** Baja (Defecto de usabilidad y feedback visual en UI)
- **Estado:** Resuelto
- **Componentes Afectados:** `frontend/src/App.jsx`

---

## 1. Síntoma Observado

Cuando se aplicaba una combinación de filtros de búsqueda que no arrojaba resultados, la sección de proyectos mostraba correctamente el estado vacío (*"No se encontraron proyectos con los filtros actuales"*).
Sin embargo, si el usuario alternaba entre dos combinaciones de filtros que producían ambas 0 resultados, la interfaz montaba durante una fracción de segundo 3 tarjetas esqueleto vacías animadas (*loading skeletons*) antes de volver a mostrar el mensaje de estado vacío.

---

## 2. Análisis de Causa Raíz (Root Cause Analysis - RCA)

La causa radicaba en la condición de renderizado condicional en `App.jsx`:

```jsx
{loading && projects.length === 0 ? (
  <LoadingSkeletons />
) : projects.length === 0 ? (
  <EmptyState />
) : (
  <ProjectsGrid />
)}
```

- En el estado inicial de no resultados, `projects.length === 0` y `loading === false`, mostrando el `EmptyState`.
- Al hacer clic en otro filtro, la función `fetchProjects()` ejecutaba `setLoading(true)`.
- En ese instante, antes de que la API respondiera, `projects.length` continuaba siendo `0` y `loading` pasaba a `true`.
- En consecuencia, la primera condición `loading && projects.length === 0` evaluaba a verdadero, desmontando el `EmptyState` y montando los skeletons animados.
- Al responder la API con `[]`, `setLoading(false)` volvía a falso y la interfaz volvía a alternar hacia el `EmptyState`.

---

## 3. Decisión de Corrección Adoptada

Los *loading skeletons* de página completa representan un patrón de diseño destinado a la **carga inicial** de la aplicación (cuando el usuario entra y aún no hay ningún dato cargado), no para micro-interacciones de filtrado o búsqueda.

1. **Reemplazo de Estado:**
   Se sustituyó la variable general `loading` por `initialLoading`:
   - Nace en `true` al montar la aplicación.
   - Pasa a `false` de forma definitiva una vez completado el primer fetch de datos.
2. **Ajuste de la Condición en `App.jsx`:**
   ```jsx
   {initialLoading ? (
     <LoadingSkeletons />
   ) : projects.length === 0 ? (
     <EmptyState />
   ) : (
     <ProjectsGrid />
   )}
   ```
3. **Comportamiento Resultante:**
   - En la carga inicial de la página se visualizan los skeletons mientras se recuperan los proyectos por primera vez.
   - Durante cualquier filtrado o búsqueda posterior, `initialLoading` permanece en `false`:
     - Si se pasa de un estado vacío a otro, la interfaz permanece estable en el `EmptyState` sin parpadear ni montar skeletons.
     - Si se encuentran proyectos, la transición a las tarjetas es directa e inmediata.

---

## 4. Verificación

- `npm run build` ejecutado exitosamente sin advertencias.
- Validación interactiva: alternar entre combinaciones con cero resultados; el `EmptyState` permanece fijo y estable sin ningún fotograma de parpadeo.
- Las 31 pruebas automatizadas del backend continúan pasando al 100%.

---

## 5. Medidas Preventivas

- **Diferenciación entre Initial Load y Background Filtering:** Nunca reutilizar la bandera de carga inicial para consultas de filtrado en cliente que puedan alterar estados vacíos consolidados.
