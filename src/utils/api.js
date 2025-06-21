import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASEURL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: () => true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    
    return Promise.reject(error);
  }
);

export const get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    
    const errorMessage = response.data?.message || response.data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Request failed');
  }
};

export const post = async (url, data, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    
    const errorMessage = response.data?.message || response.data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Request failed');
  }
};

export const put = async (url, data, config = {}) => {
  try {
    const response = await api.put(url, data, config);
    
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    
    const errorMessage = response.data?.message || response.data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Request failed');
  }
};

export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config);
    
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    
    const errorMessage = response.data?.message || response.data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Request failed');
  }
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Basic JWT validation
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    return false;
  }
};
export default api;