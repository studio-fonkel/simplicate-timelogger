import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';
import { INTERVALS, registerCallback, unregisterCallback } from './use-polling.js';

export const availableProjects = ref([]);
export const loadingAvailableProjects = shallowRef(false);
export const currentProject = shallowRef(null);

export function setCurrentProject (value) {
  currentProject.value = value;
}

function clearProjects () {
  availableProjects.value.length = 0;
}

function addProjects (projects) {
  availableProjects.value.push(...projects);
}

export async function fetchProjects () {
  loadingAvailableProjects.value = true;
  // TODO: Add q[employee.id]=employee:afa58dd4b2c525fe6d44e34a3f0f8c3d
  const { data: projects } = await axios.get('projects/project');
  clearProjects();
  addProjects(projects.data);
  loadingAvailableProjects.value = false;
}

function startPollingFetchProjects () {
  registerCallback(fetchProjects, INTERVALS.quarterhour);
}

function stopPollingFetchProjects () {
  unregisterCallback(fetchProjects);
}

// On init, fetch all projects and start polling.
fetchProjects();
startPollingFetchProjects();
