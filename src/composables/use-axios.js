import axiosPlugin from 'axios';

let tenantURL = import.meta.env.VITE_SIMPLICATE_TENANT_BASE_URL;
if (!tenantURL) {
  throw new Error('VITE_SIMPLICATE_TENANT_BASE_URL is not defined');
}
if (!tenantURL.endsWith('/')) {
  tenantURL += '/';
}

const baseURL = `${tenantURL}/api/v2/`;

export const axios = axiosPlugin.create({
  baseURL,
  timeout: 3000,
  headers: {
    'Authentication-Key': import.meta.env.VITE_SIMPLICATE_API_KEY,
    'Authentication-Secret': import.meta.env.VITE_SIMPLICATE_API_SECRET,
  },
});
