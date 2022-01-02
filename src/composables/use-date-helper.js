import { ref, computed } from 'vue';
import { Temporal, Intl as TemporalIntl, toTemporalInstant } from '@js-temporal/polyfill';
import { POLLING_INTERVALS, registerCallback } from './use-polling.js';
import { capitalizeFirstLetter } from './use-string-helper.js';

Date.prototype.toTemporalInstant = toTemporalInstant;
// Object.assign(Intl, TemporalIntl);

export const currentDateTime = ref(getCurrentDateTime());
registerCallback(updateCurrentDateTime, POLLING_INTERVALS.short);

export const currentDate = computed(() => currentDateTime.value.toPlainDate());
export const currentlySelectedDate = ref(currentDateTime.value.toPlainDate());

function updateCurrentDateTime () {
  currentDateTime.value = getCurrentDateTime();
}

// export function getCurrentDate () {
//   return Temporal.Now.plainDateISO();
// }

export function getCurrentDateTime () {
  return Temporal.Now.plainDateTimeISO();
}

export function getCurrentTime () {
  return Temporal.Now.plainTimeISO();
}

export function getCurrentTimeString () {
  const now = getCurrentTime();

  let { hour, minute } = now;

  if (hour < 10) {
    hour = `0${hour}`;
  }

  if (minute < 10) {
    minute = `0${minute}`;
  }

  return `${hour}:${minute}`;
}

export function compareDates (dateA, dateB) {
  return Temporal.PlainDate.compare(dateA, dateB);
}

export function compareDateTimes (dateTimeA, dateTimeB) {
  return Temporal.PlainDateTime.compare(dateTimeA, dateTimeB);
}

export function compareTimes (timeA, timeB) {
  return Temporal.PlainTime.compare(timeA, timeB);
}

export function toPlainDate (dateStr) {
  return Temporal.PlainDate.from(dateStr);
}

export function toPlainDateTime (dateTimeStr) {
  return Temporal.PlainDateTime.from(dateTimeStr);
}

export function toPlainTime (timeStr) {
  return Temporal.PlainTime.from(timeStr);
}

export function secondsToDuration (seconds) {
  return Temporal.Duration.from({
    seconds,
  });
}

export function dateIsToday (date) {
  const today = new Date();
  return date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear();
}

const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
  hour: 'numeric',
  minute: 'numeric',
});

const relativeDateFormatter = new Intl.RelativeTimeFormat('nl-NL', {
  numeric: 'auto',
});

const fullDateFormatter = new Intl.DateTimeFormat('nl-NL', {
  dateStyle: 'full',
});

export const toTimeString = (value) => {
  const dateTime = new Date(value);
  const dateTimeTemporal = toPlainDateTime(value);

  let timeString = timeFormatter.format(dateTime);

  if (dateIsToday(dateTime) === false) {
    const relativeDays = Math.ceil(getCurrentDateTime().until(dateTimeTemporal).total({ unit: 'days' }));
    timeString += ` (${relativeDateFormatter.format(relativeDays, 'day')})`;
  }

  return timeString;
};

export const toFullDate = (value) => {
  const dateTime = new Date(value);
  const fullDate = fullDateFormatter.format(dateTime);
  return capitalizeFirstLetter(fullDate);
};

export const toDurationString = (hours) => {
  const fullHours = Math.trunc(hours);
  const minutes = Math.floor((hours - fullHours) * 60);
  return `${fullHours}:${minutes < 10 ? '0' : ''}${minutes}`;
};

/**
 * Fix time to be in the format (h)h:mm.
 *
 * NOTE: This does not (yet) maximize hours to 23 or minutes to 59.
 *
 * Scenarios:
 * - 0: time is not set or wrong type
 * - 1: time is in format 'hh:mm'
 * - 2: time is in format 'h:mm'
 * - 3: time is in format 'hh:m'
 * - 4: time is in format 'h:m'
 * - 5: time is in format 'hhmm'
 * - 6: time is in format 'hmm'
 * - 7: time is in format 'hh'
 * - 8: time is in format 'h'
 * - 9: time has too many digits, e.g. user made typo hh:mmm
 * - 10: time is gibberish
 */
export const fixTime = (time) => {
  // Scenario 0
  if (typeof(time) !== 'string') {
    return null;
  }

  time = time.trim();

  // Also scenario 0
  if (time === '') {
    return null;
  }

  // Early return for perfectly formatted times
  if (time.match(/^(\d)?\d:\d\d$/)) {
    return time;
  }

  // Scenario 3 & 4
  if (time.match(/^(\d)?\d:\d$/)) {
    return `${time}0`;
  }

  // Scenario 1 & 2 become 5 & 6
  time = time.replace(':', '');

  // Scenario 10
  if (!time.match(/^\d+$/)) {
    return null;
  }

  // Scenario 5
  if (time.length === 4) {
    return `${time.slice(0, 2)}:${time.slice(2)}`;
  }
  // Scenario 6
  else if (time.length === 3) {
    return `${time.slice(0, 1)}:${time.slice(1)}`;
  }
  // Scenario 7 & 8
  else if (time.length === 2 || time.length === 1) {
    return `${time}:00`;
  }
  // Scenario 9
  else {
    return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
  }
};
