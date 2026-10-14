# ADR-0004: Arquitectura Desacoplada Client-Server (FastAPI REST + React 18 SPA)

- **Fecha:** 2026-10-11
- **Estado:** Aceptado
- **Decisores:** Equipo de Ingeniería & Alumno

---

## Contexto

Para la implementación del sistema se evaluaron dos paradigmas arquitectónicos principales:

1. **Monolito con Server-Side Rendering (SSR):** Aplicación en Python con FastAPI/Flask renderizando plantillas HTML con Jinja2.
2. **Arquitectura Desacoplada (Decoupled Client-Server):** Servidor API REST stateless en FastAPI (Python) consumido de forma asíncrona por una aplicación SPA (Single Page Application) en React 18 construida con Vite y estilizada con Tailwind CSS.

---

## Decisión

Se adopta una **Arquitectura Totalmente Desacoplada**:

- **Backend:** FastAPI exponiendo endpoints JSON RESTful bajo `/api/...`, validaciones estrictas mediante esquemas Pydantic v2, documentación OpenAPI/Swagger automática (`/docs`) y middleware CORS explícito configurado para orígenes confiables (`http://localhost:5173`).
- **Frontend:** SPA interactiva en React 18 con Vite, Tailwind CSS para diseño responsivo moderno y Chart.js con `react-chartjs-2` para visualizaciones ejecutivas.
- **Cliente HTTP:** Módulo aislado `frontend/src/api/client.js` centralizando todas las peticiones asíncronas con `fetch`.

---

## Consecuencias

### Positivas (Pros)

- **Experiencia de usuario fluida e instantánea:** No hay recargas completas de página al filtrar por salud o fase, buscar proyectos o marcar hitos.
- **Separación de responsabilidades:** El backend se enfoca en lógica de dominio, persistencia e integridad de datos; el frontend se enfoca en presentación, accesibilidad y usabilidad.
- **Evolución futura:** La API REST queda lista para ser consumida por otros clientes (apps móviles, extensiones de IDE, bots de Slack/Discord o pipelines de CI/CD).
- **Testabilidad independiente:** Backend testeable al 100% con Pytest sin necesidad de navegador; frontend verificable con tests de componentes o builds estáticos.

### Trade-offs / Mitigaciones (Cons)

- Requiere gestionar CORS (*Cross-Origin Resource Sharing*) y levantar dos procesos de desarrollo en local (`uvicorn` en puerto 8000 y `vite` en puerto 5173), lo cual quedó estandarizado en los scripts de ejecución y en `AGENTS.md`.
