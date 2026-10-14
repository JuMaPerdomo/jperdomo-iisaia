# Trabajo Práctico Final — Project Tracking Dashboard

La aplicación completa: interfaz, servidor y datos que persisten. Desarrollada y estructurada como solución ejecutiva para el seguimiento integral de proyectos de software, control de hitos por fase del ciclo de vida técnico y monitoreo dinámico de salud y riesgos en tiempo real.

El repositorio conserva la evidencia exhaustiva del proceso de ingeniería:

- **Especificación técnica:** `docs/superpowers/specs/2026-10-11-dashboard-seguimiento-proyectos-design.md`
- **Plan de implementación paso a paso:** `docs/superpowers/plans/2026-10-11-dashboard-seguimiento-proyectos-plan.md`
- **Registros de Decisiones de Arquitectura (ADRs):** en `../adr/` (5 registros estructurados bajo estándar Nygard)
- **Registros de Decisiones de Bugs (BDRs):** en `../bdr/` (registros con RCA y prevención de regresiones)
- **Material inicial de desarrollo:** en `../dev/` (`consigna.md`, `idea.md`, `estados.md`)
- **Contrato de gobernanza para agentes:** `../../AGENTS.md`
- **Historial de commits atómicos:** siguiendo la convención *Conventional Commits* en la rama de desarrollo `feature/dashboard-seguimiento`.

---

## Cómo se ejecuta

### Prerrequisitos del Sistema

- **Python:** 3.10 o superior (verificado con Python 3.13)
- **Node.js:** v14.15.4 o superior / Node 18+
- **NPM:** v6.14.10 o superior / v9+

---

### 1. Backend (FastAPI + SQLAlchemy + SQLite)

1. **Ingresar al directorio del backend:**

   ```bash
   cd backend
   ```

2. **Crear y activar el entorno virtual:**
   - En Windows (PowerShell):

     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```

   - En Linux / macOS / Bash:

     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Instalar dependencias:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Iniciar el servidor de desarrollo:**

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   - API activa en: `http://localhost:8000`
   - Documentación interactiva Swagger UI: `http://localhost:8000/docs`
   - Documentación alternativa ReDoc: `http://localhost:8000/redoc`

---

### 2. Frontend (Vite + React 18 + Tailwind CSS)

1. **Ingresar al directorio del frontend:**

   ```bash
   cd frontend
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo web:**

   ```bash
   npm run dev
   ```

   - Aplicación web accesible en: `http://localhost:5173`

---

### 3. Ejecución de Pruebas y Verificación

- **Suite de Pruebas Automatizadas del Backend (Pytest):**
  Desde la raíz o desde `backend/`:

  ```bash
  backend/.venv/Scripts/pytest backend/tests/ -v
  ```

  *Resultado:* **31 pruebas unitarias y de integración pasando al 100%** (modelos, servicios de cálculo de salud, operaciones CRUD y endpoints de API con SQLite en memoria).

- **Validación de Compilación del Frontend (Build):**
  Desde `frontend/`:

  ```bash
  npm run build
  ```

  *Resultado:* Compilación exitosa para producción en `frontend/dist/` sin errores de bundle.

---

## Arquitectura

El sistema está construido bajo un patrón de **Arquitectura Desacoplada (Client-Server)** en un monorepo organizado:

```text
/
├── backend/                  # API REST en FastAPI
│   ├── app/
│   │   ├── main.py           # Entrypoint FastAPI, configuración CORS y endpoints REST
│   │   ├── database.py       # Engine SQLite y generador de sesiones SQLAlchemy
│   │   ├── models.py         # Modelos relacionales ORM (Project, Milestone)
│   │   ├── schemas.py        # Esquemas Pydantic v2 (DTOs y validaciones)
│   │   ├── crud.py           # Capa de persistencia, consultas y agregaciones
│   │   └── services.py       # Algoritmo de cálculo dinámico de salud y progreso
│   ├── tests/                # Suite de pruebas automatizadas con Pytest
│   └── requirements.txt      # Dependencias Python
├── frontend/                 # SPA en React 18 impulsada por Vite
│   ├── src/
│   │   ├── api/client.js     # Cliente de comunicación con la API REST
│   │   ├── components/       # Componentes visuales modulares:
│   │   │   ├── Navbar.jsx        # Encabezado institucional y botón de nuevo proyecto
│   │   │   ├── MetricCards.jsx   # 4 tarjetas de KPIs globales en tiempo real
│   │   │   ├── StageChart.jsx    # Gráfico de distribución de fases (Chart.js)
│   │   │   ├── FilterBar.jsx     # Búsqueda por texto y filtros por semáforo de salud
│   │   │   ├── ProjectCard.jsx   # Tarjeta de proyecto con barra de avance y badges
│   │   │   ├── MilestoneList.jsx # Checklist interactivo de hitos por fase
│   │   │   └── ProjectModal.jsx  # Modal de creación y edición de proyectos e hitos
│   │   ├── App.jsx           # Contenedor principal y sincronización de estado
│   │   └── main.jsx          # Entrypoint de React y Tailwind CSS
│   └── package.json
├── docs/superpowers/         # Trazabilidad: especificaciones y planes de trabajo
└── AGENTS.md                 # Constitución de gobernanza de contexto para agentes
```

