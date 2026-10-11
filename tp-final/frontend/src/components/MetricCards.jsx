import React from 'react';
import { FolderKanban, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

/**
 * Executive KPI cards for Project Tracking Dashboard.
 *
 * @param {Object} props
 * @param {Object} [props.metrics] - Aggregated metrics object
 * @param {number} [props.metrics.total_projects] - Total count of projects
 * @param {number} [props.metrics.active_projects] - Count of ongoing projects
 * @param {number} [props.metrics.completed_projects] - Count of completed projects
 * @param {Object} [props.metrics.health_summary] - Health breakdown
 * @param {number} [props.metrics.health_summary.on_track] - Count of on track projects
 * @param {number} [props.metrics.health_summary.at_risk] - Count of at risk projects
 * @param {number} [props.metrics.health_summary.delayed] - Count of delayed projects
 * @param {number} [props.metrics.health_summary.completed] - Count of completed projects
 */
export default function MetricCards({ metrics }) {
  const total = metrics?.total_projects ?? 0;
  const onTrack = metrics?.health_summary?.on_track ?? 0;
  const atRisk = metrics?.health_summary?.at_risk ?? 0;
  const delayed = metrics?.health_summary?.delayed ?? 0;
  const active = metrics?.active_projects ?? 0;
  const completed = metrics?.completed_projects ?? (metrics?.health_summary?.completed ?? 0);

  const cards = [
    {
      id: 'total',
      title: 'Total de Proyectos',
      value: total,
      subtitle: `${active} activos · ${completed} completados`,
      icon: FolderKanban,
      borderColor: 'border-gray-200',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      valueColor: 'text-gray-900',
      badgeColor: 'bg-gray-100 text-gray-700',
    },
    {
      id: 'on_track',
      title: 'En Regla',
      value: onTrack,
      subtitle: 'Cronograma y ritmo saludable',
      icon: CheckCircle2,
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      badgeColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'at_risk',
      title: 'En Riesgo',
      value: atRisk,
      subtitle: 'Fecha próxima (< 7d) y bajo avance',
      icon: AlertTriangle,
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
      badgeColor: 'bg-amber-50 text-amber-700',
    },
    {
      id: 'delayed',
      title: 'Demorados',
      value: delayed,
      subtitle: 'Fecha objetivo vencida',
      icon: AlertCircle,
      borderColor: 'border-rose-200',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      valueColor: 'text-rose-700',
      badgeColor: 'bg-rose-50 text-rose-700',
    },
  ];

  return (
    <section aria-label="Métricas del dashboard" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`bg-white rounded-xl border ${card.borderColor} p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-sm font-medium text-gray-600">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-lg ${card.iconBg} ${card.iconColor}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className={`text-3xl font-extrabold tracking-tight ${card.valueColor}`}>
                {card.value}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-medium truncate">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
