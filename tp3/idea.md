
# Planteo del Trabajo Final: Dashboard de Seguimiento de Proyectos de Software

## 1. Problema

En las empresas de software es difícil tener visibilidad clara y centralizada del avance de múltiples proyectos en simultáneo. La información suele estar dispersa en planillas o chats, lo que provoca que **los desvíos en las fechas de entrega o *milestones* clave se detecten demasiado tarde**, comprometiendo el paso a producción.

## 2. Usuarios

* **Project Managers / Tech Leads:** Necesitan actualizar el estado de las etapas de cada proyecto y ajustar las fechas programadas.
* **Líderes de Área / Directors:** Necesitan una vista global ejecutiva para detectar rápidamente qué proyectos están en riesgo y analizar métricas de rendimiento general.

## 3. MVP (Funcionalidades Mínimas)

1. **Gestión de Proyectos y Milestones (CRUD):**

   * Crear un proyecto con su nombre, fecha objetivo de producción y una secuencia de hitos o etapas (*ej: Análiss, Desarrollo, Testing, Deploy*).
   * Cambiar el estado actual de cada hito (Pendiente, En Proceso, Completado).

2. **Dashboard de Monitoreo visual:**

   * Lista/Tarjetas de proyectos con indicador visual de estado (Verde = En término, Rojo/Amarillo = Fecha en peligro o demorado según la fecha de producción programada).

3. **Módulo de Estadísticas Generales:**

   * Métricas rápidas en la parte superior: Total de proyectos, Proyectos completados, En proceso, y Proyectos en riesgo (retrasados).

4. **Persistencia de Datos:**

   * Histórico guardado de todos los proyectos y sus cambios de estado.

## 4. Stack Tecnológico

* **Interfaz (Frontend):** HTML5, CSS (Bootstrap o Tailwind CSS vía CDN) y JavaScript Vanilla (sin paso de build). Se pueden usar librerías simples por CDN como **Chart.js** para los gráficos de estadísticas.
* **Servidor (Backend):** **FastAPI** (Python) o Express.js (Node.js) para exponer una API REST con los endpoints de proyectos, hitos y métricas.
* **Datos (Base de Datos):** **SQLite** con SQLAlchemy o Peewee para gestionar las tablas relacionando Proyectos y sus Estados/Milestones.
