# ADR-0001: Cálculo Dinámico de Salud y Riesgos en Tiempo de Ejecución

- **Fecha:** 2026-10-11
- **Estado:** Aceptado
- **Decisores:** Equipo de Ingeniería & Alumno

---

## Contexto

El sistema debe proveer visibilidad ejecutiva sobre el estado de salud de cada proyecto (`ON_TRACK`, `AT_RISK`, `DELAYED`, `COMPLETED`).
Existen dos alternativas para modelar esta propiedad:

1. **Persistencia Estática:** Agregar una columna `health` o `status` en la tabla `projects` que se almacene físicamente en la base de datos relacional.
2. **Cálculo Dinámico en Runtime:** No almacenar ninguna columna de salud en la base de datos y calcularla dinámicamente en tiempo de ejecución en la capa de servicios al momento de consultar el proyecto.

### Fuerzas en Conflicto
- Si se almacena como columna estática, surge el problema inevitable de **desincronización temporal**: si un proyecto tiene fecha comprometida (`target_date`) de ayer y no fue completado, seguirá figurando como `ON_TRACK` en la base de datos hasta que un usuario lo edite manualmente o un proceso de fondo (*cron job* o *worker daemon*) corra periódicamente para mutar el registro.
- Correr cron jobs añade complejidad operacional innecesaria (infraestructura de workers, dependencias de background scheduling, manejo de concurrencia y bloqueos).

---

## Decisión

Se decide **NUNCA almacenar la salud del proyecto como una columna en la base de datos**.
La salud y el nivel de riesgo se calculan al vuelo en la capa de servicios (`backend/app/services.py:calculate_project_health`) en cada consulta, comparando la fecha actual (`date.today()`) contra el porcentaje de avance de hitos y la fecha comprometida (`target_date`):

- **`COMPLETED`:** Si el proyecto posee hitos y todos están en estado `COMPLETED` (progreso = 100%).
- **`DELAYED`:** Si la fecha objetivo venció (`target_date < date.today()`) y el proyecto no está completado.
- **`AT_RISK`:**
  - Si la fecha objetivo está a 7 días o menos de hoy y el progreso acumulado es inferior al 70%.
  - O si el tiempo restante respecto a la ventana de schedule es inferior al 30% y la etapa sigue en `PLANNING` o `DESIGN`.
- **`ON_TRACK`:** En cualquier otro caso normal.

---

## Consecuencias

### Positivas (Pros)
- **Cero desincronización temporal:** Un proyecto cuya fecha comprometida venció hace un segundo pasa a estar `DELAYED` de manera determinista e inmediata en la siguiente consulta, sin intervención humana ni jobs.
- **Simplicidad arquitectónica:** No se requieren schedulers en segundo plano (Celery, cron, Redis) ni triggers relacionales.
- **Transparencia en pruebas:** Las reglas de negocio se testean de forma pura con Pytest sin necesidad de mutar bases de datos.

### Trade-offs / Mitigaciones (Cons)
- **Cálculo en runtime:** Cada lectura computa el estado. Dado que un portafolio típico maneja decenas o cientos de proyectos y cada proyecto tiene un número acotado de hitos (~5-20), la complejidad temporal es $O(N)$ en memoria y tarda menos de 1 milisegundo en ejecutarse, siendo completamente imperceptible.
