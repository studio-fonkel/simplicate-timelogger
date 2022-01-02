import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';

import {
  currentDateTime,
  currentDate,
  // currentlySelectedDate,
  secondsToDuration,
  toPlainTime,
  // compareTimes,
} from './use-date-helper.js';

import { currentEmployeeID } from './use-employees.js';
import { RESULT_CODES } from './use-misc.js';
import { POLLING_INTERVALS, registerCallback, unregisterCallback } from './use-polling.js';

export const timers = ref([]);
export const loadingEmployeeTimers = shallowRef(false);
export const initiallyLoadedEmployeeTimers = shallowRef(false);
export const creatingTimer = shallowRef(false);

function clearTimers () {
  timers.value.length = 0;
}

function addTimers (projects) {
  timers.value.push(...projects);
}

export function getTimerStartDateTime (startTime) {
  // Convert startTime to PlainTime.
  startTime = toPlainTime(startTime);

  // Create PlainDateTime from currentDate and startTime combined.
  const startDateTime = currentDate.value.toPlainDateTime(startTime);

  return startDateTime;
}

export function calculateStartDateTimeFromSecondsSpent (secondsSpent) {
  const startDateTime = currentDateTime.value.subtract(secondsToDuration(secondsSpent));

  return startDateTime;
}

export async function fetchTimers () {
  loadingEmployeeTimers.value = true;

  const { data: timers } = await axios.get('timers/timer', {
    params: {
      // We cannot rely on the created date. It's the server date, not the local date.
      // Also, if we filter on timers created today and someone forgot to turn off their timer,
      // this timer wouldn't get displayed, so they may never find out about the running timer...
      // 'q[created_at][ge]': `${currentlySelectedDate.value.toString()} 00:00:00`,
      // 'q[created_at][le]': `${currentlySelectedDate.value.toString()} 23:59:59`,
      'q[employee.id]': currentEmployeeID.value,
    },
  });

  for (const timer of timers.data) {
    if ('metadata' in timer) {
      try {
        timer.metadata = JSON.parse(timer.metadata);
      }
      catch (err) {
        console.error(`Could not parse metadata, maybe it’s not JSON?`, { metadata: timer.metadata });
      }
    }
  }

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
    // Get PlainDateTime obj of now.
    // REVIEW: I think we don't support starting a timer on a date other than today right now.
    const now = getCurrentDateTime();

    // Get PlainDateTime obj of startTime.
    const startDateTime = getTimerStartDateTime(startTime);

    // Measure seconds between now and startDateTime.
    const secondsSpent = startDateTime.until(now).total({
      unit: 'second',
    });

    if (secondsSpent < 0) {
      // NOTE: This should never happen, because Start timer button will be disabled if startTime is in the future.
      throw new Error('Start time cannot be in the future.');
    }

    await axios.post('timers/timer', {
      employee_id: currentEmployeeID.value,
      project_id: projectId,
      projectservice_id: projectServiceId,
      hourstype_id: projectServiceHoursTypeId,
      state: 'running',
      seconds_spent: secondsSpent,
      metadata: JSON.stringify({
        started_at: startDateTime.toString(),
      }),
      ...(description != null ? { description } : {}),
    });

    fetchTimers();
    return RESULT_CODES.success;
  }
  catch (err) {
    console.error(err);
    return RESULT_CODES.failure;
  }
}

export async function stopTimer (timerID) {
  /**
   * TODO:
   * 1. Get latest timer data
   * 2. Determine start time by subtracting seconds_spent from current time
   * 3. Execute createHours(), but with care!
   * 4. Delete timer
   * 5. fetchTimers() and fetchHours().
   */
  const timerData = await axios.get(`timers/timer/${timerID}`);
  console.log({ timerData });
  // await axios.delete(`timers/timer/${timerID}`);
  // fetchTimers();
}

export async function deleteTimer (timerID) {
  await axios.delete(`timers/timer/${timerID}`);
  fetchTimers();
}

export function startPollingFetchTimers () {
  registerCallback(fetchTimers, POLLING_INTERVALS.medium);
}

export function stopPollingFetchTimers () {
  unregisterCallback(fetchTimers);
}
