# Registros de Decisiones de Arquitectura (ADR — Architecture Decision Records)

Este directorio documenta de forma cronológica y estructurada las decisiones arquitectónicas fundamentales adoptadas en el proyecto **Project Tracking Dashboard**, sus justificaciones, alternativas evaluadas y consecuencias/trade-offs asumidos.

---

## Índice de ADRs

| ID | Fecha | Título | Estado |
| :--- | :--- | :--- | :--- |
| [ADR-0001](0001-calculo-dinamico-de-salud.md) | 2026-10-11 | Cálculo dinámico de salud y riesgos en tiempo de ejecución (Runtime Dynamic Health) | **Aceptado** |
| [ADR-0002](0002-modelo-relacional-hitos-borrado-cascada.md) | 2026-10-11 | Modelo de datos relacional para Hitos (`Milestone` 1:N) con borrado en cascada | **Aceptado** |
| [ADR-0003](0003-inicializacion-automatica-hitos-base.md) | 2026-10-11 | Inicialización automática de 5 hitos base según fases técnicas del ciclo de vida | **Aceptado** |
| [ADR-0004](0004-arquitectura-desacoplada-fastapi-react.md) | 2026-10-11 | Arquitectura desacoplada Client-Server (FastAPI REST + React 18 SPA) | **Aceptado** |
| [ADR-0005](0005-progresion-secuencial-estricta-hitos.md) | 2026-10-11 | Progresión secuencial estricta de hitos con bloqueo de avance y retroceso seguro | **Aceptado** |

---

## Estructura de un ADR

Cada registro sigue la estructura estándar propuesta por Michael Nygard:

1. **Título y Metadatos:** Número correlativo, fecha de adopción y estado (`Propuesto`, `Aceptado`, `Rechazado`, `Superado`).
2. **Contexto:** El problema técnico o de negocio que enfrentamos, las restricciones y las fuerzas en conflicto.
3. **Decisión:** La solución arquitectónica adoptada y cómo se implementa.
4. **Consecuencias:** Qué ganamos (pros), qué complejidad o trade-off asumimos (cons) y el impacto en la mantenibilidad del sistema.

