import React from 'react';
import { Search, X, Filter } from 'lucide-react';

const HEALTH_OPTIONS = [
  { key: 'ALL', label: 'Todos' },
  { key: 'ON_TRACK', label: '🟢 En Regla' },
  { key: 'AT_RISK', label: '🟡 En Riesgo' },
  { key: 'DELAYED', label: '🔴 Demorados' },
  { key: 'COMPLETED', label: '🔵 Finalizados' },
];

const STAGE_OPTIONS = [
  { key: 'ALL', label: 'Todas las fases' },
  { key: 'PLANNING', label: 'Planificación' },
  { key: 'DESIGN', label: 'Diseño' },
  { key: 'DEVELOPMENT', label: 'Desarrollo' },
  { key: 'TESTING', label: 'Testing / QA' },
  { key: 'READY_FOR_DEPLOY', label: 'Listo Deploy' },
  { key: 'DONE', label: 'Finalizado' },
];

/**
 * FilterBar component for real-time search and health/stage filtering.
 *
 * @param {Object} props
 * @param {string} props.searchTerm
 * @param {(value: string) => void} props.onSearchChange
 * @param {string} props.selectedHealth
 * @param {(healthKey: string) => void} props.onHealthSelect
 * @param {string} props.selectedStage
 * @param {(stageKey: string) => void} props.onStageSelect
 */
export default function FilterBar({
  searchTerm = '',
  onSearchChange,
  selectedHealth = 'ALL',
  onHealthSelect,
  selectedStage = 'ALL',
  onStageSelect,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Buscar proyectos por nombre o descripción..."
            className="w-full pl-10 pr-9 py-2 text-sm bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange && onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stage Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="stage-filter" className="text-xs font-semibold text-gray-500 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Fase:</span>
          </label>
          <select
            id="stage-filter"
            value={selectedStage}
            onChange={(e) => onStageSelect && onStageSelect(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white cursor-pointer transition-colors"
          >
            {STAGE_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Health Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
        <span className="text-xs font-semibold text-gray-500 mr-1">
          Salud:
        </span>
        {HEALTH_OPTIONS.map((opt) => {
          const isSelected = selectedHealth === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onHealthSelect && onHealthSelect(opt.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
