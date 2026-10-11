# Plan de Implementación: Dashboard de Seguimiento de Proyectos de Software

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un sistema desacoplado (FastAPI + React/Vite + SQLite) para la gestión y seguimiento ejecutivo de proyectos de software con hitos por fase técnica y semáforo dinámico de salud/riesgo.

**Architecture:** Monorepo con backend REST en FastAPI que gestiona modelos relacionales `Project` y `Milestone` en SQLite vía SQLAlchemy 2.0 y calcula dinámicamente la salud según plazos y avance. Frontend SPA reactivo en Vite + React con Tailwind CSS y Chart.js consumiendo la API mediante CORS. Repositorio gobernado por `AGENTS.md` y documentado para la defensa en `consigna.md`.

**Tech Stack:** Python 3.10+, FastAPI, SQLAlchemy 2.0, Pydantic v2, SQLite, Pytest, Node.js 18+, Vite, React 18, Tailwind CSS, Lucide-React, Chart.js.

**Spec:** [`docs/superpowers/specs/2026-10-11-dashboard-seguimiento-proyectos-design.md`](file:///c:/git/jperdomo-iisaia/tp-final/docs/superpowers/specs/2026-10-11-dashboard-seguimiento-proyectos-design.md)

## Global Constraints

- Backend implementado en Python 3.10+ en el directorio `/backend`.
- Frontend implementado en React 18 con Vite en el directorio `/frontend`.
- Base de datos relacional SQLite local en `backend/projects.db` (en tests usar `sqlite:///:memory:`).
- Lógica de salud calculada al vuelo en backend (`ON_TRACK`, `AT_RISK`, `DELAYED`, `COMPLETED`), nunca persistida como columna estática.
- Al crear un proyecto se deben inicializar 5 hitos base por defecto correspondientes a las fases del ciclo de vida.
- Eliminación de un proyecto debe borrar en cascada sus hitos asociados.
- CORS habilitado en FastAPI para el origen de desarrollo de Vite (`http://localhost:5173`).
- TDD estricto en backend: cada tarea de backend debe incluir sus tests con `pytest`.

## Review Focus

1. **Fecha objetivo en el pasado al crear/actualizar:** Si un usuario crea un proyecto con `target_date < today`, debe nacer inmediatamente como `DELAYED` (a menos que todos sus hitos estén `COMPLETED`).
2. **Proyecto sin hitos:** Si un proyecto tiene 0 hitos (o se eliminan todos), el progreso debe ser 0% y el cálculo de salud no debe generar división por cero (`ZeroDivisionError`).
3. **Cálculo de límite de 7 días (`AT_RISK`):** Un proyecto con fecha objetivo a exactamente 7 días y menos del 70% de progreso debe marcarse como `AT_RISK`; si tiene 75% completado debe ser `ON_TRACK`.
4. **Casos borde en borrado en cascada:** Al invocar `DELETE /api/projects/{id}`, verificar que ningún registro huérfano quede en la tabla `milestones`.
5. **Filtros combinados de API:** `GET /api/projects?stage=DEVELOPMENT&health=AT_RISK` debe aplicar la intersección de filtros correctamente sin fallar cuando no hay coincidencias.

---

### Task 1: Gobernanza de Contexto y Repositorio (`AGENTS.md` y `.gitignore`)

**Files:**
- Create: `AGENTS.md`
- Create: `.gitignore`

**Interfaces:**
- Produces: Convenciones, reglas operativas para agentes, scripts de test y arranque para sesiones futuras.

- [ ] **Step 1: Crear archivo `.gitignore`**
Incluir exclusiones para Python (`__pycache__/`, `.pytest_cache/`, `*.pyc`, `*.db`, `.venv/`), Node (`node_modules/`, `dist/`), variables de entorno (`.env`), y worktrees (`.worktrees/`, `worktrees/`).

- [ ] **Step 2: Crear archivo `AGENTS.md`**
Definir el mapa del repositorio, comandos de arranque (`uvicorn`, `npm run dev`), comandos de prueba (`pytest`), reglas de arquitectura (desacoplamiento, salud dinámica, TDD) y guía de preservación de contexto entre sesiones para cumplir con `consigna.md`.

- [ ] **Step 3: Verificar archivo y commitear**
Run: `git status`
Run: `git add .gitignore AGENTS.md && git commit -m "chore: setup .gitignore and AGENTS.md for AI agent governance"`

---

### Task 2: Backend: Entorno, Modelos ORM y Base de Datos SQLite

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/__init__.py`
- Create: `backend/app/database.py`
- Create: `backend/app/models.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_models.py`

**Interfaces:**
- Produces: `Base`, `engine`, `get_db()`, `Project`, `Milestone`, `ProjectStage`, `HealthStatus`, `MilestoneStatus`.

- [ ] **Step 1: Escribir el test que falla para la creación de tablas y modelos**
En `backend/tests/test_models.py`:
```python
from datetime import date
from backend.app.models import Project, Milestone, ProjectStage, MilestoneStatus

def test_create_project_and_milestones(db_session):
    project = Project(name="Portal Web", description="Migración", target_date=date(2026, 12, 1))
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)
    
    assert project.id is not None
    assert project.name == "Portal Web"
    
    milestone = Milestone(
        project_id=project.id,
        title="Diseño UX",
        stage=ProjectStage.DESIGN.value,
        status=MilestoneStatus.PENDING.value
    )
    db_session.add(milestone)
    db_session.commit()
    db_session.refresh(project)
    
    assert len(project.milestones) == 1
    assert project.milestones[0].title == "Diseño UX"
