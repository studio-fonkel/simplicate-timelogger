import axiosPlugin from 'axios';

let tenantURL = import.meta.env.VITE_SIMPLICATE_TENANT_BASE_URL;
if (!tenantURL) {
  throw new Error('VITE_SIMPLICATE_TENANT_BASE_URL is not defined in .env.local');
}
if (!tenantURL.endsWith('/')) {
  tenantURL += '/';
}

const baseURL = `${tenantURL}/api/v2/`;

if (import.meta.env.VITE_SIMPLICATE_API_KEY === undefined || import.meta.env.VITE_SIMPLICATE_API_SECRET === undefined) {
  throw new Error('VITE_SIMPLICATE_API_KEY and/or VITE_SIMPLICATE_API_SECRET is not defined in .env.local');
}

export const axios = axiosPlugin.create({
  baseURL,
  timeout: 3000,
  headers: {
    'Authentication-Key': import.meta.env.VITE_SIMPLICATE_API_KEY,
    'Authentication-Secret': import.meta.env.VITE_SIMPLICATE_API_SECRET,
  },
});
