import { ref, shallowRef, watch } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { axios } from './use-axios.js';

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
  const today = Temporal.Now.plainDateISO().toString();
  const { data: hours } = await axios.get('hours/hours', {
    params: {
      'q[start_date][ge]': `${today} 00:00:00`,
      'q[start_date][le]': `${today} 23:59:59`,
    },
  });
  clearHours();
  addHours(hours.data);
  loadingEmployeeHours.value = false;
}

let interval = null;
export function startPolling () {
  interval = setInterval(() => {
    fetchHours();
  }, 5000);
}

export function stopPolling () {
  if (interval !== null) {
    clearInterval(interval);
  }
}