```

- [ ] **Step 2: Correr test para verificar que falla**
Run: `pytest backend/tests/test_models.py`
Expected: FAIL con `ModuleNotFoundError` o `ImportError`.

- [ ] **Step 3: Crear `backend/requirements.txt`, `database.py`, `models.py` y `conftest.py`**
- `backend/requirements.txt`: `fastapi>=0.110.0`, `uvicorn>=0.28.0`, `sqlalchemy>=2.0.25`, `pydantic>=2.6.0`, `pytest>=8.0.0`, `httpx>=0.27.0`.
- `backend/app/database.py`: configurar `engine = create_engine("sqlite:///./projects.db")`, `sessionmaker` y dependency `get_db()`.
- `backend/app/models.py`: declarar enumeraciones `ProjectStage`, `HealthStatus`, `MilestoneStatus` y modelos `Project` y `Milestone` con relación `relationship("Milestone", back_populates="project", cascade="all, delete-orphan")`.
- `backend/tests/conftest.py`: fixture `db_session` usando `sqlite:///:memory:` y creando todas las tablas con `Base.metadata.create_all(engine)`.

- [ ] **Step 4: Correr test para verificar que pasa**
Run: `pytest backend/tests/test_models.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**
Run: `git add backend/`
Run: `git commit -m "feat(backend): setup database engine, models and sqlite schema with pytest fixtures"`

---

### Task 3: Backend: Lógica de Dominio y Salud Dinámica (`services.py`)

**Files:**
- Create: `backend/app/services.py`
- Create: `backend/tests/test_services.py`

**Interfaces:**
- Consumes: `Project`, `Milestone`, `ProjectStage`, `HealthStatus`, `MilestoneStatus` (desde `models.py`).
- Produces: 
  - `calculate_progress(project: Project) -> float`
  - `get_current_stage(project: Project) -> str`
  - `calculate_project_health(project: Project, today: date | None = None) -> HealthStatus`
  - `generate_default_milestones(project_id: int) -> list[Milestone]`

- [ ] **Step 1: Escribir tests unitarios que fallan para el cálculo de salud y progreso**
En `backend/tests/test_services.py`:
```python
from datetime import date, timedelta
from backend.app.models import Project, Milestone, ProjectStage, HealthStatus, MilestoneStatus
from backend.app.services import calculate_progress, calculate_project_health, get_current_stage, generate_default_milestones

def test_progress_calculation_empty_and_partial():
    proj = Project(name="Test", target_date=date.today())
    assert calculate_progress(proj) == 0.0
    
    proj.milestones = [
        Milestone(title="M1", stage="PLANNING", status=MilestoneStatus.COMPLETED.value),
        Milestone(title="M2", stage="DEVELOPMENT", status=MilestoneStatus.PENDING.value)
    ]
    assert calculate_progress(proj) == 50.0

def test_health_delayed_when_past_due():
    today = date(2026, 10, 11)
    proj = Project(name="Demorado", target_date=today - timedelta(days=2))
    proj.milestones = [Milestone(title="M1", stage="PLANNING", status=MilestoneStatus.PENDING.value)]
    assert calculate_project_health(proj, today) == HealthStatus.DELAYED

