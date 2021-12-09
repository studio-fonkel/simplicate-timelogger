import { ref } from 'vue';

const debugPolling = false;
const log = (...logs) => (debugPolling === true && console.log(...logs));

const callbacks = ref(new Map);

export const INTERVALS = {
  short: 1,
  medium: 10,
  long: 20,
  minute: 60,
  quarterhour: 60 * 15,
  // halfhour: 60 * 30,
  // hour: 60 * 60,
};

export function registerCallback (callback, interval = INTERVALS.short) {
  callbacks.value.set(callback, interval);
}

export function unregisterCallback (callback) {
  callbacks.value.remove(callback);
}

// Look for lowest number that can be divided by all intervals defined in the INTERVALS enum.
let lowestIndexDivisibleByAllIntervals = Math.max(...Object.values(INTERVALS));
while (Object.values(INTERVALS).every(interval => lowestIndexDivisibleByAllIntervals % interval === 0) === false) {
  lowestIndexDivisibleByAllIntervals++;
}

let iteration = 1;

/**
 * Fires callbacks every x seconds, depending on the interval provided for each callback.
 * We assume the registering module already fires the callback once before polling if they want to.
 */
setInterval(() => {
  const plannedCallbacks = [];

  for (const [callback, interval] of callbacks.value) {
    if (iteration % interval === 0) {
      plannedCallbacks.push({
        callback,
        callbackName: callback.name,
        interval,
      });
    }
  }

  // Prefix i with zeroes if it's less than lowestIndexDivisibleByAllIntervals.
  const iterationStr = iteration.toString().padStart(lowestIndexDivisibleByAllIntervals.toString().length, '0');
  log(`Iteration #${iterationStr}: ${plannedCallbacks.map(({
    callbackName,
    interval,
  }) => `${callbackName} (every ${interval}s)`).join(' + ')}`);

  for (const callbackEntry of plannedCallbacks) {
    callbackEntry.callback();
  }

  // Increment i.
  iteration++;

  // Reset i when it reaches the lowest number that can be divided by all intervals defined in the INTERVALS enum.
  if (iteration === (lowestIndexDivisibleByAllIntervals + 1)) {
    iteration = 1;
  }
}, 1000);
