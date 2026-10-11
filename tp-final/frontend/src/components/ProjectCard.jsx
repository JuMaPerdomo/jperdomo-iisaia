import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Edit3, Trash2 } from 'lucide-react';
import MilestoneList from './MilestoneList';

const HEALTH_THEMES = {
  ON_TRACK: {
    label: '🟢 En Regla',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bar: 'bg-emerald-500',
  },
  AT_RISK: {
    label: '🟡 En Riesgo',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'bg-amber-500',
  },
  DELAYED: {
    label: '🔴 Demorado',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    bar: 'bg-rose-500',
  },
  COMPLETED: {
    label: '🔵 Finalizado',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    bar: 'bg-blue-500',
  },
};

const STAGE_THEMES = {
  PLANNING: { label: 'Planificación', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  DESIGN: { label: 'Diseño', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  DEVELOPMENT: { label: 'Desarrollo', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  TESTING: { label: 'Testing / QA', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  READY_FOR_DEPLOY: { label: 'Listo Deploy', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DONE: { label: 'Finalizado', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
};

function formatTargetDate(dateStr) {
  if (!dateStr) return 'Sin fecha';
  try {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

function getDaysRemainingBadge(dateStr, healthStatus) {
  if (!dateStr) return null;
  if (healthStatus === 'COMPLETED') {
    return {
      text: 'Finalizado',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  const parts = String(dateStr).split('-');
  if (parts.length !== 3) return null;

  const targetYear = parseInt(parts[0], 10);
  const targetMonth = parseInt(parts[1], 10) - 1;
  const targetDay = parseInt(parts[2], 10);

  const target = new Date(targetYear, targetMonth, targetDay);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    return {
      text: `${overdue} día${overdue === 1 ? '' : 's'} demorado`,
      className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    };
  }
  if (diffDays === 0) {
    return {
      text: 'Vence hoy',
      className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    };
  }
  return {
    text: `${diffDays} día${diffDays === 1 ? '' : 's'} restante${diffDays === 1 ? '' : 's'}`,
    className:
      diffDays <= 7
        ? 'bg-amber-50 text-amber-700 border-amber-200 font-medium'
        : 'bg-gray-100 text-gray-600 border-gray-200 font-medium',
  };
}

/**
 * ProjectCard component representing an individual project with health status,
 * progress bar, target date, action buttons, and milestone accordion.
 *
 * @param {Object} props
 * @param {Object} props.project
 * @param {(project: Object) => void} props.onEditProject
 * @param {(projectId: number|string) => void} props.onDeleteProject
 * @param {(projectId: number|string, milestoneId: number|string, currentStatus: string) => void} props.onToggleMilestone
 */
export default function ProjectCard({
  project,
  onEditProject,
  onDeleteProject,
  onToggleMilestone,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!project) return null;

  const milestones = project.milestones || [];
  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => m.status === 'COMPLETED').length;
  const progressPercentage =
    project.progress != null
      ? Math.round(project.progress)
      : totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  const health = HEALTH_THEMES[project.health_status] || {
    label: project.health_status || 'En Regla',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    bar: 'bg-gray-400',
  };

  const stage = STAGE_THEMES[project.current_stage] || {
    label: project.current_stage || 'Planificación',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const daysBadge = getDaysRemainingBadge(project.target_date, project.health_status);
  const formattedDate = formatTargetDate(project.target_date);

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between overflow-hidden">
      <div className="p-5 space-y-4">
        {/* Header: Stage, Health Badge, and Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${stage.badge}`}
            >
              {stage.label}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${health.badge}`}
            >
              {health.label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEditProject && onEditProject(project)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Editar proyecto"
              aria-label="Editar proyecto"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteProject && onDeleteProject(project.id)}
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              title="Eliminar proyecto"
              aria-label="Eliminar proyecto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Title & Description */}
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-snug tracking-tight">
            {project.name}
          </h3>
          {project.description ? (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {project.description}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1 italic">
              Sin descripción adicional
            </p>
          )}
        </div>

        {/* Target Date with days remaining / overdue badge */}
        <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Entrega: {formattedDate}</span>
          </div>
          {daysBadge && (
            <span className={`px-2 py-0.5 rounded text-[11px] border ${daysBadge.className}`}>
              {daysBadge.text}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-medium text-gray-700">
            <span>Progreso</span>
            <span className="font-semibold text-gray-900">
              {progressPercentage}% ({completedCount}/{totalCount} hitos)
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${health.bar}`}
              style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Collapsible Accordion for Milestones */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-3 flex items-center justify-between text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100/60 transition-colors focus:outline-none"
          aria-expanded={isExpanded}
        >
          <span>Hitos del Proyecto ({totalCount})</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="px-5 pb-4 pt-1">
            <MilestoneList
              milestones={milestones}
              projectId={project.id}
              onToggleMilestone={onToggleMilestone}
            />
          </div>
        )}
      </div>
    </article>
  );
}
