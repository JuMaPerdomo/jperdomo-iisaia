import React from 'react';
import { Check, Calendar } from 'lucide-react';

const STAGE_CONFIG = {
  PLANNING: { label: 'Planificación', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  DESIGN: { label: 'Diseño', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  DEVELOPMENT: { label: 'Desarrollo', badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  TESTING: { label: 'Testing/QA', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  READY_FOR_DEPLOY: { label: 'Listo Deploy', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DONE: { label: 'Finalizado', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
};

function formatDueDate(dateStr) {
  if (!dateStr) return null;
  try {
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * MilestoneList component for rendering interactive project milestones.
 *
 * @param {Object} props
 * @param {Array<{id: number|string, title: string, stage: string, status: string, due_date?: string}>} [props.milestones]
 * @param {number|string} props.projectId
 * @param {(projectId: number|string, milestoneId: number|string, currentStatus: string) => void} props.onToggleMilestone
 */
export default function MilestoneList({
  milestones = [],
  projectId,
  onToggleMilestone,
}) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-gray-500 bg-gray-50/70 rounded-lg border border-dashed border-gray-200">
        No hay hitos registrados para este proyecto.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 bg-gray-50/60 rounded-lg border border-gray-200 overflow-hidden">
      {milestones.map((milestone) => {
        const isCompleted = milestone.status === 'COMPLETED';
        const stageInfo = STAGE_CONFIG[milestone.stage] || {
          label: milestone.stage,
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
        };
        const formattedDate = formatDueDate(milestone.due_date);

        return (
          <li
            key={milestone.id}
            className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-gray-100/50 transition-colors"
          >
            {/* Checkbox and Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onToggleMilestone && onToggleMilestone(projectId, milestone.id, milestone.status)}
                className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border-2 border-gray-300 bg-white hover:border-emerald-500'
                }`}
                aria-label={isCompleted ? `Marcar "${milestone.title}" como pendiente` : `Marcar "${milestone.title}" como completado`}
              >
                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>

              <span
                className={`text-sm truncate transition-colors ${
                  isCompleted
                    ? 'line-through text-gray-400 font-normal'
                    : 'text-gray-800 font-medium'
                }`}
                title={milestone.title}
              >
                {milestone.title}
              </span>
            </div>

            {/* Stage badge and optional Due Date */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {formattedDate && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {formattedDate}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${stageInfo.badge}`}
              >
                {stageInfo.label}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
