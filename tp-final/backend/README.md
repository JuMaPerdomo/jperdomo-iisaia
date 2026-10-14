# ⚙️ Backend — Project Tracking Dashboard API

Servicio API REST construido con **FastAPI**, **SQLAlchemy 2.0** y **SQLite** para la gestión de proyectos, hitos y cálculo dinámico de métricas de salud en tiempo real.

---

## 🛠️ Tecnologías y Librerías

- **Framework Web:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **ORM & Persistencia:** [SQLAlchemy 2.0](https://www.sqlalchemy.org/) con base de datos SQLite (`projects.db`)
- **Validación y Esquemas:** [Pydantic v2](https://docs.pydantic.dev/)
- **Servidor ASGI:** [Uvicorn](https://www.uvicorn.org/)
- **Testing:** [Pytest](https://pytest.org/) con `httpx` y SQLite en memoria para tests aislados

---

## 📂 Estructura del Código

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # Entrypoint de FastAPI, middleware CORS y definición de rutas REST
│   ├── database.py       # Engine SQLite, sesión SQLAlchemy y dependencia get_db
│   ├── models.py         # Modelos relacionales ORM (Project, Milestone) y enums de dominio
│   ├── schemas.py        # DTOs y esquemas de validación de entrada/salida (Pydantic v2)
│   ├── crud.py           # Consultas a base de datos, mutaciones y agregaciones
│   └── services.py       # Lógica pura: cálculo dinámico de salud y generación de hitos base
├── tests/
│   ├── __init__.py
│   ├── conftest.py       # Fixture de base de datos SQLite en memoria y cliente TestClient
│   ├── test_models.py    # Pruebas de modelos relacionales y borrado en cascada
│   ├── test_services.py  # Pruebas de reglas de negocio y cálculo del semáforo
│   ├── test_crud.py      # Pruebas de operaciones de persistencia y métricas
│   └── test_api.py       # Pruebas de integración de endpoints REST y CORS
├── pytest.ini            # Configuración de Pytest (rootdir y testpaths)
├── requirements.txt      # Dependencias del backend
└── README.md             # Esta guía
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Crear y Activar Entorno Virtual

- **Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```

- **Linux / macOS:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

### 2. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 3. Iniciar el Servidor de Desarrollo

```bash
uvicorn app.main:app --reload --port 8000
```

- **URL Base:** `http://localhost:8000`
- **Swagger UI Interactivo:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción | Status |
|---|---|---|---|
| `GET` | `/api/projects` | Lista proyectos con filtros (`search`, `health`, `stage`) | `200 OK` |
| `POST` | `/api/projects` | Crea proyecto e inicializa sus 5 hitos por defecto | `201 Created` |
| `GET` | `/api/projects/{id}` | Obtiene detalle de un proyecto con sus hitos | `200 OK` / `404` |
| `PUT` | `/api/projects/{id}` | Actualiza metadatos de un proyecto | `200 OK` / `404` |
| `DELETE` | `/api/projects/{id}` | Elimina proyecto y sus hitos en cascada | `204 No Content` / `404` |
| `POST` | `/api/projects/{id}/milestones` | Agrega un nuevo hito a un proyecto | `201 Created` / `404` |
| `PATCH` | `/api/projects/{id}/milestones/{m_id}` | Actualiza estado (`PENDING`, `IN_PROGRESS`, `COMPLETED`) o título de hito | `200 OK` / `404` |
| `DELETE` | `/api/projects/{id}/milestones/{m_id}` | Elimina un hito específico | `204 No Content` / `404` |
| `GET` | `/api/metrics` | Métricas agregadas (totales, salud y etapas) | `200 OK` |

---

## 🧠 Lógica de Negocio: Cálculo Dinámico de Salud

El estado de salud **no es persistente** en la base de datos; se calcula dinámicamente en tiempo de ejecución:

1. **`COMPLETED`**: Si todos los hitos del proyecto están completados (100% de progreso).
2. **`DELAYED`**: Si la fecha objetivo venció (`target_date < today`) y el proyecto no está completado.
3. **`AT_RISK`**: Si la fecha objetivo está a 7 días o menos y el progreso es menor al 70%.
4. **`ON_TRACK`**: En cualquier otro escenario normal de avance.

---

## 🧪 Ejecución de Pruebas Automatizadas

Para correr la suite de pruebas completa:

```bash
pytest backend/tests/ -v
```

O utilizando el entorno virtual directamente:
```bash
.venv/Scripts/pytest tests/ -v
```