### Endpoints Principales de la API

- `GET /api/projects`: Listado de proyectos con filtros opcionales de búsqueda (`search`), salud (`health`) y etapa (`stage`).
- `POST /api/projects`: Creación de un proyecto y generación automática de sus 5 hitos iniciales.
- `GET /api/projects/{id}`: Detalle de un proyecto específico con sus hitos asociados.
- `PUT /api/projects/{id}`: Actualización de metadatos del proyecto (nombre, descripción, fecha comprometida de entrega).
- `DELETE /api/projects/{id}`: Eliminación física del proyecto y de sus hitos en cascada.
- `POST /api/projects/{id}/milestones`: Creación de un nuevo hito personalizado.
- `PATCH /api/projects/{id}/milestones/{milestone_id}`: Actualización de estado (`PENDING`, `IN_PROGRESS`, `COMPLETED`) y título del hito.
- `DELETE /api/projects/{id}/milestones/{milestone_id}`: Eliminación de un hito individual.
- `GET /api/metrics`: Métricas ejecutivas agregadas (total de proyectos, distribución de salud y desglose por etapas).

### Estructura y Relación de Datos

- **`Project` (1) ➔ `Milestone` (N):**
  - Un proyecto posee identificador único, nombre, descripción, fecha de creación y fecha comprometida de paso a producción (`target_date`).
  - Cada hito contiene título, fase técnica (`PLANNING`, `DESIGN`, `DEVELOPMENT`, `TESTING`, `READY_FOR_DEPLOY`), estado de avance (`PENDING`, `IN_PROGRESS`, `COMPLETED`) y orden relativo.
  - Relación configurada con `cascade="all, delete-orphan"` a nivel ORM y clave foránea con `ondelete="CASCADE"` para garantizar integridad referencial estricta.

### Contrato entre Interfaz y Servidor

- **Serialización y Validación:** Pydantic v2 valida estrictamente payloads de entrada y genera respuestas fuertemente tipadas (`from_attributes=True`), formateando fechas en ISO 8601 (`YYYY-MM-DD`).
- **CORS Configurado:** Permite el consumo desacoplado desde el frontend de desarrollo (`http://localhost:5173`) y clientes externos.
- **Autodocumentación OpenAPI:** El contrato de datos está 100% documentado y ejecutable desde `/docs`.

---

## Qué decidí yo

Las siguientes decisiones de diseño y arquitectura fueron adoptadas y se defenderán en el Demo Day:

1. **Cálculo Dinámico de Salud en Tiempo Real (Runtime Dynamic Health) — [ADR-0001](../adr/0001-calculo-dinamico-de-salud.md):**
   - **Decisión:** La salud del proyecto (`ON_TRACK`, `AT_RISK`, `DELAYED`, `COMPLETED`) **nunca se almacena como una columna estática** en la base de datos.
   - **Justificación:** Almacenar el semáforo como campo estático provoca desincronización temporal inevitable (por ejemplo, un proyecto cuya fecha comprometida venció anoche seguiría figurando como `ON_TRACK` hasta que alguien lo edite o corra un cron job). Calcularlo dinámicamente en tiempo de ejecución en la capa de servicios asegura que si la fecha actual supera a `target_date` y el proyecto no está completado, pase automáticamente a `DELAYED` sin requerir tareas programadas en segundo plano ni *triggers* de base de datos.
   - **Reglas del semáforo implementadas:**
     - `COMPLETED`: Si todos los hitos del proyecto están finalizados (100% de progreso).
     - `DELAYED`: Si la fecha comprometida venció (`target_date < hoy`) y el proyecto no está completado.
     - `AT_RISK`: Si la fecha comprometida está a 7 días o menos y el progreso acumulado es inferior al 70%.
     - `ON_TRACK`: En cualquier otra condición donde el avance sea coherente con la ventana de tiempo.

