import React, { useState, useEffect } from 'react';
import { X, Loader2, FolderPlus, Edit3, Calendar } from 'lucide-react';

/**
 * Modal dialog component for creating or editing projects.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal dialog is visible
 * @param {() => void} props.onClose - Callback to close the modal
 * @param {(data: { name: string, description: string, target_date: string }) => Promise<void>} props.onSave - Callback on submit
 * @param {Object|null} [props.project] - Project to edit, or null when creating
 */
export default function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project = null,
}) {
  const isEditing = Boolean(project);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_date: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever the modal opens or the active project changes
  useEffect(() => {
    if (isOpen) {
      if (project) {
        setFormData({
          name: project.name || '',
          description: project.description || '',
          target_date: project.target_date || '',
        });
      } else {
        setFormData({
          name: '',
          description: '',
          target_date: '',
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, project]);

  // Handle ESC key press to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  function validate() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del proyecto es obligatorio.';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede exceder los 100 caracteres.';
    }

    if (!formData.target_date) {
      newErrors.target_date = 'La fecha objetivo de entrega es obligatoria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: null }));

    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        target_date: formData.target_date,
      });
      onClose();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Ocurrió un error al guardar el proyecto. Intente nuevamente.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 flex items-center justify-between bg-gray-50/70 dark:bg-gray-900 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/70 border border-blue-200/50 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              {isEditing ? <Edit3 className="w-4 h-4 stroke-[2.2]" /> : <FolderPlus className="w-4 h-4 stroke-[2.2]" />}
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {isEditing ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEditing ? 'Modifique los datos generales del proyecto' : 'Complete los datos para inicializar el proyecto y sus 5 hitos'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-lg font-medium">
              {errors.submit}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label htmlFor="project-name" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nombre del Proyecto <span className="text-rose-500">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              maxLength={100}
              required
              disabled={isSubmitting}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Portal de Clientes v2"
              className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30 dark:bg-rose-950/30'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.name ? (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.name}</span>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-gray-400 dark:text-gray-500">{formData.name.length}/100</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="project-description" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Descripción <span className="text-gray-400 dark:text-gray-500 font-normal">(opcional)</span>
            </label>
            <textarea
              id="project-description"
              rows={3}
              disabled={isSubmitting}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve resumen de objetivos, alcance técnico o contexto..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Target Date */}
          <div>
            <label htmlFor="project-target-date" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Fecha Objetivo de Entrega <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="project-target-date"
                type="date"
                required
                disabled={isSubmitting}
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-gray-900 border rounded-lg text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 ${
                  errors.target_date
                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30 dark:bg-rose-950/30'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
            </div>
            {errors.target_date && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">{errors.target_date}</p>
            )}
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Los proyectos con fecha vencida o próxima (&lt; 7 días) se clasificarán automáticamente en riesgo.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm hover:shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Guardar Proyecto' : 'Crear Proyecto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
