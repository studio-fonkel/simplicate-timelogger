import { ref, shallowRef, watch } from 'vue';
import { axios } from './use-axios.js';
import { compareTimes, today, toPlainTime } from './use-date-helper.js';
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

export const STATUS_CODES = {
  success: Symbol('success'),
  failure: Symbol('failure'),
};

export async function createHours ({
  projectId,
  projectServiceId,
  projectServiceHoursTypeId,
  startTime,
  endTime,
  description,
}) {
  try {
    if (startTime.length === 4) {
      startTime = `0${startTime}`;
    }
    if (endTime.length === 4) {
      endTime = `0${endTime}`;
    }

    startTime += ':00';
    endTime += ':00';

    const startTimeObj = toPlainTime(startTime);
    const endTimeObj = toPlainTime(endTime);

    if (compareTimes(endTimeObj, startTimeObj) !== 1) {
      throw new Error('End time cannot be before or equal to start time.');
    }

    const duration = startTimeObj.until(endTimeObj, {
      // largestUnit: 'minute',
      // smallestUnit: 'minute',
      // roundingIncrement: 3,
      // roundingMode: 'halfExpand',
    });

    const hours = duration.total({
      unit: 'hour',
    });

    await axios.post('hours/hours', {
      employee_id: currentEmployeeID.value,
      project_id: projectId,
      projectservice_id: projectServiceId,
      type_id: projectServiceHoursTypeId,
      start_date: `${currentlySelectedDate.value.toString()} ${startTime}`,
      // NOTE: end_date does not actually work in the Simplicate API, haha...
      // end_date: `${currentlySelectedDate.value.toString()} ${endTime}`,
      hours,
      is_time_defined: true,
      is_recurring: false,
      ...(description != null ? { note: description } : {}),
    });

    fetchHours();
    return STATUS_CODES.success;
  }
  catch (err) {
    console.error(err);
    return STATUS_CODES.failure;
  }
}

export async function deleteHours (hoursID) {
  await axios.delete(`hours/hours/${hoursID}`);
  fetchHours();
}

export function startPollingFetchHours () {
  registerCallback(fetchHours, INTERVALS.long);
}

export function stopPollingFetchHours () {
  unregisterCallback(fetchHours);
}
