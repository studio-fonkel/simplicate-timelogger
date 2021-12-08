import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';
import { registerCallback, unregisterCallback } from './use-polling.js';

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
  // api/v2/timers/timer?q%5Bemployee.id%5D=employee:afa58dd4b2c525fe6d44e34a3f0f8c3d&sort=state,-updated_at
  const { data: timers } = await axios.get('timers/timer');
  clearTimers();
  addTimers(timers.data);
  loadingEmployeeTimers.value = false;
}

export function startPollingFetchTimers () {
  registerCallback(fetchTimers);
}

export function stopPollingFetchTimers () {
  unregisterCallback(fetchTimers);
}
