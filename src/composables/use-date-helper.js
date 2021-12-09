import { ref } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { registerCallback } from './use-polling.js';
import { capitalizeFirstLetter } from './use-string-helper.js';

export const today = ref(null);

function updateToday () {
  today.value = Temporal.Now.plainDateISO();
}

updateToday();
registerCallback(updateToday);

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
