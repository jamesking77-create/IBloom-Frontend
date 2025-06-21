// ✅ src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASEURL,
  headers: {
    'Content-Type': 'application/json',
  },
   validateStatus: () => true,
});

// ✅ Named exports (not wrapped in an object)
export const get = (url, config = {}) => api.get(url, config);
export const post = (url, data, config = {}) => api.post(url, data, config);
export const put = (url, data, config = {}) => api.put(url, data, config);
export const del = (url, config = {}) => api.delete(url, config);

// Optional: export the instance too
export default api;
