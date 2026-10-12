import React from 'react';
import { Check, Calendar, Lock } from 'lucide-react';

const STAGE_CONFIG = {
  PLANNING: { label: 'Planificación', badge: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  DESIGN: { label: 'Diseño', badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  DEVELOPMENT: { label: 'Desarrollo', badge: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  TESTING: { label: 'Testing/QA', badge: 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
  READY_FOR_DEPLOY: { label: 'Listo Deploy', badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  DONE: { label: 'Finalizado', badge: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
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
 * Enforces sequential progression: a milestone can only be completed if all
 * prior milestones are completed, and can only be uncompleted if no subsequent
 * milestones are completed.
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
      <div className="py-4 text-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50/70 dark:bg-gray-950/70 rounded-lg border border-dashed border-gray-200 dark:border-gray-800">
        No hay hitos registrados para este proyecto.
      </div>
    );
  }

  // Determine indices for sequential progression
  const firstPendingIndex = milestones.findIndex((m) => m.status !== 'COMPLETED');
  let lastCompletedIndex = -1;
  for (let i = milestones.length - 1; i >= 0; i--) {
    if (milestones[i].status === 'COMPLETED') {
      lastCompletedIndex = i;
      break;
    }
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800/80 bg-gray-50/60 dark:bg-gray-950/80 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
      {milestones.map((milestone, index) => {
        const isCompleted = milestone.status === 'COMPLETED';
        const stageInfo = STAGE_CONFIG[milestone.stage] || {
          label: milestone.stage,
          badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
        };
        const formattedDate = formatDueDate(milestone.due_date);

        // Sequential validation
        let canToggle = false;
        let lockReason = '';

        if (!isCompleted) {
          if (index === firstPendingIndex) {
            canToggle = true;
          } else {
            const prevPending = milestones[firstPendingIndex];
            lockReason = prevPending
              ? `Debe completar primero "${prevPending.title}" para avanzar.`
              : 'Debe completar los hitos anteriores primero.';
          }
        } else {
          if (index === lastCompletedIndex) {
            canToggle = true;
          } else {
            const nextCompleted = milestones[index + 1];
            lockReason = nextCompleted
              ? `Debe desmarcar primero "${nextCompleted.title}" para retroceder.`
              : 'Debe desmarcar los hitos posteriores primero.';
          }
        }

        const actionTooltip = canToggle
          ? isCompleted
            ? `Marcar "${milestone.title}" como pendiente`
            : `Marcar "${milestone.title}" como completado`
          : lockReason;

        return (
          <li
            key={milestone.id}
            className={`flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors ${
              canToggle
                ? 'hover:bg-gray-100/50 dark:hover:bg-gray-900/80'
                : 'opacity-85'
            }`}
          >
            {/* Checkbox and Title */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                disabled={!canToggle}
                onClick={() => canToggle && onToggleMilestone && onToggleMilestone(projectId, milestone.id, milestone.status)}
                className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors focus:outline-none ${
                  canToggle
                    ? isCompleted
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500'
                      : 'border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-900 hover:border-emerald-500 dark:hover:border-emerald-400 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500'
                    : isCompleted
                      ? 'bg-emerald-600/70 text-white/80 cursor-not-allowed'
                      : 'border-2 border-gray-200 dark:border-gray-700 bg-gray-100/80 dark:bg-gray-800/50 cursor-not-allowed opacity-60'
                }`}
                title={actionTooltip}
                aria-label={actionTooltip}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : !canToggle ? (
                  <Lock className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                ) : null}
              </button>

              <span
                className={`text-sm truncate transition-colors ${
                  isCompleted
                    ? 'line-through text-gray-400 dark:text-gray-500 font-normal'
                    : canToggle
                      ? 'text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-500 dark:text-gray-400 font-normal'
                }`}
                title={!canToggle ? lockReason : milestone.title}
              >
                {milestone.title}
              </span>
            </div>

            {/* Stage badge and optional Due Date */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {formattedDate && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  <Calendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
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
