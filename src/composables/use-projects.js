import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';
import { currentEmployeeID } from './use-employees.js';
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

  let projects, latestLogs;

  await Promise.all([
    await axios.get('projects/project', {
      params: {
        // 'sort': '-modified',
        // 'q[employee.id]': currentEmployeeID.value,
      },
    }).then(({ data }) => {
      projects = data;
    }),

    await axios.get('hours/hours', {
      params: {
        'sort': '-start_date',
        'limit': 30,
        'q[employee.id]': currentEmployeeID.value,
      },
    }).then(({ data }) => {
      latestLogs = data;
    }),
  ]);

  const indexOfProjectInLatestLogs = (project) => {
    return latestLogs.data.findIndex(log => log.project.id === project.id);
  };

  // Copy for earlier debugging purposes.
  const projectsData = [...projects.data]
    .sort((a, b) => {
      const indexOfAInLatestLogs = indexOfProjectInLatestLogs(a);
      const indexOfBInLatestLogs = indexOfProjectInLatestLogs(b);

      if (indexOfAInLatestLogs > -1 && indexOfBInLatestLogs === -1) {
        return -1;
      }
      else if (indexOfAInLatestLogs === -1 && indexOfBInLatestLogs > -1) {
        return 1;
      }
      else if (indexOfAInLatestLogs === -1 && indexOfBInLatestLogs === -1) {
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
      else {
        if (indexOfAInLatestLogs > indexOfBInLatestLogs) {
          return 1;
        }
        else if (indexOfAInLatestLogs < indexOfBInLatestLogs) {
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