def test_health_at_risk_within_7_days():
    today = date(2026, 10, 11)
    proj = Project(name="En Riesgo", target_date=today + timedelta(days=5))
    proj.milestones = [
        Milestone(title="M1", stage="PLANNING", status=MilestoneStatus.COMPLETED.value),
        Milestone(title="M2", stage="DEVELOPMENT", status=MilestoneStatus.PENDING.value)
    ] # 50% progreso (< 70%) a 5 días
    assert calculate_project_health(proj, today) == HealthStatus.AT_RISK

def test_health_completed_when_all_done():
    today = date(2026, 10, 11)
    proj = Project(name="Listo", target_date=today - timedelta(days=5))
    proj.milestones = [Milestone(title="M1", stage="DONE", status=MilestoneStatus.COMPLETED.value)]
    assert calculate_project_health(proj, today) == HealthStatus.COMPLETED
```

- [ ] **Step 2: Correr tests para verificar que fallan**
Run: `pytest backend/tests/test_services.py`
Expected: FAIL con `ModuleNotFoundError: No module named 'backend.app.services'`.

- [ ] **Step 3: Implementar `backend/app/services.py`**
Implementar las funciones con el algoritmo acordado en la especificación, manejando divisiones seguras y generación de los 5 hitos por defecto (`PLANNING`, `DESIGN`, `DEVELOPMENT`, `TESTING`, `READY_FOR_DEPLOY`).

- [ ] **Step 4: Correr tests para verificar que pasan**
Run: `pytest backend/tests/test_services.py -v`
Expected: PASS (todos los casos de prueba).

- [ ] **Step 5: Commit**
Run: `git add backend/app/services.py backend/tests/test_services.py`
Run: `git commit -m "feat(backend): implement dynamic health calculation, progress metrics and default milestones"`

---

### Task 4: Backend: Esquemas Pydantic v2 y Capa CRUD

**Files:**
- Create: `backend/app/schemas.py`
- Create: `backend/app/crud.py`
- Create: `backend/tests/test_crud.py`

**Interfaces:**
- Consumes: `models.py`, `services.py`
- Produces:
  - Schemas: `ProjectCreate`, `ProjectUpdate`, `ProjectResponse`, `MilestoneCreate`, `MilestoneUpdate`, `MilestoneResponse`, `MetricsResponse`.
  - CRUD: `create_project`, `get_projects`, `get_project_by_id`, `update_project`, `delete_project`, `add_milestone`, `update_milestone`, `delete_milestone`, `get_dashboard_metrics`.

- [ ] **Step 1: Escribir tests que fallan para operaciones CRUD**
En `backend/tests/test_crud.py`:
Probar creación de proyecto con hitos automáticos, listado con filtros, actualización de hito y cálculo de métricas agregadas.

- [ ] **Step 2: Correr tests para verificar que fallan**
Run: `pytest backend/tests/test_crud.py`
Expected: FAIL.

- [ ] **Step 3: Implementar `schemas.py` y `crud.py`**
- En `schemas.py`: modelos Pydantic con `model_config = ConfigDict(from_attributes=True)`. `ProjectResponse` incluye `health_status: str`, `progress: float`, `current_stage: str` y `milestones: list[MilestoneResponse]`.
- En `crud.py`: funciones sincrónicas con `Session` de SQLAlchemy. `create_project` persiste el proyecto e inserta automáticamente los 5 hitos de `generate_default_milestones`. `get_dashboard_metrics` calcula los contadores de salud y fases.

- [ ] **Step 4: Correr tests para verificar que pasan**
Run: `pytest backend/tests/test_crud.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**
Run: `git add backend/app/schemas.py backend/app/crud.py backend/tests/test_crud.py`
Run: `git commit -m "feat(backend): implement pydantic schemas and database CRUD operations"`

---

### Task 5: Backend: Endpoints REST FastAPI y Métricas Agregadas

**Files:**
- Create: `backend/app/main.py`
- Create: `backend/tests/test_api.py`

**Interfaces:**
- Produces: API REST completa en `/api/projects`, `/api/projects/{id}/milestones`, `/api/metrics`, con documentación `/docs` y CORS configurado.

