import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';
// import { currentEmployeeID } from './use-employees.js';
import { POLLING_INTERVALS, registerCallback, unregisterCallback } from './use-polling.js';

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

  const { data: projects } = await axios.get('projects/project', {
    // params: {
    //   'q[employee.id]': currentEmployeeID.value,
    // },
  });

  clearProjects();
  addProjects(projects.data);
  loadingAvailableProjects.value = false;
}

export function startPollingFetchProjects () {
  registerCallback(fetchProjects, POLLING_INTERVALS.quarterhour);
}

export function stopPollingFetchProjects () {
  unregisterCallback(fetchProjects);
}
