import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';

export const availableProjects = ref([]);
export const loadingAvailableProjects = shallowRef(true);
export const currentProject = shallowRef(null);

function clearProjects () {
  availableProjects.value.length = 0;
}

function addProjects (projects) {
  availableProjects.value.push(...projects);
}

export async function fetchAllProjects () {
  const { data: projects } = await axios.get('projects/project');
  clearProjects();
  addProjects(projects.data);
  loadingAvailableProjects.value = false;
}
