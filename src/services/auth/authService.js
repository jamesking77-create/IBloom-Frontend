import { post } from '../../utils/api';

export const login = async (email, password) => {
  const response = await post('/api/auth/login', { email, password });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await post('/api/auth/forgotPassword', { email });
  return response.data;
};

export const resetPassword = async (token, password, confirmPassword) => {
  const response = await post(`/api/auth/resetPassword/${token}`, {
    password,
    confirmPassword,
  });
  return response.data;
};