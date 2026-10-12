# ADR-0005: Progresión Secuencial Estricta de Hitos con Bloqueo Visual

- **Fecha:** 2026-10-11
- **Estado:** Aceptado
- **Decisores:** Equipo de Ingeniería & Alumno

---

## Contexto

En el ciclo de vida del software profesional, las etapas técnicas guardan una relación de precedencia lógica estricta:
- No es viable declarar que un software está en "Testing" si la etapa de "Desarrollo" no fue completada.
- No se puede ejecutar "Pase a Producción" si la etapa de "Testing/QA" o "Diseño" no fueron superadas.
- Si la interfaz de usuario permitiera marcar checkboxes en cualquier orden arbitrario (por ejemplo, marcar el hito 5 cuando los hitos 1, 2, 3 y 4 siguen pendientes), se generaría un estado incoherente en la medición del pipeline técnico y confusión en los dashboards ejecutivos.
- Del mismo modo, si un usuario desmarcara un hito intermedio (ej. Planificación) manteniendo completados los hitos posteriores (ej. Desarrollo y Testing), se quebrarían los invariantes del pipeline.

---

## Decisión

Se adopta una **regla de validación de progresión secuencial estricta** en el componente de hitos (`frontend/src/components/MilestoneList.jsx`):

1. **Avance Ordenado (Check / Completar):**
   - Un hito en estado `PENDING` solo puede marcarse como `COMPLETED` si **todos los hitos anteriores** ya están completados.
   - En cualquier momento dado, **únicamente el primer hito pendiente** de la lista está habilitado interactivamente para el usuario.
2. **Retroceso Seguro (Uncheck / Desmarcar):**
   - Para no dejar vacíos de precedencia, **únicamente el último hito completado** de la lista puede desmarcarse y volver a `PENDING` (retroceso paso a paso).
   - Los hitos completados previos permanecen bloqueados mientras existan hitos posteriores completados.
3. **Feedback Visual Explícito:**
   - Los hitos bloqueados presentan el botón deshabilitado (`disabled`), estilo atenuado con cursor `not-allowed`, y un ícono de candado (`Lock`) para los pendientes bloqueados.
   - Tooltips accesibles (`title` y `aria-label`) explican la causa exacta del bloqueo (ej.: *"Debe completar primero '[Nombre]' para avanzar"* o *"Debe desmarcar primero '[Nombre]' para retroceder"*).

---

## Consecuencias

### Positivas (Pros)
- **Integridad del proceso:** Imposibilita inconsistencias lógicas en el avance de proyectos.
- **Claridad cognitiva para el usuario:** El operador visualiza de inmediato cuál es el hito activo sobre el que debe trabajar, reduciendo errores humanos.
- **Coherencia con el indicador de etapa:** La etapa técnica del proyecto calculada en backend (`get_current_stage`) refleja con exactitud la primera fase en curso.

### Trade-offs (Cons)
- Disminuye la flexibilidad para flujos completamente anárquicos, lo cual es deliberado para garantizar disciplina metodológica en la entrega del software.
