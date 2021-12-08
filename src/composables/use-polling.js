import { ref } from 'vue';

const callbacks = ref(new Set);

export function registerCallback (callback) {
  callbacks.value.add(callback);
}

export function unregisterCallback (callback) {
  callbacks.value.remove(callback);
}

setInterval(() => {
  fireCallbacks();
}, 5000);

function fireCallbacks () {
  for (const callback of callbacks.value) {
    callback();
  }
}
