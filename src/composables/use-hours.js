import { ref, shallowRef, watch } from 'vue';
import { axios } from './use-axios.js';
import { today } from './use-date-helper.js';
import { currentEmployeeID } from './use-employees.js';
import { INTERVALS, registerCallback, unregisterCallback } from './use-polling.js';

export const hours = ref([]);
export const loadingEmployeeHours = shallowRef(false);
export const initiallyLoadedEmployeeHours = shallowRef(false);
export const currentProject = shallowRef(null);
export const currentlySelectedDate = ref(today.value);

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
      'q[start_date][ge]': `${currentlySelectedDate.value.toString()} 00:00:00`,
      'q[start_date][le]': `${currentlySelectedDate.value.toString()} 23:59:59`,
      'q[employee.id]': currentEmployeeID.value,
    },
  });
  clearHours();
  addHours(hours.data);
  loadingEmployeeHours.value = false;
}

export function startPollingFetchHours () {
  registerCallback(fetchHours, INTERVALS.long);
}

export function stopPollingFetchHours () {
  unregisterCallback(fetchHours);
}
