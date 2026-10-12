# ADR-0003: Inicialización Automática de 5 Hitos Base según Fases del Ciclo de Vida

- **Fecha:** 2026-10-11
- **Estado:** Aceptado
- **Decisores:** Equipo de Ingeniería & Alumno

---

## Contexto

Al crear un nuevo proyecto de software, si este nace con 0 hitos:
1. El usuario debe ingresar manualmente cada una de las fases habituales de la ingeniería de software, generando fricción de adopción.
2. Si los usuarios usan nombres o fases arbitrarias, se pierde la estandarización necesaria para alimentar el gráfico de barras ejecutivo del dashboard (distribución por fases del ciclo de vida).
3. Podrían provocarse casos borde como división por cero al calcular el porcentaje de avance si no existieran hitos.

---

## Decisión

Se decide que todo nuevo proyecto creado a través de `POST /api/projects` sea inicializado automáticamente por el backend con **5 hitos base predeterminados**, correspondientes a las fases canónicas de la ingeniería de software:

1. **Planificación (`PLANNING`):** *"Definición de alcance y arquitectura"*
2. **Diseño (`DESIGN`):** *"Diseño de interfaz y contratos"*
3. **Desarrollo (`DEVELOPMENT`):** *"Construcción e implementación"*
4. **Testing/QA (`TESTING`):** *"Pruebas y aseguramiento de calidad"*
5. **Listo Deploy (`READY_FOR_DEPLOY`):** *"Pase a producción"*

Todos los hitos inicializan en estado `PENDING`.

---

## Consecuencias

### Positivas (Pros)
- **Cero fricción de arranque:** El usuario simplemente ingresa el nombre, descripción y fecha objetivo del proyecto; la aplicación inmediatamente dispone de un pipeline completo y funcional.
- **Estandarización del Dashboard:** El gráfico de distribución por fases en Chart.js y los filtros por fase en el frontend cuentan con datos estructurados y coherentes desde el primer instante.
- **Robustez matemática:** El cálculo de progreso y métricas opera sobre una base conocida y consistente.

### Trade-offs / Mitigaciones (Cons)
- Se asume una estructura base en cascada o fases secuenciales. No obstante, los hitos pueden ser complementados con hitos personalizados adicionales o editados según las necesidades específicas de cada equipo.
