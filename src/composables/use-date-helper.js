import { ref } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { registerCallback } from './use-polling.js';
import { capitalizeFirstLetter } from './use-string-helper.js';

export const today = ref(null);

function updateToday () {
  // REVIEW: Shouldn't we use Temporal.Now.zonedDateTimeISO() somehow?
  today.value = Temporal.Now.plainDateISO();
}

updateToday();
registerCallback(updateToday);

export function getCurrentTime () {
  const now = Temporal.Now.plainTimeISO();
  return `${now.hour}:${now.minute}`;
}

export function compareDates (dateA, dateB) {
  return Temporal.PlainDate.compare(dateA, dateB);
}

export function compareTimes (timeA, timeB) {
  return Temporal.PlainTime.compare(timeA, timeB);
}

export function toPlainTime (timeStr) {
  return Temporal.PlainTime.from(timeStr);
}

const timeFormatter = new Intl.DateTimeFormat('nl-NL', {
  hour: 'numeric',
  minute: 'numeric',
});

const fullDateFormatter = new Intl.DateTimeFormat('nl-NL', {
  dateStyle: 'full',
});

export const toTimeString = (value) => {
  const dateTime = new Date(value);
  return timeFormatter.format(dateTime);
};

export const toFullDate = (value) => {
  const dateTime = new Date(value);
  const fullDate = fullDateFormatter.format(dateTime);
  return capitalizeFirstLetter(fullDate);
};

export const toDurationString = (value) => {
  const h = Math.trunc(value);
  const mm = Math.floor((value - h) * 60);
  return `${h}:${mm < 10 ? '0' : ''}${mm}`;
};

/**
 * Fix time to be in the format (h)h:mm.
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
