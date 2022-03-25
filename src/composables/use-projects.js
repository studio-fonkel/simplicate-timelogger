import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';
import { latestHours, fetchLatestHours } from './use-hours.js';
import { POLLING_INTERVALS, registerCallback, unregisterCallback } from './use-polling.js';

export const availableProjects = ref([]);
export const loadingAvailableProjects = shallowRef(false);
export const currentProject = shallowRef(null);
export const latestLogs = ref([]);

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

  let projects;

  await Promise.all([
    axios.get('projects/project').then(({ data }) => {
      projects = data;
    }),

    fetchLatestHours(),
  ]);

  const indexOfProjectInLatestHours = (project) => {
    return latestHours.value.findIndex(log => log.project.id === project.id);
  };

  // Copy for earlier debugging purposes.
  const projectsData = [...projects.data]
    .sort((a, b) => {
      const indexOfAInLatestHours = indexOfProjectInLatestHours(a);
      const indexOfBInLatestHours = indexOfProjectInLatestHours(b);

      // If A found in latest projects, but B not, A comes before B.
      if (indexOfAInLatestHours > -1 && indexOfBInLatestHours === -1) {
        return -1;
      }
      // If B found in latest projects, but A not, B comes before A.
      else if (indexOfAInLatestHours === -1 && indexOfBInLatestHours > -1) {
        return 1;
      }
      // If neither A nor B found in latest projects, sort by modified date.
      else if (indexOfAInLatestHours === -1 && indexOfBInLatestHours === -1) {
        const modifiedA = a.modified,
              modifiedB = b.modified;

        if (modifiedA > modifiedB) {
          return -1;
        }
        else if (modifiedA < modifiedB) {
          return 1;
        }
        return 0;
      }
      // If both A and B found in latest projects, sort by index in latest projects.
      else {
        if (indexOfAInLatestHours > indexOfBInLatestHours) {
          return 1;
        }
        else if (indexOfAInLatestHours < indexOfBInLatestHours) {
          return -1;
        }
        return 0;
      }
    });

  clearProjects();
  addProjects(projectsData);
  loadingAvailableProjects.value = false;
}

export function startPollingFetchProjects () {
  registerCallback(fetchProjects, POLLING_INTERVALS.quarterhour);
}

export function stopPollingFetchProjects () {
  unregisterCallback(fetchProjects);
}
