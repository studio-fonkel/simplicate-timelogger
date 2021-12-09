import { ref } from 'vue';
import { Temporal } from '@js-temporal/polyfill';
import { registerCallback } from './use-polling.js';

export const today = ref(null);

function updateToday () {
  today.value = Temporal.Now.plainDateISO().toString();
}

updateToday();
registerCallback(updateToday);