2. **Inicialización Automática de Hitos Base del Ciclo de Vida — [ADR-0003](../adr/0003-inicializacion-automatica-hitos-base.md):**
   - **Decisión:** Cada proyecto nuevo se inicializa de forma predeterminada con 5 hitos asociados a las fases técnicas de la ingeniería de software (`PLANNING`, `DESIGN`, `DEVELOPMENT`, `TESTING`, `READY_FOR_DEPLOY`).
   - **Justificación:** Reduce radicalmente la fricción de carga para los líderes técnicos, promoviendo de inmediato una medición estándar del pipeline sin impedir que agreguen hitos adicionales o los modifiquen según el contexto de su equipo.

3. **Arquitectura Totalmente Desacoplada (FastAPI + React 18) — [ADR-0004](../adr/0004-arquitectura-desacoplada-fastapi-react.md):**
   - **Decisión:** Separación estricta entre la API REST y la aplicación cliente SPA en lugar de un monolito acoplado con plantillas del lado del servidor.
   - **Justificación:** Permite evolución independiente, optimiza la experiencia de usuario con transiciones fluidas en el navegador (reactividad instantánea en filtros y checklist de hitos) y habilita la integración futura de otros clientes (aplicaciones móviles, extensiones de IDE o bots de CI/CD).

4. **Desarrollo Guiado por Pruebas (TDD) en el Backend — [ADR-0002](../adr/0002-modelo-relacional-hitos-borrado-cascada.md):**
   - **Decisión:** Aplicación rigurosa del ciclo *Red-Green-Refactor* antes de implementar código productivo en el backend.
   - **Justificación:** Se construyeron 31 casos de prueba cubriendo casos borde críticos (como proyectos con 0 hitos para evitar `ZeroDivisionError`, proyectos nacidos en el pasado, borrado en cascada y filtros combinados). Esto brindó absoluta certeza y robustez antes de ensamblar la interfaz visual.

5. **Progresión Secuencial Estricta de Hitos — [ADR-0005](../adr/0005-progresion-secuencial-estricta-hitos.md):**
   - **Decisión:** En el frontend, un hito solo puede completarse si todos los hitos previos ya fueron completados, y solo puede desmarcarse el último hito completado.
   - **Justificación:** Evita inconsistencias lógicas en el pipeline (como marcar "Pase a Producción" saltándose "Testing" o "Diseño") y brinda feedback visual claro con candados y tooltips descriptivos sobre qué paso técnico debe cumplirse a continuación.

---

## Cómo gestioné el contexto

Trabajar en un proyecto integral que abarca backend, frontend, base de datos y pruebas a lo largo de múltiples sesiones requiere una estrategia deliberada para prevenir el desbordamiento de contexto (*context drift*) y la pérdida del hilo por parte de los modelos de lenguaje:

1. **El archivo `AGENTS.md` como Constitución Operativa:**
   - Se estableció en la raíz del repositorio el archivo `AGENTS.md`, definiendo la visión del sistema, la estructura de carpetas, los comandos exactos de ejecución y testeo, y las reglas inviolables de arquitectura (como no persistir la salud estáticamente y usar borrado en cascada).
   - Este archivo funciona como un ancla de contexto permanente que cualquier agente lee al iniciar su intervención, impidiendo alucinaciones o cambios incompatibles de convenciones.

2. **Persistencia de Documentación Previa al Código:**
   - Antes de escribir una sola línea de código productivo, se generó y persistió en disco:
     - Una especificación formal de arquitectura y contratos (`docs/superpowers/specs/2026-10-11-dashboard-seguimiento-proyectos-design.md`).
     - Un plan de implementación desglosado en 10 tareas atómicas e independientes (`docs/superpowers/plans/2026-10-11-dashboard-seguimiento-proyectos-plan.md`).
   - Esto garantizó que cada paso del desarrollo contara con criterios de aceptación explícitos, archivos afectados y comandos de verificación predefinidos.

3. **Aislamiento en Rama Temática de Git:**
   - Todo el trabajo se mantuvo aislado en la rama de desarrollo `feature/dashboard-seguimiento`, preservando la rama principal limpia y permitiendo trazabilidad paso a paso mediante *Conventional Commits* (`feat:`, `test:`, `chore:`, `docs:`).

