import { ref, shallowRef, watch } from 'vue';
import { axios } from './use-axios.js';
import { today } from './use-date-helper.js';
import { registerCallback, unregisterCallback } from './use-polling.js';

export const hours = ref([]);
export const loadingEmployeeHours = shallowRef(false);
export const initiallyLoadedEmployeeHours = shallowRef(false);
export const currentProject = shallowRef(null);

watch(loadingEmployeeHours, (loading) => {
  if (initiallyLoadedEmployeeHours.value === false && loading === false) {
    initiallyLoadedEmployeeHours.value = true;
  }
});

function clearHours () {
  hours.value.length = 0;
}

function addHours (projects) {
  hours.value.push(...projects);
}

export async function fetchHours () {
  loadingEmployeeHours.value = true;
  const { data: hours } = await axios.get('hours/hours', {
    params: {
      'q[start_date][ge]': `${today.value} 00:00:00`,
      'q[start_date][le]': `${today.value} 23:59:59`,
    },
  });
  clearHours();
  addHours(hours.data);
  loadingEmployeeHours.value = false;
}

export function startPollingFetchHours () {
  registerCallback(fetchHours);
}

export function stopPollingFetchHours () {
  unregisterCallback(fetchHours);
}
