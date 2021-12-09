import { ref, shallowRef, watch } from 'vue';
import { axios } from './use-axios.js';
import { today } from './use-date-helper.js';
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
  // TODO: Add q[employee.id]=employee:afa58dd4b2c525fe6d44e34a3f0f8c3d
  const { data: hours } = await axios.get('hours/hours', {
    params: {
      'q[start_date][ge]': `${currentlySelectedDate.value.toString()} 00:00:00`,
      'q[start_date][le]': `${currentlySelectedDate.value.toString()} 23:59:59`,
    },
  });
  clearHours();
  addHours(hours.data);
  loadingEmployeeHours.value = false;
}

function startPollingFetchHours () {
  registerCallback(fetchHours, INTERVALS.long);
}

function stopPollingFetchHours () {
  unregisterCallback(fetchHours);
}

// On init, fetch all hours and start polling.
fetchHours();
startPollingFetchHours();
