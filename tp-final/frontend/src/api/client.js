/**
 * REST API client module for Project Tracking Dashboard.
 * Interacts with FastAPI backend endpoints.
 */

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || '/api';

/**
 * Helper to execute HTTP requests with standard headers and error handling.
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status} (${response.statusText})`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((err) => err.msg || JSON.stringify(err)).join(', ');
        } else {
          errorMessage = JSON.stringify(errorData.detail);
        }
      }
    } catch {
      // response body was not valid JSON
    }
    throw new Error(errorMessage);
  }

  // 204 No Content has no JSON response body
  if (response.status === 204) {
    return true;
  }

  return response.json();
}

/**
 * Retrieve all projects with optional filtering.
 * @param {Object} params - { stage, health, search }
 */
export async function getProjects(params = {}) {
  const query = new URLSearchParams();
  if (params.stage) query.append('stage', params.stage);
  if (params.health) query.append('health', params.health);
  if (params.search) query.append('search', params.search);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/projects${queryString}`, { method: 'GET' });
}

/**
 * Retrieve a single project by ID.
 * @param {number|string} id
 */
export async function getProjectById(id) {
  return request(`/projects/${id}`, { method: 'GET' });
}

/**
 * Create a new project with 5 default lifecycle milestones.
 * @param {Object} data - { name, description, target_date }
 */
export async function createProject(data) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update fields of an existing project.
 * @param {number|string} id
 * @param {Object} data - { name?, description?, target_date? }
 */
export async function updateProject(id, data) {
  return request(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a project and its associated milestones.
 * @param {number|string} id
 */
export async function deleteProject(id) {
  return request(`/projects/${id}`, { method: 'DELETE' });
}

/**
 * Add a custom milestone to a project.
 * @param {number|string} projectId
 * @param {Object} data - { title, stage, status?, due_date? }
 */
export async function addMilestone(projectId, data) {
  return request(`/projects/${projectId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update milestone status or details.
 * @param {number|string} projectId
 * @param {number|string} milestoneId
 * @param {Object} data - { title?, stage?, status?, due_date? }
 */
export async function updateMilestone(projectId, milestoneId, data) {
  return request(`/projects/${projectId}/milestones/${milestoneId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a milestone from a project.
 * @param {number|string} projectId
 * @param {number|string} milestoneId
 */
export async function deleteMilestone(projectId, milestoneId) {
  return request(`/projects/${projectId}/milestones/${milestoneId}`, {
    method: 'DELETE',
  });
}

/**
 * Retrieve aggregated dashboard metrics.
 */
export async function getMetrics() {
  return request('/metrics', { method: 'GET' });
}

export const apiClient = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  getMetrics,
};

export default apiClient;