- [ ] **Step 1: Escribir tests de integración de API que fallan**
En `backend/tests/test_api.py`:
Probar con `starlette.testclient.TestClient`:
1. `POST /api/projects` ➔ 201 y valida creación de 5 hitos base.
2. `GET /api/projects` ➔ 200 y filtrado por salud.
3. `PATCH /api/projects/{id}/milestones/{milestone_id}` ➔ 200 al cambiar estado de hito a `COMPLETED`.
4. `GET /api/metrics` ➔ 200 con contadores correctos.
5. `DELETE /api/projects/{id}` ➔ 204 y eliminación en cascada.

- [ ] **Step 2: Correr tests de API para verificar que fallan**
Run: `pytest backend/tests/test_api.py`
Expected: FAIL.

- [ ] **Step 3: Implementar `backend/app/main.py`**
Crear aplicación FastAPI, agregar `CORSMiddleware` (`allow_origins=["http://localhost:5173", "*"]`), endpoints REST documentados con códigos HTTP semánticos y manejo de `HTTPException(status_code=404)` cuando no se encuentra un recurso.

- [ ] **Step 4: Correr todos los tests de backend**
Run: `pytest backend/tests/ -v`
Expected: PASS (todos los tests unitarios, CRUD y de API).

- [ ] **Step 5: Commit**
Run: `git add backend/app/main.py backend/tests/test_api.py`
Run: `git commit -m "feat(backend): expose REST endpoints and metrics with CORS and pytest integration coverage"`

---

### Task 6: Frontend: Setup Vite + Tailwind CSS + API Client

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/index.css`
- Create: `frontend/src/api/client.js`
- Create: `frontend/src/main.jsx`

**Interfaces:**
- Produces: `apiClient` con métodos `getProjects`, `createProject`, `updateProject`, `deleteProject`, `updateMilestone`, `addMilestone`, `deleteMilestone`, `getMetrics`.

- [ ] **Step 1: Inicializar archivos de configuración de Vite, React y Tailwind**
Definir `package.json` con dependencias: `react`, `react-dom`, `lucide-react`, `chart.js`, `react-chartjs-2`, `tailwindcss`, `autoprefixer`, `postcss`, `vite`.
Configurar `vite.config.js` con proxy opcional hacia `http://localhost:8000`.

- [ ] **Step 2: Implementar `frontend/src/api/client.js`**
Cliente fetch centralizado con manejo de respuestas JSON y captura de errores con mensajes legibles. Base URL configurada para desarrollo (`http://localhost:8000/api`).

- [ ] **Step 3: Verificar compilación e instalación**
Run: `cd frontend && npm install && npm run build`
Expected: Build exitoso sin errores en el directorio `dist`.

- [ ] **Step 4: Commit**
Run: `git add frontend/`
Run: `git commit -m "feat(frontend): initialize Vite React Tailwind project structure and REST api client"`

---

### Task 7: Frontend: Componentes Ejecutivos (Navbar, KPIs y Gráfico)

**Files:**
- Create: `frontend/src/components/Navbar.jsx`
- Create: `frontend/src/components/MetricCards.jsx`
- Create: `frontend/src/components/StageChart.jsx`

**Interfaces:**
- Consumes: Datos de `GET /api/metrics`.
- Produces: Visualización de métricas en tarjetas y gráfico de barras/dona por etapa con Chart.js.

- [ ] **Step 1: Crear `Navbar.jsx`**
Header con logo, indicador de estado de conexión y botón destacado `+ Nuevo Proyecto`.

- [ ] **Step 2: Crear `MetricCards.jsx`**
Componente que recibe el objeto `metrics` y renderiza 4 tarjetas: Total de Proyectos, En Regla (verde), En Riesgo (amarillo) y Demorados (rojo) con íconos de Lucide.

- [ ] **Step 3: Crear `StageChart.jsx`**
Gráfico interactivo de barras horizontales o dona usando `Chart.js` y `react-chartjs-2` que mapea la cantidad de proyectos en cada fase (`PLANNING` a `DONE`).

- [ ] **Step 4: Verificar sintaxis y build**
Run: `cd frontend && npm run build`
Expected: Build exitoso.

- [ ] **Step 5: Commit**
Run: `git add frontend/src/components/`
Run: `git commit -m "feat(frontend): implement Navbar, MetricCards and StageChart components"`

