import { Temporal } from '@js-temporal/polyfill';
import { ref, shallowRef } from 'vue';
import { axios } from './use-axios.js';

import {
  currentDateTime,
  currentDate,
  // currentlySelectedDate,
  secondsToDuration,
  toPlainTime,
  getCurrentDateTime,
  isPlainTime,
  // compareTimes,
} from './use-date-helper.js';

import { currentEmployeeID } from './use-employees.js';
import { createHours, fetchHours, startPollingFetchHours, stopPollingFetchHours } from './use-hours.js';
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
  // Convert startTime to PlainTime if needed.
  if (isPlainTime(startTime) === false) {
    startTime = toPlainTime(startTime);
  }

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
    normalizeTimerMetadata(timer);
  }

  clearTimers();
  addTimers(timers.data);
  loadingEmployeeTimers.value = false;
}

function normalizeTimerMetadata (timer) {
  if ('metadata' in timer) {
    try {
      timer.metadata = JSON.parse(timer.metadata);
    }
    catch (err) {
      console.error(`Could not parse metadata, maybe it’s not JSON?`, { metadata: timer.metadata });
    }
  }
}

function hasStartDatetimeInMetadata (timer) {
  return (
    ('metadata' in timer) &&
    ('started_at' in timer.metadata)
  );
}

export async function getTimer (timerID) {
  const { data: { data: timer } } = await axios.get(`timers/timer/${timerID}`);

  normalizeTimerMetadata(timer);

  return timer;
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
    // NOTE: We don't support starting a timer on a date other than today right now.
    const now = getCurrentDateTime();
    const nowWithoutSeconds = now.round({ smallestUnit: 'minute', roundingMode: 'floor' });

    // Get PlainDateTime obj of startTime.
    const startDateTime = getTimerStartDateTime(startTime ?? now);
    const startDateTimeWithoutSeconds = startDateTime.round({ smallestUnit: 'minute', roundingMode: 'floor' });

    // Measure seconds between now (excluding passed seconds) and startDateTime (excluding passed seconds).
    const secondsSpent = startDateTimeWithoutSeconds.until(nowWithoutSeconds).total({
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
  stopPollingFetchHours();
  stopPollingFetchTimers();

  const timer = await getTimer(timerID);

  if (hasStartDatetimeInMetadata(timer) === true) {
    await axios.put(`timers/timer/${timerID}`, {
      state: 'paused',
    });

    const now = getCurrentDateTime();
    const nowWithoutSeconds = now.round({ smallestUnit: 'minute', roundingMode: 'floor' });

    const startTime = Temporal.PlainDateTime.from(timer.metadata.started_at).toPlainTime().toString().substring(0, 5);
    const endTime = nowWithoutSeconds.toPlainTime().toString().substring(0, 5);

    const res = await createHours({
      projectId: timer.project.id,
      projectServiceId: timer.projectservice.id,
      projectServiceHoursTypeId: timer.hourstype.id,
      startTime,
      endTime,
      description: timer.description,
    });

    if (res === RESULT_CODES.success) {
      await deleteTimer(timerID);
    }
    else {
      alert('Er gaat iets mis. Je kunt de error in de browser console terugvinden.');
    }
  }
  else {
    /**
     * When stopping a timer, a new hours entry is created for us automatically.
     * The timer is preserved though, so we need to clean it up immediately after.
     */
    await axios.put(`timers/timer/${timerID}`, {
      state: 'finished',
    });

    await deleteTimer(timerID);
  }

  await fetchHours();

  startPollingFetchHours();
  startPollingFetchTimers();
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
