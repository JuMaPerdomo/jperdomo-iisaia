# 💻 Frontend — Project Tracking Dashboard SPA

Aplicación de página única (SPA) interactiva construida con **React 18**, **Vite** y **Tailwind CSS** para la visualización y gestión en tiempo real de proyectos de software.

---

## 🛠️ Tecnologías y Librerías

- **Framework:** [React 18](https://react.dev/)
- **Bundler & Dev Server:** [Vite](https://vitejs.dev/)
- **Estilos:** [Tailwind CSS 3](https://tailwindcss.com/)
- **Visualización de Datos:** [Chart.js](https://www.chartjs.org/) y [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Iconografía:** [Lucide React](https://lucide.dev/)

---

## 📂 Estructura del Código

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js         # Cliente HTTP para consumo de endpoints de la API FastAPI
│   ├── components/
│   │   ├── Navbar.jsx        # Barra superior con branding y botón de "Nuevo Proyecto"
│   │   ├── MetricCards.jsx   # Tarjetas superiores de KPIs ejecutivos (Total, On Track, At Risk, Delayed)
│   │   ├── StageChart.jsx    # Gráfico Donut de distribución por fase técnica (Chart.js)
│   │   ├── FilterBar.jsx     # Buscador por texto y filtros rápidos por semáforo de salud
│   │   ├── ProjectCard.jsx   # Tarjeta de proyecto con barra de avance, fechas y controles
│   │   ├── MilestoneList.jsx # Checklist interactivo de hitos por fase técnica
│   │   └── ProjectModal.jsx  # Modal para crear y editar proyectos e hitos
│   ├── App.jsx               # Orquestación de estado global, carga paralela y alertas
│   ├── index.css             # Directivas de Tailwind CSS
│   └── main.jsx              # Punto de entrada de React en el DOM
├── index.html                # Plantilla HTML principal
├── package.json              # Dependencias y scripts
├── tailwind.config.js        # Configuración de colores y tema de Tailwind
├── postcss.config.js         # Plugins PostCSS
├── vite.config.js            # Configuración de Vite y proxy local al backend (:8000)
└── README.md                 # Esta guía
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Instalar Dependencias

Desde la carpeta `frontend/`:
```bash
npm install
```

### 2. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en:
👉 **`http://localhost:5173`**

*(Nota: Asegúrate de tener el backend corriendo en el puerto 8000 para sincronización en tiempo real).*

---

## 📦 Compilación para Producción

Para compilar y verificar el empaquetado optimizado:

```bash
npm run build
```

Los artefactos listos para servir se generarán en la carpeta `dist/`.

---

## 🌟 Funcionalidades Interactivas

- **KPIs en Tiempo Real:** Actualización automática de contadores al modificar o agregar proyectos.
- **Gráfico de Etapas Reactivo:** El gráfico Donut se recalcula dinámicamente según la fase actual de cada proyecto.
- **Checklist de Hitos con Recálculo Inmediato:** Marcar un hito como completado o en progreso impacta al instante la barra de progreso del proyecto y su semáforo de salud.
- **Filtros Combinables:** Permite buscar por texto libre (en nombre o descripción) y simultáneamente filtrar por estado de salud (`ON TRACK`, `AT RISK`, `DELAYED`, `COMPLETED`).
- **Gestión Completa (CRUD):** Creación y edición intuitiva a través de un modal con validaciones de formularios y confirmaciones de eliminación.
