# 🚀 Project Tracking Dashboard

> **Dashboard de Seguimiento de Proyectos de Software con control de hitos por ciclo de vida técnico y cálculo dinámico de salud y riesgos en tiempo real.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-2.9-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Pytest](https://img.shields.io/badge/Tests-31%20Passed-brightgreen?logo=pytest&logoColor=white)](https://pytest.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Descripción General

El **Project Tracking Dashboard** es una solución integral y desacoplada diseñada para Tech Leads, Project Managers y Directores que requieren visibilidad ejecutiva centralizada sobre el estado de sus proyectos de software.

Permite monitorear en una sola pantalla:

- **Indicadores Clave (KPIs):** Total de proyectos y contadores por estado de salud (`ON TRACK`, `AT RISK`, `DELAYED`, `COMPLETED`).
- **Distribución de Etapas:** Gráfico interactivo tipo Donut (`Chart.js`) con proyectos agrupados según su fase activa (`PLANNING`, `DESIGN`, `DEVELOPMENT`, `TESTING`, `READY_FOR_DEPLOY`).
- **Tarjetas de Proyecto:** Semáforo de salud automático, barra de progreso calculada sobre hitos completados y fecha comprometida de entrega (*target date*).
- **Control de Hitos por Fase:** Checklist interactivo que permite marcar hitos como completados o en progreso, recalculando instantáneamente el avance del proyecto.
- **Búsqueda y Filtros Rápidos:** Filtrado instantáneo por nombre/descripción y chips para aislar proyectos en riesgo o demorados.

---

## 🏛️ Arquitectura del Sistema

El proyecto está diseñado bajo un modelo desacoplado cliente-servidor:

```text
tp-final/
├── backend/                  # API REST en FastAPI (Python)
│   ├── app/                  # Lógica del servidor, modelos ORM, schemas y servicios
│   ├── tests/                # 31 pruebas unitarias y de integración (Pytest)
│   └── requirements.txt
├── frontend/                 # Aplicación Web SPA en React 18 + Vite + Tailwind CSS
│   ├── src/                  # Componentes interactivos, gráficas y cliente API
│   └── package.json
├── docs/                     # Documentación organizada del proyecto
│   ├── adr/                  # 5 Registros de Decisiones de Arquitectura (ADRs)
│   ├── bdr/                  # 2 Registros de Decisiones de Bugs (BDRs)
│   ├── dev/                  # Material inicial de desarrollo (consigna.md, idea.md, estados.md)
│   ├── informe/              # Informe oficial de entrega para el Demo Day (informe.md)
│   └── superpowers/         # Especificación técnica (specs) y planes de desarrollo (plans)
└── AGENTS.md                 # Contrato operativo y gobernanza de contexto para agentes de IA
```

---

## ⚡ Guía de Inicio Rápido (Quickstart)

### Prerrequisitos

- **Python 3.10+** (recomendado Python 3.11 o 3.13)
- **Node.js** (v14.15.4+ o Node 18+) y **NPM**

---

### 1. Levantar el Backend

```bash
# 1. Ingresar al directorio del backend
cd backend

# 2. Crear y activar entorno virtual
# En Windows (PowerShell):
python -m venv .venv
.venv\Scripts\Activate.ps1

# En Linux / macOS:
python3 -m venv .venv
source .venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Iniciar el servidor
uvicorn app.main:app --reload --port 8000
```

- 🌐 **API REST:** [http://localhost:8000](http://localhost:8000)
- 📖 **Swagger UI interactivo:** [http://localhost:8000/docs](http://localhost:8000/docs)
- 📑 **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2. Levantar el Frontend

En una terminal separada:

```bash
# 1. Ingresar al directorio del frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo Vite
npm run dev
```

- 💻 **Dashboard en el navegador:** [http://localhost:5173](http://localhost:5173)

---

## 🧪 Pruebas y Verificación

### Backend (Pytest)

Para correr la suite completa de 31 pruebas automatizadas con reporte detallado:

```bash
backend/.venv/Scripts/pytest backend/tests/ -v
```

Las pruebas cubren:

- Cálculo dinámico de salud y casos límite (proyectos con 0 hitos, fechas pasadas, entregas inminentes).
- Modelos relacionales y borrado en cascada con SQLite en memoria.
- Operaciones CRUD y agregaciones de métricas.
- Endpoints HTTP REST, validación de schemas Pydantic y cabeceras CORS.

### Frontend (Build Check)

Para verificar la compilación estática y empaquetado para producción:

```bash
cd frontend && npm run build
```

---

## 💡 Decisiones Clave de Diseño

1. **Cálculo Dinámico de Salud en Runtime:** El estado de salud (`ON_TRACK`, `AT_RISK`, `DELAYED`, `COMPLETED`) nunca se guarda en la base de datos. Se calcula al vuelo en cada consulta, garantizando que un proyecto cuya fecha límite venció pase a `DELAYED` sin requerir cron jobs ni triggers.
2. **5 Hitos Base por Defecto:** Al crear un proyecto se inicializan automáticamente los 5 hitos base de ingeniería de software (`PLANNING`, `DESIGN`, `DEVELOPMENT`, `TESTING`, `READY_FOR_DEPLOY`), reduciendo la fricción inicial.
3. **Persistencia Relacional con Borrado en Cascada:** Los hitos pertenecen a un proyecto y se eliminan en cascada (`cascade="all, delete-orphan"`), garantizando la integridad de datos.
4. **Desarrollo Guiado por TDD:** El backend fue desarrollado 100% bajo el ciclo *Red-Green-Refactor*.

---

## 📄 Documentación Adicional

- [Informe de Entrega y Defensa (docs/informe/informe.md)](file:///c:/git/jperdomo-iisaia/tp-final/docs/informe/informe.md): Respuestas detalladas a los 5 ejes requeridos para el Demo Day.
- [Consigna Original y Documentos de Desarrollo (docs/dev/)](file:///c:/git/jperdomo-iisaia/tp-final/docs/dev/consigna.md): Requisitos académicos y notas iniciales de diseño.
- [Registros de Decisiones de Arquitectura (ADRs)](file:///c:/git/jperdomo-iisaia/tp-final/docs/adr/README.md): 5 registros formales Nygard de diseño y arquitectura.
- [Registros de Decisiones de Bugs (BDRs)](file:///c:/git/jperdomo-iisaia/tp-final/docs/bdr/README.md): 2 registros con análisis de causa raíz y medidas preventivas.
- [Gobernanza de Agentes (AGENTS.md)](file:///c:/git/jperdomo-iisaia/tp-final/AGENTS.md): Reglas de arquitectura, testing y contexto para agentes de IA.
- [Especificación Técnica](file:///c:/git/jperdomo-iisaia/tp-final/docs/superpowers/specs/2026-10-11-dashboard-seguimiento-proyectos-design.md): Documento de diseño formal del sistema.
