# Prompts — TP 2

El registro del proceso. Se utilizó un único prompt detallado en una sola conversación. El contrato OpenAPI 3.1 quedó completamente definido y generado sin necesidad de iteraciones o correcciones posteriores.

---

## 1 — Prompt inicial

```text
Necesito un openapi.yaml (3.1) para una API REST de seguimiento y estado de proyectos de software y sus hitos (milestones).

recursos:
  Project:
    - id: integer (generado por servidor)
    - name: string (obligatorio)
    - target_date: string (format: date, obligatorio)
    - stage: enum [PLANNING, IN_PROGRESS, TESTING, READY_FOR_DEPLOY, DONE] (obligatorio)
    - health_status: enum [ON_TRACK, AT_RISK, DELAYED] (solo salida, calculado por el servidor)

  Milestone:
    - id: integer (generado por servidor)
    - title: string (obligatorio)
    - due_date: string (format: date, obligatorio)
    - status: enum [PENDING, IN_PROGRESS, COMPLETED] (default: PENDING)
    - project_id: integer (solo salida, asociado por el path)

endpoints:
  GET    /projects                                      → 200 lista de proyectos
  POST   /projects                                      → 201 crea proyecto / 400 si faltan campos obligatorios
  GET    /projects/{projectId}                          → 200 detalle / 404 si no existe
  DELETE /projects/{projectId}                          → 204 sin cuerpo / 404 si no existe
  GET    /projects/{projectId}/milestones               → 200 lista de hitos / 404 si el proyecto no existe
  POST   /projects/{projectId}/milestones               → 201 crea hito / 400 si faltan datos / 404 si el proyecto no existe
  DELETE /projects/{projectId}/milestones/{milestoneId} → 204 sin cuerpo / 404 si no existe

Reglas de modelado:
- Los schemas de entrada y salida deben estar separados en components/schemas:
  - Project y ProjectInput (ProjectInput no tiene id ni health_status).
  - Milestone y MilestoneInput (MilestoneInput no tiene id ni project_id, ya que se deduce del path).
- Documentar respuestas de error estándar (400 y 404) con un schema ErrorResponse { message: string }.
```

**Qué buscaba:**  
Definir de antemano todas las restricciones y requerimientos de la API para que el modelo generara el contrato completo sin ambigüedades:

1. **Jerarquía REST y endpoints:** Los 7 endpoints distribuidos en 4 paths, cubriendo `GET`, `POST` y `DELETE` para proyectos y sus hitos anidados (`/projects/{projectId}/milestones`).
2. **Separación estricta de schemas:** Diferenciar la entrada del cliente (`ProjectInput`, `MilestoneInput`) de la salida del servidor (`Project`, `Milestone`). Dejar explícito que los identificadores (`id`), los campos calculados (`health_status`) y los deducidos por el path (`project_id`) no deben figurar en el cuerpo de las peticiones (`POST`).
3. **Manejo de códigos HTTP:** Respuestas claras para cada operación: `200 OK` (listas y lecturas), `201 Created` (creación), `204 No Content` (eliminación sin cuerpo), y códigos de error estándar `400 Bad Request` y `404 Not Found` tipados con un schema `ErrorResponse`.

**Resultado obtenido:**  
El modelo interpretó y aplicó la totalidad de las directivas en la primera respuesta, generando el archivo [openapi.yaml](openapi.yaml) conforme a OpenAPI 3.1.0:

- **Estructura de Paths:** Definió los 4 paths con sus 7 operaciones correspondientes, asignando resúmenes descriptivos y `operationId` claros (`listProjects`, `createProject`, `getProjectById`, `deleteProject`, `listMilestonesByProject`, `createMilestone`, `deleteMilestone`).
- **Parámetros reutilizables:** Modularizó `ProjectId` y `MilestoneId` en `components/parameters`, vinculándolos vía `$ref` en los paths correspondientes.
- **Respuestas y Schemas:**
  - Implementó `Project` y `ProjectInput` asegurando los enums requeridos (`stage`, `health_status`), el formato `format: date` en `target_date`, y marcando `health_status` como `readOnly: true`.
  - Implementó `Milestone` y `MilestoneInput` con el valor por defecto `PENDING` para `status`, formato `date` en `due_date`, y marcando `project_id` como `readOnly: true` (ausente en `MilestoneInput`).
  - Modularizó `components/responses/BadRequest` y `components/responses/NotFound` utilizando el schema `ErrorResponse`.
  - Utilizó `204 No Content` (sin cuerpo) en los endpoints `DELETE`.

---

## Conversación completa

El contrato quedó 100% definido en **un único prompt** ("one-shot"). No fue necesario realizar repreguntas, correcciones ni prompts adicionales porque las restricciones de modelado (separación de schemas in/out, ausencia de IDs redundantes en los payloads y códigos HTTP precisos) fueron provistas explícitamente desde el inicio.
