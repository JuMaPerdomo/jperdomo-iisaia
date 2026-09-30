# TP 2 — API de Proyectos e Hitos (Milestones)

Contrato de API REST formalizado en [openapi.yaml](openapi.yaml) (OpenAPI 3.1.0) para el seguimiento, estado y gestión de proyectos de software y sus respectivos hitos. La especificación cuenta con 7 endpoints distribuidos en 4 paths, modularizados y tipados sin requerir implementación de backend en esta etapa.

## 📖 Cómo visualizar el contrato

1. Copiar el contenido del archivo [openapi.yaml](openapi.yaml).
2. Pegarlo en el editor online [editor.swagger.io](https://editor.swagger.io) o visualizarlo directamente con extensiones OpenAPI/Swagger en el entorno de desarrollo.
3. Se desplegará la documentación interactiva con los endpoints agrupados, esquemas de datos, parámetros y respuestas detalladas.

## 🎯 Dominio elegido y jerarquía

El dominio modela el ciclo de vida y seguimiento de proyectos de software:

- **`Project` (Recurso Padre):** Representa el proyecto general con su fecha objetivo (`target_date`), etapa del ciclo (`stage`) y un estado de salud (`health_status`).
- **`Milestone` (Recurso Hijo):** Representa un hito o entrega clave dentro del proyecto, con su fecha límite (`due_date`) y estado (`status`).

Se eligió esta relación porque la jerarquía es estructural y no una relación débil: un hito no tiene sentido de existir de forma independiente fuera del proyecto al que pertenece. Si un proyecto es eliminado, sus hitos asociados dejan de existir. Por ende, la relación de pertenencia se plasma directamente en la URI:
`/projects/{projectId}/milestones` y `/projects/{projectId}/milestones/{milestoneId}`.

## 📌 Cumplimiento de Requisitos Técnicos

| Requisito | Implementación en el Contrato |
| :--- | :--- |
| **1. Tres Métodos HTTP** | Se implementaron operaciones con `GET`, `POST` y `DELETE` tanto para proyectos como para hitos (7 endpoints en total). |
| **2. Jerarquía de Recursos** | Rutas anidadas explícitas: `GET/POST /projects/{projectId}/milestones` y `DELETE /projects/{projectId}/milestones/{milestoneId}`. |
| **3. Respuestas de Error** | Se documentaron y modularizaron respuestas estándar de cliente: `400 Bad Request` y `404 Not Found` bajo `components/responses/`, referenciando el schema `ErrorResponse` (`{ message: string }`). |
| **4. Schemas Tipados** | Schemas rigurosos en `components/schemas/` con especificación de `type`, listas de `required`, `format: date`, enums restrictivos y atributos `readOnly: true`. |

## 🛠️ Decisiones de Diseño Tomadas

1. **Path anidado en lugar de parámetro de consulta plano (`/milestones?projectId=...`):**  
   Al tratarse de una relación de composición estricta, el anidamiento en la URI explicita la pertenencia jerárquica del hito dentro del proyecto padre.

2. **Separación estricta de Schemas de Entrada y Salida:**  
   Colapsar entrada y salida en un solo schema marcando campos como opcionales debilita el contrato. Por ello se definieron schemas diferenciados:
   - `Project` vs. `ProjectInput`: `ProjectInput` excluye el `id` (generado por el servidor) y `health_status` (calculado por lógica de negocio del servidor, no asignable arbitrariamente por el cliente).
   - `Milestone` vs. `MilestoneInput`: `MilestoneInput` excluye el `id` y `project_id`, ya que el identificador del proyecto se deduce inequívocamente de la URL de la petición.

3. **`204 No Content` en operaciones `DELETE`:**  
   Al eliminar un recurso (`/projects/{projectId}` o `.../milestones/{milestoneId}`), la respuesta correcta es `204` sin cuerpo. Devolver `200` con el objeto eliminado contradice la semántica REST, ya que describe un recurso que acaba de dejar de existir.

4. **`404 Not Found` en subrecursos inexistentes frente a listas vacías:**  
   Si se invoca `GET /projects/{projectId}/milestones` con un identificador de proyecto que no existe en el sistema, la API debe responder `404 Not Found` y no una lista vacía `[]`. Devolver `[]` falsearía el estado del sistema, sugiriendo que el proyecto existe pero aún no tiene hitos cargados.

5. **Modularización DRY en `components`:**  
   Se desacoplaron los parámetros de ruta (`ProjectId` y `MilestoneId`) y las respuestas comunes (`BadRequest`, `NotFound`) para evitar duplicación entre endpoints y facilitar el mantenimiento del contrato.

## 🤖 Interacción con la IA: Supervisión Arquitectónica y Desvíos Evitados

En las tareas de generación de contratos OpenAPI mediante IA, los modelos suelen presentar fallas recurrentes:

- Reutilizar un único schema para entrada y salida con campos opcionales ambiguos.
- Exigir `projectId` dentro del body del JSON en un `POST` anidado, duplicando el dato ya presente en la URL y abriendo inconsistencias (ej. si el path dice proyecto 1 pero el body dice proyecto 2).
- Asignar respuestas `200 OK` con cuerpo al borrar recursos en vez de `204 No Content`.
- Omitir schemas estructurados para errores (`400`/`404`).

**Cómo se resolvió:**  
En lugar de iniciar con un prompt abierto o ambiguo que requiriera múltiples correcciones, se asumió el rol de **supervisor arquitectónico** desde el inicio. El prompt inicial estructuró de manera prescriptiva los recursos, la jerarquía de paths, las reglas de separación de schemas (in/out) y el catálogo de respuestas esperadas.

Gracias a este nivel de especificidad, la IA generó el archivo [openapi.yaml](openapi.yaml) completo, válido y exacto en una **única interacción (*one-shot*)**, sin requerir prompts de corrección posteriores.

## 📝 Registro de Prompts

El detalle exacto del prompt utilizado y la verificación exhaustiva del resultado se encuentran registrados en [prompts.md](prompts.md).
