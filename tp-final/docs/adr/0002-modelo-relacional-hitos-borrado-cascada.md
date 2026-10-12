# ADR-0002: Modelo de Datos Relacional para Hitos (`Milestone` 1:N) con Borrado en Cascada

- **Fecha:** 2026-10-11
- **Estado:** Aceptado
- **Decisores:** Equipo de Ingeniería & Alumno

---

## Contexto

Inicialmente se evaluó representar el progreso de un proyecto con una columna única `stage` en la tabla `projects` (ej. un enum que transitara de `PLANNING` a `DONE`).
Sin embargo, esta simplificación no refleja la realidad del ciclo de vida del software:

- Un proyecto no avanza de fase de forma monolítica o binaria.
- Los líderes técnicos y gerentes de proyecto requieren granularidad para registrar entregables o hitos intermedios y saber qué porcentaje real de trabajo ha sido completado.
- Si un proyecto se elimina, no deben quedar registros huérfanos de hitos en la base de datos relacional.

---

## Decisión

1. **Entidad Relacional Independiente `Milestone`:**
   Se modela una relación uno a muchos (`Project` 1 ➔ N `Milestone`) mediante SQLAlchemy 2.0. Cada hito almacena:
   - `id`: Identificador único primario.
   - `project_id`: Clave foránea referenciando a `projects.id`.
   - `title`: Título descriptivo del hito.
   - `stage`: Fase técnica (`PLANNING`, `DESIGN`, `DEVELOPMENT`, `TESTING`, `READY_FOR_DEPLOY`).
   - `status`: Estado del hito (`PENDING`, `COMPLETED`).
   - `due_date`: Fecha opcional de vencimiento individual.

2. **Integridad Referencial Estricta con Borrado en Cascada:**
   - A nivel ORM: `cascade="all, delete-orphan"` en `Project.milestones`.
   - A nivel SQLite: `ForeignKey("projects.id", ondelete="CASCADE")`.
   - Al eliminar un proyecto vía `DELETE /api/projects/{id}`, todos sus hitos asociados se eliminan permanentemente en la misma transacción atómica.

3. **Cálculo Derivado de Etapa Actual:**
   La propiedad `current_stage` del proyecto no se almacena, sino que se calcula identificando la fase del primer hito que permanece en estado `PENDING`. Si todos los hitos están completados, la etapa resultante es `DONE`.

---

## Consecuencias

### Positivas (Pros)

- Trazabilidad y granularidad técnica real para los equipos de desarrollo.
- Integridad referencial garantizada: imposible que existan hitos huérfanos sin proyecto padre.
- Permite la renderización de checklists interactivos y cálculos precisos de porcentaje de avance ($0.0\%$ a $100.0\%$).

### Trade-offs (Cons)

- Requiere operaciones relacionales JOIN o `selectinload` al recuperar proyectos con sus hitos, lo cual se resolvió configurando relaciones cargadas por defecto para evitar problemas de consultas $N+1$.
