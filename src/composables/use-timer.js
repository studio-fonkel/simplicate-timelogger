import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';
import { POLLING_INTERVALS, registerCallback, unregisterCallback } from './use-polling.js';

export const timers = ref([]);
export const loadingEmployeeTimers = shallowRef(false);
export const initiallyLoadedEmployeeTimers = shallowRef(false);
// export const currentProject = shallowRef(null);

function clearTimers () {
  timers.value.length = 0;
}

function addTimers (projects) {
  timers.value.push(...projects);
}

export async function fetchTimers () {
  loadingEmployeeTimers.value = true;
  // TODO: Add q[employee.id]=employee:afa58dd4b2c525fe6d44e34a3f0f8c3d
  const { data: timers } = await axios.get('timers/timer');
  clearTimers();
  addTimers(timers.data);
  loadingEmployeeTimers.value = false;
}

function startPollingFetchTimers () {
  registerCallback(fetchTimers, POLLING_INTERVALS.medium);
}

function stopPollingFetchTimers () {
  unregisterCallback(fetchTimers);
}

// On init, fetch all timers and start polling.
fetchTimers();
startPollingFetchTimers();
