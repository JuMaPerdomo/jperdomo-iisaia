import React from 'react';
import { FolderKanban, Plus } from 'lucide-react';

/**
 * Navbar component for Project Tracking Dashboard.
 *
 * @param {Object} props
 * @param {() => void} [props.onNewProjectClick] - Callback invoked when the user clicks "+ Nuevo Proyecto"
 */
export default function Navbar({ onNewProjectClick }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand section */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white shadow-sm">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                Project Tracking Dashboard
              </h1>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                Seguimiento Ejecutivo y Gestión de Riesgo
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNewProjectClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Proyecto</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
