import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';
// import { compareTimes, today, toPlainTime } from './use-date-helper.js';
import { currentEmployeeID } from './use-employees.js';
import { RESULT_CODES } from './use-misc.js';
import { POLLING_INTERVALS, registerCallback, unregisterCallback } from './use-polling.js';

export const timers = ref([]);
export const loadingEmployeeTimers = shallowRef(false);
export const initiallyLoadedEmployeeTimers = shallowRef(false);
export const creatingTimer = shallowRef(false);
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

export async function createTimer ({
  projectId,
  projectServiceId,
  projectServiceHoursTypeId,
  startTime,
  description,
}) {
  try {
    if (startTime.length === 4) {
      startTime = `0${startTime}`;
    }

    startTime += ':00'; // NOTE: Currently unused

    // TODO: Check if timer's start time is in the future

    await axios.post('timers/timer', {
      employee_id: currentEmployeeID.value,
      project_id: projectId,
      projectservice_id: projectServiceId,
      hourstype_id: projectServiceHoursTypeId,
      state: 'running',
      seconds_spent: 0, // TODO: See if this works if we set it to e.g. 3600
      ...(description != null ? { note: description } : {}),
    });

    fetchTimers();
    return RESULT_CODES.success;
  }
  catch (err) {
    console.error(err);
    return RESULT_CODES.failure;
  }
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