4. **Desarrollo Guiado por Subagentes Especializados (Subagent-Driven Development):**
   - La ejecución del plan se estructuró dividiendo las tareas entre subagentes independientes para implementación y revisión de código (*Code Reviewer*).
   - Cada subagente se ejecutó en una ventana de contexto limpia con un brief acotado a su tarea puntual, mitigando la saturación de tokens y asegurando que las revisiones detectaran discrepancias objetivamente antes de fusionar cada hito de código.

---

## Qué salió mal

Durante el ciclo de desarrollo se detectaron cuatro desvíos principales que fueron gestionados y corregidos de forma proactiva, documentando los defectos técnicos en registros BDR formales:

1. **Desvío 1: Granularidad de Hitos vs. Etapa Única de Proyecto**
   - **Qué ocurrió:** Durante el *brainstorming* preliminar se propuso inicialmente que el modelo `Project` tuviese un único campo `stage` que cambiara de forma global para representar el avance.
   - **Cómo se detectó:** Al contrastar la propuesta con los requisitos de la consigna y la necesidad de granularidad para los Tech Leads, se evidenció que un proyecto no pasa de fase de forma binaria, sino que progresa a través de múltiples tareas o hitos específicos que pueden solaparse.
   - **Cómo se corrigió:** Se rediseñó la arquitectura de datos antes de codificar, introduciendo la entidad relacional `Milestone` (1 a N). La etapa del proyecto se convirtió en una propiedad calculada que refleja la primera fase con hitos pendientes, brindando trazabilidad precisa y soporte para checklists interactivos ([ADR-0002](../adr/0002-modelo-relacional-hitos-borrado-cascada.md)).

2. **Desvío 2: Incompatibilidad de Versión de Node.js en el Entorno Host**
   - **Qué ocurrió:** El entorno del host contaba con Node.js versión `14.15.4`. El andamiaje inicial propuesto por Vite 5 y plugins modernos de React requiere de forma mandatoria Node.js 18+, lo que provocaba fallos de sintaxis en `vite.config.js` (`crypto` y módulos ESM nativos).
   - **Cómo se detectó:** Al correr el comando de verificación de build del frontend en las fases tempranas de setup.
   - **Cómo se corrigió:** En lugar de bloquear la entrega o requerir modificaciones intrusivas en el sistema operativo del evaluador, se emitió un ruling de compatibilidad fijando `vite@2.9.18` y `@vitejs/plugin-react@1.3.2` sobre `React 18`. Se ajustó la configuración para utilizar sintaxis CommonJS compatible, logrando que tanto `npm run dev` como `npm run build` compilaran de forma ultra rápida, limpia y sin errores en cualquier versión de Node compatible.

3. **Desvío 3: Salto de Scroll por Layout Shift durante Recreación del Canvas — [BDR-0001](../bdr/0001-salto-scroll-canvas-chartjs.md)**
   - **Qué ocurrió:** Al scrollear al final de la página y filtrar o buscar, la ventana saltaba momentáneamente hacia arriba por una fracción de segundo antes de retornar.
   - **Cómo se detectó:** Pruebas visuales interactivas en frontend reportadas por el usuario.
   - **Cómo se corrigió:** Análisis de causa raíz detectó que `fetchData` volvía a solicitar métricas globales innecesariamente al filtrar proyectos locales; esto provocaba que `react-chartjs-2` destruyera y recreara la instancia del canvas en `StageChart.jsx`, colapsando a 0 px por un fotograma en un contenedor sin posición `relative`, forzando el *scroll clamping* del navegador. Se desacopló `fetchProjects()` de `fetchMetrics()`, se memoizaron datos y opciones con `useMemo` y `React.memo`, y se fijó contenedor `relative overflow-hidden` con altura mínima en la grilla.

4. **Desvío 4: Parpadeo de Tarjetas Esqueleto al Alternar Filtros Vacíos — [BDR-0002](../bdr/0002-parpadeo-skeletons-filtros-vacios.md)**
   - **Qué ocurrió:** Al pasar entre dos filtros que producían ambos 0 resultados, se mostraban fugazmente 3 tarjetas esqueleto animadas vacías antes de volver a mostrar el mensaje de estado vacío.
   - **Cómo se detectó:** Validación de usabilidad al explorar combinaciones de filtros sin coincidencias.
   - **Cómo se corrigió:** La condición `loading && projects.length === 0` evaluaba verdadero durante el fetch entre estados vacíos. Se reemplazó la bandera por `initialLoading`, restringiendo los skeletons exclusivamente al montaje inicial de la app y garantizando transiciones estables entre estados vacíos sin parpadeos.
