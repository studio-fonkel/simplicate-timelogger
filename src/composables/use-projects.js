import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';

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

async function fetchAllProjects () {
  loadingAvailableProjects.value = true;
  const { data: projects } = await axios.get('projects/project');
  clearProjects();
  addProjects(projects.data);
  loadingAvailableProjects.value = false;
}

// On init, fetch all projects.
fetchAllProjects();