---

### Task 8: Frontend: Tarjetas de Proyectos, Acordeón de Milestones y Filtros

**Files:**
- Create: `frontend/src/components/FilterBar.jsx`
- Create: `frontend/src/components/MilestoneList.jsx`
- Create: `frontend/src/components/ProjectCard.jsx`

**Interfaces:**
- Consumes: Lista de `ProjectResponse` e interactúa con `onUpdateMilestone`, `onDeleteProject`, `onEditProject`.

- [ ] **Step 1: Crear `FilterBar.jsx`**
Barra de búsqueda en tiempo real por texto y filtros pill por estado de salud (*Todos, En Regla, En Riesgo, Demorados*).

- [ ] **Step 2: Crear `MilestoneList.jsx`**
Lista desplegable de hitos agrupados por fase con checkbox para alternar estado entre `PENDING` y `COMPLETED`, disparando la actualización inmediata contra el backend.

- [ ] **Step 3: Crear `ProjectCard.jsx`**
Tarjeta individual con badge de salud con código de color, barra de progreso porcentual, fecha de entrega y días restantes/demorados, acordeón para ver hitos y botones de editar/eliminar.

- [ ] **Step 4: Verificar compilación**
Run: `cd frontend && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**
Run: `git add frontend/src/components/`
Run: `git commit -m "feat(frontend): implement ProjectCard, MilestoneList and FilterBar components"`

---

### Task 9: Frontend: Modal CRUD y Ensamblado en `App.jsx`

**Files:**
- Create: `frontend/src/components/ProjectModal.jsx`
- Create: `frontend/src/App.jsx`

**Interfaces:**
- Consumes: Todos los componentes de `frontend/src/components/` y `client.js`.
- Produces: Aplicación SPA completamente funcional interactuando con el backend en tiempo real.

- [ ] **Step 1: Crear `ProjectModal.jsx`**
Modal flotante con formulario para crear o editar proyecto (nombre, descripción, fecha de producción con datepicker nativo) y validación de campos obligatorios.

- [ ] **Step 2: Implementar `App.jsx`**
Integrar estado global con hooks (`useState`, `useEffect`):
- Carga paralela de `projects` y `metrics`.
- Manejo de filtros locales (texto y salud).
- Funciones controladoras (`handleCreateProject`, `handleUpdateMilestone`, `handleDeleteProject`).
- Manejo de estados de carga y notificaciones tipo toast ante errores o éxitos.
- Estado vacío amigable (*Empty State*) si no hay proyectos.

- [ ] **Step 3: Verificar build completo de frontend**
Run: `cd frontend && npm run build`
Expected: Build exitoso sin advertencias críticas.

- [ ] **Step 4: Commit**
Run: `git add frontend/src/`
Run: `git commit -m "feat(frontend): integrate ProjectModal and assemble full dashboard in App.jsx"`

---

### Task 10: Documentación de Entrega y Cierre para Demo Day (`consigna.md` y `README.md`)

**Files:**
- Modify: `consigna.md`
- Create: `README.md`
- Create: `backend/README.md`
- Create: `frontend/README.md`

**Interfaces:**
- Produces: Documentación completa de los 5 puntos exigidos en `consigna.md` para la defensa en el Demo Day.

- [ ] **Step 1: Completar `consigna.md`**
Redactar con detalle profesional las respuestas a los 5 ejes obligatorios:
1. *Cómo se ejecuta*: Comandos exactos para levantar backend y frontend.
2. *Arquitectura*: Descripción de FastAPI, React, SQLite, endpoints y contratos.
3. *Qué decidí yo*: Salud calculada dinámicamente, hitos base automáticos, arquitectura desacoplada.
4. *Cómo gestioné el contexto*: Gobernanza con `AGENTS.md`, especificación formal y tareas atómicas.
5. *Qué salió mal*: Registro de desvíos y ajustes realizados (ej. aclaración de hitos por fase vs etapa única).

- [ ] **Step 2: Crear `README.md` en la raíz**
Instrucciones claras de inicio rápido (Quickstart) para cualquier evaluador que clone el repositorio.

- [ ] **Step 3: Commit final de documentación**
Run: `git add consigna.md README.md backend/README.md frontend/README.md`
Run: `git commit -m "docs: complete consigna.md delivery report and project readmes for demo day"`

