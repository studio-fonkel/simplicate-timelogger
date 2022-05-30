import axiosPlugin from 'axios';
import { computed, ref } from 'vue';
import { localStoragePrefix } from '../config.js';

let tenantURL = import.meta.env.VITE_SIMPLICATE_TENANT_BASE_URL ?? localStorage.getItem(`${localStoragePrefix}tenantURL`);
if (!tenantURL) {
  throw new Error('VITE_SIMPLICATE_TENANT_BASE_URL is not defined in .env.local and no alternatives found in localStorage');
}
if (!tenantURL.endsWith('/')) {
  tenantURL += '/';
}

const baseURL = `${tenantURL}api/v2/`;

export const apiKey = ref(import.meta.env.VITE_SIMPLICATE_API_KEY ?? localStorage.getItem(`${localStoragePrefix}apiKey`) ?? '');
export const apiSecret = ref(import.meta.env.VITE_SIMPLICATE_API_SECRET ?? localStorage.getItem(`${localStoragePrefix}apiSecret`) ?? '');
export const credentialsComplete = computed(() => apiKey.value && apiSecret.value);

export const saveApiKey = (newApiKey) => {
  localStorage.setItem(`${localStoragePrefix}apiKey`, newApiKey);
  apiKey.value = newApiKey;
};
export const saveApiSecret = (newApiSecret) => {
  localStorage.setItem(`${localStoragePrefix}apiSecret`, newApiSecret);
  apiSecret.value = newApiSecret;
};

// credentialsComplete.value === true ? () => {}
export const axios = axiosPlugin.create({
  baseURL,
  timeout: 8000,
  headers: {
    'Authentication-Key': apiKey.value,
    'Authentication-Secret': apiSecret.value,
  },
});

// TODO: When 429 Too Many Requests occurs, save when the rate limiting will be reset, and create interceptor that blocks requests until that time.
