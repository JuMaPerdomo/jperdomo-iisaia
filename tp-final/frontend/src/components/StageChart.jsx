import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register required Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const STAGES = [
  { key: 'PLANNING', label: 'Planificación', color: 'rgba(59, 130, 246, 0.8)', borderColor: 'rgb(37, 99, 235)' },
  { key: 'DESIGN', label: 'Diseño', color: 'rgba(99, 102, 241, 0.8)', borderColor: 'rgb(79, 70, 229)' },
  { key: 'DEVELOPMENT', label: 'Desarrollo', color: 'rgba(139, 92, 246, 0.8)', borderColor: 'rgb(124, 58, 237)' },
  { key: 'TESTING', label: 'Testing/QA', color: 'rgba(234, 179, 8, 0.8)', borderColor: 'rgb(202, 138, 4)' },
  { key: 'READY_FOR_DEPLOY', label: 'Listo Deploy', color: 'rgba(16, 185, 129, 0.8)', borderColor: 'rgb(5, 150, 105)' },
  { key: 'DONE', label: 'Finalizado', color: 'rgba(14, 165, 233, 0.8)', borderColor: 'rgb(2, 132, 199)' },
];

/**
 * Bar chart displaying distribution of projects across lifecycle stages.
 *
 * @param {Object} props
 * @param {Record<string, number>} [props.stageDistribution] - Key-value pair mapping stage enums to counts
 * @param {boolean} [props.isDark] - Whether dark mode is currently active
 */
function StageChart({ stageDistribution = {}, isDark = false }) {
  const data = useMemo(() => {
    const labels = STAGES.map((s) => s.label);
    const dataValues = STAGES.map((s) =>
      stageDistribution && stageDistribution[s.key] != null ? stageDistribution[s.key] : 0
    );

    return {
      labels,
      datasets: [
        {
          label: 'Proyectos',
          data: dataValues,
          backgroundColor: STAGES.map((s) => s.color),
          borderColor: STAGES.map((s) => s.borderColor),
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [stageDistribution]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(17, 24, 39, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (context) => ` ${context.parsed.y} proyecto${context.parsed.y === 1 ? '' : 's'}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0,
            color: isDark ? '#9ca3af' : '#6b7280',
            font: {
              size: 11,
            },
          },
          grid: {
            color: isDark ? 'rgba(75, 85, 99, 0.25)' : 'rgba(243, 244, 246, 1)',
          },
        },
        x: {
          ticks: {
            color: isDark ? '#d1d5db' : '#4b5563',
            font: {
              size: 11,
              weight: '500',
            },
          },
          grid: {
            display: false,
          },
        },
      },
    }),
    [isDark]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Distribución por Fase del Ciclo de Vida
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Cantidad de proyectos clasificados según su fase de avance actual
          </p>
        </div>
      </div>
      <div className="relative h-64 sm:h-72 w-full overflow-hidden">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default React.memo(StageChart);
