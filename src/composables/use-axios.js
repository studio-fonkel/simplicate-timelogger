import axiosPlugin from 'axios';
import { localStoragePrefix } from '../config.js';

let tenantURL = import.meta.env.VITE_SIMPLICATE_TENANT_BASE_URL ?? localStorage.getItem(`${localStoragePrefix}tenantURL`);
if (!tenantURL) {
  throw new Error('VITE_SIMPLICATE_TENANT_BASE_URL is not defined in .env.local and no alternatives found in localStorage');
}
if (!tenantURL.endsWith('/')) {
  tenantURL += '/';
}

const baseURL = `${tenantURL}api/v2/`;

const apiKey = import.meta.env.VITE_SIMPLICATE_API_KEY ?? localStorage.getItem(`${localStoragePrefix}apiKey`);
const apiSecret = import.meta.env.VITE_SIMPLICATE_API_SECRET ?? localStorage.getItem(`${localStoragePrefix}apiSecret`);

if (!apiKey || !apiSecret) {
  throw new Error('VITE_SIMPLICATE_API_KEY and/or VITE_SIMPLICATE_API_SECRET is not defined in .env.local and no alternatives found in localStorage');
}

export const axios = axiosPlugin.create({
  baseURL,
  timeout: 8000,
  // FIXME: Figure out how the Simplicate browser plugin authenticates someone, because they do send authentication key and secret headers as well, but I don't know where they come from.
  headers: {
    'Authentication-Key': import.meta.env.VITE_SIMPLICATE_API_KEY,
    'Authentication-Secret': import.meta.env.VITE_SIMPLICATE_API_SECRET,
  },
});

// TODO: When 429 Too Many Requests occurs, save when the rate limiting will be reset, and create interceptor that blocks requests until that time.
