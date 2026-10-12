import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderKanban,
  Plus,
  AlertCircle,
  CheckCircle2,
  X,
  SearchX,
  RotateCcw,
} from 'lucide-react';
import apiClient from './api/client';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import StageChart from './components/StageChart';
import FilterBar from './components/FilterBar';
import ProjectCard from './components/ProjectCard';
import ProjectModal from './components/ProjectModal';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHealth, setSelectedHealth] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');

  // Modal & Edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Theme state (dark mode by default, persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Toast notifications
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
  }, []);

  // Fetch portfolio metrics from backend
  const fetchMetrics = useCallback(async () => {
    try {
      const metricsData = await apiClient.getMetrics();
      setMetrics(metricsData || null);
    } catch (err) {
      showToast(
        'error',
        err.message || 'Error al obtener métricas del servidor.'
      );
    }
  }, [showToast]);

  // Fetch projects from backend according to active filters
  const fetchProjects = useCallback(async () => {
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedHealth && selectedHealth !== 'ALL') params.health = selectedHealth;
      if (selectedStage && selectedStage !== 'ALL') params.stage = selectedStage;

      const projectsData = await apiClient.getProjects(params);
      setProjects(projectsData || []);
    } catch (err) {
      showToast(
        'error',
        err.message || 'Error al conectar con la API del servidor. Verifique que el backend esté ejecutándose.'
      );
    } finally {
      setInitialLoading(false);
    }
  }, [searchTerm, selectedHealth, selectedStage, showToast]);

  // Initial load for metrics
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Load and refresh projects when filters change (with slight debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 200);

    return () => clearTimeout(timer);
  }, [fetchProjects]);

  // Toast auto-dismiss after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Create or Update project handler
  async function handleCreateOrUpdate(projectData) {
    if (editingProject) {
      await apiClient.updateProject(editingProject.id, projectData);
      showToast('success', 'Proyecto actualizado exitosamente.');
    } else {
      await apiClient.createProject(projectData);
      showToast('success', 'Proyecto creado exitosamente con sus 5 hitos base.');
    }
    setIsModalOpen(false);
    setEditingProject(null);
    await Promise.all([fetchProjects(), fetchMetrics()]);
  }

  // Delete project handler
  async function handleDelete(projectId) {
    const confirmDelete = window.confirm(
      '¿Está seguro de que desea eliminar este proyecto? Todos sus hitos asociados se borrarán permanentemente.'
    );
    if (!confirmDelete) return;

    try {
      await apiClient.deleteProject(projectId);
      showToast('success', 'Proyecto eliminado correctamente.');
      await Promise.all([fetchProjects(), fetchMetrics()]);
    } catch (err) {
      showToast('error', err.message || 'Error al eliminar el proyecto.');
    }
  }

  // Milestone status toggle handler
  async function handleToggleMilestone(projectId, milestoneId, currentStatus) {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await apiClient.updateMilestone(projectId, milestoneId, { status: nextStatus });
      // Immediately refresh both projects and metrics so dynamic health and metrics update
      await Promise.all([fetchProjects(), fetchMetrics()]);
    } catch (err) {
      showToast('error', err.message || 'Error al actualizar el estado del hito.');
    }
  }

  const isFiltered = Boolean(searchTerm.trim() || selectedHealth !== 'ALL' || selectedStage !== 'ALL');

  function handleResetFilters() {
    setSearchTerm('');
    setSelectedHealth('ALL');
    setSelectedStage('ALL');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col font-sans text-gray-900 dark:text-gray-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        onNewProjectClick={() => {
          setEditingProject(null);
          setIsModalOpen(true);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-in slide-in-from-top-2 duration-200">
          <div
            className={`p-4 rounded-xl border shadow-lg flex items-start justify-between gap-3 ${
              toast.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
                : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded focus:outline-none"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <MetricCards metrics={metrics} />

        {/* Lifecycle Stage Distribution Chart */}
        <StageChart
          stageDistribution={metrics?.stage_distribution}
          isDark={theme === 'dark'}
        />

        {/* Real-time Search and Health/Stage Filters */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedHealth={selectedHealth}
          onHealthSelect={setSelectedHealth}
          selectedStage={selectedStage}
          onStageSelect={setSelectedStage}
        />

        {/* Projects Section */}
        <section aria-label="Listado de proyectos" className="space-y-4 min-h-[350px]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Proyectos {projects.length > 0 && `(${projects.length})`}
            </h2>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer filtros</span>
              </button>
            )}
          </div>

          {/* Loading Skeletons */}
          {initialLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm space-y-4 animate-pulse"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-md" />
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-full bg-gray-100 dark:bg-gray-700/60 rounded" />
                  </div>
                  <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-700/60 rounded" />
                  <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
                {isFiltered ? (
                  <SearchX className="w-7 h-7" />
                ) : (
                  <FolderKanban className="w-7 h-7" />
                )}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {isFiltered
                  ? 'No se encontraron proyectos con los filtros actuales'
                  : 'Aún no hay proyectos registrados'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                {isFiltered
                  ? 'Intente modificar los términos de búsqueda o cambiar los filtros de fase y salud.'
                  : 'Comience creando su primer proyecto para hacer seguimiento a sus hitos y estado de salud.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                {isFiltered ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Limpiar filtros</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setEditingProject(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Nuevo Proyecto</span>
                </button>
              </div>
            </div>
          ) : (
            /* Projects Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEditProject={(p) => {
                    setEditingProject(p);
                    setIsModalOpen(true);
                  }}
                  onDeleteProject={handleDelete}
                  onToggleMilestone={handleToggleMilestone}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 dark:text-gray-400">
          Project Tracking Dashboard &copy; {new Date().getFullYear()} &mdash; Seguimiento Ejecutivo y Control Dinámico de Riesgo.
        </div>
      </footer>

      {/* Project Create / Edit Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleCreateOrUpdate}
        project={editingProject}
      />
    </div>
  );
}
