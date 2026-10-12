# Registros de Decisiones de Bugs (BDR — Bug Decision Records)

Este directorio documenta de forma estructurada los defectos técnicos no triviales identificados durante el ciclo de vida del **Project Tracking Dashboard**, su análisis de causa raíz (*Root Cause Analysis - RCA*), las decisiones de ingeniería adoptadas para su resolución y las medidas preventivas implementadas para evitar regresiones.

---

## Índice de BDRs

| ID | Fecha | Título | Severidad | Estado |
| :--- | :--- | :--- | :--- | :--- |
| [BDR-0001](0001-salto-scroll-canvas-chartjs.md) | 2026-10-11 | Salto de scroll hacia arriba por Layout Shift durante recreación del Canvas de Chart.js | Media | **Resuelto** |
| [BDR-0002](0002-parpadeo-skeletons-filtros-vacios.md) | 2026-10-11 | Parpadeo transitorio de tarjetas esqueleto (*skeletons*) al alternar entre filtros sin resultados | Baja | **Resuelto** |

---

## Estructura de un BDR

Cada registro documenta formalmente:

1. **Metadatos:** Identificador correlativo (`BDR-NNNN`), fecha, severidad y estado.
2. **Síntoma Observado:** Descripción del fallo visible o funcional reportado por el usuario o detectado en pruebas.
3. **Análisis de Causa Raíz (Root Cause Analysis - RCA):** Diagnóstico técnico a bajo nivel explicando por qué ocurrió el fallo.
4. **Decisión de Corrección Adoptada:** La solución arquitectónica o de código implementada, evitando *workarounds* frágiles.
5. **Verificación:** Comandos de validación y pruebas ejecutadas.
6. **Medidas Preventivas:** Reglas de desarrollo implementadas para asegurar que el problema no reaparezca.
