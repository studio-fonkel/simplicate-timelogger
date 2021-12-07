import axiosPlugin from 'axios';

export const axios = axiosPlugin.create({
  baseURL: 'https://demofonkel.simplicate.nl/api/v2/',
  timeout: 3000,
  headers: {
    'Authentication-Key': import.meta.env.VITE_API_KEY,
    'Authentication-Secret': import.meta.env.VITE_API_SECRET,
  }
});
