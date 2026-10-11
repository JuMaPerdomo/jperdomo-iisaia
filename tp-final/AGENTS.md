# AGENTS.md — Guía Operativa para Agentes de Inteligencia Artificial

Este documento establece las reglas operativas, arquitectura, comandos y gobernanza de contexto para cualquier agente de IA o desarrollador que trabaje en el repositorio **Project Tracking Dashboard**.

---

## 1. Visión General del Sistema (System Overview)

El **Project Tracking Dashboard** (Dashboard de Seguimiento de Proyectos de Software) es una solución desacoplada para la gestión y seguimiento ejecutivo del estado de proyectos de software, con control de hitos por fase técnica del ciclo de vida y cálculo dinámico de salud y riesgos en tiempo real.

- **Backend:** FastAPI (Python 3.10+) con SQLAlchemy 2.0 y base de datos relacional SQLite (`backend/projects.db`).
- **Frontend:** SPA interactiva en React 18 impulsada por Vite, estilizada con Tailwind CSS y gráficos con Chart.js.
- **Comunicación:** API REST desacoplada con CORS habilitado para el cliente web (`http://localhost:5173`).

---

## 2. Estructura del Repositorio y Stack Tecnológico

```
/
├── backend/                  # API REST en FastAPI
│   ├── app/
│   │   ├── main.py           # Entrypoint FastAPI, CORS y rutas
│   │   ├── database.py       # Sesión SQLAlchemy y engine SQLite
│   │   ├── models.py         # Modelos relacionales ORM (Project, Milestone)
│   │   ├── schemas.py        # Esquemas Pydantic v2 de entrada y salida
│   │   ├── crud.py           # Operaciones de persistencia y consultas
│   │   └── services.py       # Lógica de cálculo dinámico de salud y progreso
│   ├── tests/                # Suite de pruebas unitarias y de integración (Pytest)
│   └── requirements.txt      # Dependencias del backend
├── frontend/                 # Aplicación SPA en Vite + React
│   ├── src/
│   │   ├── components/       # Componentes visuales (Dashboard, ProjectCard, etc.)
│   │   ├── services/         # Cliente API para consumo del backend
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/                     # Documentación de diseño, specs y planes de implementación
│   └── superpowers/
│       ├── specs/            # Especificaciones técnicas completas
│       └── plans/            # Planes de trabajo paso a paso
├── consigna.md               # Requisitos académicos y guía de defensa
├── AGENTS.md                 # Guía operativa y gobernanza de agentes (este archivo)
└── .gitignore                # Reglas de exclusión de Git
```

---

## 3. Comandos de Configuración y Ejecución (Setup & Run Commands)

### Backend
Para configurar el entorno virtual, instalar dependencias y levantar el servidor de desarrollo:
```bash
cd backend && python -m venv .venv && source .venv/Scripts/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
```
*(En Windows PowerShell: `.venv\Scripts\Activate.ps1`)*

### Frontend
Para instalar dependencias de Node y levantar el servidor de desarrollo de Vite:
```bash
cd frontend && npm install && npm run dev
```

---

## 4. Comandos de Prueba y Validación (Test Commands)

### Backend
Para ejecutar los tests automatizados con Pytest en modo detallado:
```bash
pytest backend/tests/ -v
```

### Frontend
Para verificar compilación y build del frontend:
```bash
npm run build
```

---

## 5. Reglas de Arquitectura y Dominio (Architecture & Domain Rules)

1. **Cálculo Dinámico de Salud (Dynamic Health Calculation):**
   - **NUNCA** almacenar el estado de salud como una columna estática en la base de datos.
   - La salud se calcula dinámicamente en tiempo de ejecución (runtime) en el servicio al consultar el proyecto:
     - `COMPLETED`: Si todos los hitos están completados o el proyecto está finalizado.
     - `DELAYED`: Si la fecha objetivo (`target_date`) venció (`target_date < today`) y el proyecto no está completado.
     - `AT_RISK`: Si la fecha objetivo está a 7 días o menos y el progreso es menor al 70%.
     - `ON_TRACK`: En cualquier otro caso normal.

2. **Hitos Base por Defecto (Default Milestones):**
   - Al crear un proyecto, se inicializan automáticamente 5 hitos base asociados a las fases técnicas del ciclo de vida del software:
     1. `PLANNING`
     2. `DESIGN`
     3. `DEVELOPMENT`
     4. `TESTING`
     5. `READY_FOR_DEPLOY`
   - La eliminación de un proyecto debe borrar en cascada todos sus hitos asociados.

3. **Desarrollo Guiado por Pruebas (TDD en Backend):**
   - En el backend, seguir rigurosamente el ciclo Red-Green-Refactor:
     1. Escribir primero el test que falle con `pytest`.
     2. Implementar el código mínimo para hacer pasar el test.
     3. Verificar que la suite pase limpiamente (`pytest backend/tests/ -v`).

4. **Integridad de Datos y Casos Borde:**
   - Si un proyecto tiene 0 hitos, el progreso debe ser 0% y el cálculo de salud no debe generar `ZeroDivisionError`.
   - Si un proyecto se crea con `target_date` en el pasado, debe nacer inmediatamente como `DELAYED`.

---

## 6. Preservación y Gestión de Contexto entre Sesiones (Context Preservation)

Para cumplir con las exigencias de mantenibilidad y contexto persistente (ver `consigna.md`):

1. **Lectura Previa Obligatoria:** Antes de realizar cualquier modificación, todo agente de IA debe leer:
   - Este archivo `AGENTS.md`.
   - Las especificaciones en `docs/superpowers/specs/` (o `specs/`).
   - El plan de implementación activo en `docs/superpowers/plans/` (o `plans/`).
2. **Evidencia en Repositorio:** El historial de commits debe ser atómico, descriptivo y seguir la convención Conventional Commits (`feat:`, `test:`, `chore:`, `fix:`).
3. **Aislamiento de Cambios:** Trabajar sobre ramas temáticas (`feature/...`) y no introducir cambios fuera del alcance definido en la tarea o brief correspondiente.
